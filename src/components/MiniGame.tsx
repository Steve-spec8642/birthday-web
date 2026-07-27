import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Item {
  id: number;
  x: number;
  y: number;
  emoji: string;
  speed: number;
  isGood: boolean;
  caught?: boolean;
}

const GOOD_ITEMS = ["🧁", "🎂", "🍭", "🎁", "🩷", "⭐", "🎈", "🍬", "🌸"];
const BAD_ITEMS = ["💀", "🥦", "🧅", "😈"];

const GAME_WIDTH = 340;
const GAME_HEIGHT = 320;
const CATCHER_W = 64;
const ITEM_SIZE = 36;

interface Props {
  onScore: (score: number) => void;
}

type GameState = "idle" | "playing" | "over";

export default function MiniGame({ onScore }: Props) {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [catcherX, setCatcherX] = useState(GAME_WIDTH / 2 - CATCHER_W / 2);
  const [items, setItems] = useState<Item[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [effects, setEffects] = useState<{ id: number; x: number; y: number; text: string }[]>([]);
  const [bestScore, setBestScore] = useState(0);

  const itemIdRef = useRef(0);
  const effectIdRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const lastSpawnRef = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const catcherXRef = useRef(catcherX);
  const scoreRef = useRef(score);
  const comboRef = useRef(combo);
  const livesRef = useRef(lives);
  const gameStateRef = useRef<GameState>("idle");

  useEffect(() => { catcherXRef.current = catcherX; }, [catcherX]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { comboRef.current = combo; }, [combo]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const addEffect = useCallback((x: number, y: number, text: string) => {
    const id = effectIdRef.current++;
    setEffects((e) => [...e, { id, x, y, text }]);
    setTimeout(() => setEffects((e) => e.filter((ef) => ef.id !== id)), 800);
  }, []);

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setCombo(0);
    setLives(3);
    setTimeLeft(30);
    setItems([]);
    setEffects([]);
    setCatcherX(GAME_WIDTH / 2 - CATCHER_W / 2);
    lastSpawnRef.current = 0;
  };

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameState("over");
          setBestScore((b) => Math.max(b, scoreRef.current));
          onScore(scoreRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [gameState, onScore]);

  // Mouse/Touch movement
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (gameStateRef.current !== "playing") return;
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = e.clientX - rect.left;
    const newX = Math.max(0, Math.min(GAME_WIDTH - CATCHER_W, relX - CATCHER_W / 2));
    setCatcherX(newX);
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== "playing") {
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const loop = (ts: number) => {
      if (gameStateRef.current !== "playing") return;

      // Spawn items
      const spawnInterval = Math.max(600, 1200 - scoreRef.current * 3);
      if (ts - lastSpawnRef.current > spawnInterval) {
        const isGood = Math.random() > 0.2;
        const pool = isGood ? GOOD_ITEMS : BAD_ITEMS;
        setItems((prev) => [
          ...prev,
          {
            id: itemIdRef.current++,
            x: ITEM_SIZE / 2 + Math.random() * (GAME_WIDTH - ITEM_SIZE),
            y: -ITEM_SIZE,
            emoji: pool[Math.floor(Math.random() * pool.length)],
            speed: 1.5 + Math.random() * 2 + scoreRef.current * 0.02,
            isGood,
          },
        ]);
        lastSpawnRef.current = ts;
      }

      // Move items + check collision
      setItems((prev) => {
        const keep: Item[] = [];
        for (const item of prev) {
          if (item.caught) continue;
          const newY = item.y + item.speed;

          // Check catch
          const catcherTop = GAME_HEIGHT - 56;
          const caught =
            newY + ITEM_SIZE / 2 >= catcherTop &&
            newY - ITEM_SIZE / 2 <= catcherTop + 20 &&
            item.x >= catcherXRef.current &&
            item.x <= catcherXRef.current + CATCHER_W;

          if (caught) {
            if (item.isGood) {
              const newCombo = comboRef.current + 1;
              const pts = newCombo >= 3 ? 20 : 10;
              setScore((s) => s + pts);
              setCombo(newCombo);
              addEffect(item.x, catcherTop, newCombo >= 3 ? `+${pts} COMBO! 🔥` : `+${pts} ✨`);
            } else {
              const newLives = livesRef.current - 1;
              livesRef.current = newLives;
              setLives(newLives);
              if (newLives <= 0) {
                setGameState("over");
                setBestScore((b) => Math.max(b, scoreRef.current));
                onScore(scoreRef.current);
              }
              setCombo(0);
              addEffect(item.x, catcherTop, "💀 Oops!");
            }
            continue; // don't keep
          }

          // Missed good item
          if (newY > GAME_HEIGHT + ITEM_SIZE && item.isGood) {
            setCombo(0);
          }

          if (newY < GAME_HEIGHT + ITEM_SIZE) {
            keep.push({ ...item, y: newY });
          }
        }
        return keep;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [gameState, addEffect, onScore]);

  return (
    <div className="max-w-3xl mx-auto pt-4 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2
          className="text-3xl md:text-4xl font-black mb-2"
          style={{
            fontFamily: "'Fredoka One', cursive",
            background: "linear-gradient(135deg, #ff6eb4, #c084fc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Catch the Treats! 🎮
        </h2>
        <p className="text-pink-400 font-semibold">Catch birthday treats, dodge the baddies!</p>
      </motion.div>

      {/* HUD */}
      {gameState === "playing" && (
        <div className="flex justify-center gap-4 mb-4 flex-wrap">
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <span
              className="text-xl font-black text-pink-600"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              {score}
            </span>
          </div>
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <span className="text-lg">❤️</span>
            <span className="font-black text-pink-500">
              {"🩷".repeat(Math.max(0, lives))}{"🤍".repeat(Math.max(0, 3 - lives))}
            </span>
          </div>
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <span className="text-lg">⏱️</span>
            <span
              className="text-xl font-black"
              style={{
                fontFamily: "'Fredoka One', cursive",
                color: timeLeft <= 10 ? "#ff3d8a" : "#c084fc",
              }}
            >
              {timeLeft}s
            </span>
          </div>
          {combo >= 2 && (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.3, repeat: Infinity }}
              className="glass-card px-4 py-2 flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, #ff3d8a22, #c084fc22)" }}
            >
              <span className="text-lg">🔥</span>
              <span
                className="font-black text-pink-600"
                style={{ fontFamily: "'Fredoka One', cursive" }}
              >
                {combo}x COMBO
              </span>
            </motion.div>
          )}
        </div>
      )}

      {/* Game area */}
      <div className="flex justify-center mb-6">
        <div
          ref={gameAreaRef}
          className="relative rounded-3xl overflow-hidden select-none"
          style={{
            width: GAME_WIDTH,
            height: GAME_HEIGHT,
            background: "linear-gradient(180deg, #ffd6e8 0%, #e8d5f5 50%, #d4eeff 100%)",
            border: "3px solid rgba(255,110,180,0.4)",
            cursor: gameState === "playing" ? "none" : "default",
            boxShadow: "0 8px 32px rgba(255,110,180,0.3)",
            touchAction: "none",
          }}
          onPointerMove={handlePointerMove}
        >
          {/* Background dots */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle, #ff9dd1 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Items */}
          {items.map((item) => (
            <div
              key={item.id}
              className="absolute text-3xl"
              style={{
                left: item.x - ITEM_SIZE / 2,
                top: item.y,
                width: ITEM_SIZE,
                height: ITEM_SIZE,
                textAlign: "center",
                lineHeight: `${ITEM_SIZE}px`,
                filter: item.isGood ? "none" : "hue-rotate(120deg)",
              }}
            >
              {item.emoji}
            </div>
          ))}

          {/* Effects */}
          {effects.map((ef) => (
            <motion.div
              key={ef.id}
              className="absolute pointer-events-none text-sm font-black whitespace-nowrap"
              style={{
                left: ef.x - 40,
                top: ef.y - 30,
                width: 80,
                textAlign: "center",
                color: ef.text.includes("Oops") ? "#ff3d8a" : "#ff6eb4",
                fontFamily: "'Fredoka One', cursive",
                zIndex: 10,
              }}
              initial={{ y: 0, opacity: 1, scale: 1 }}
              animate={{ y: -40, opacity: 0, scale: 1.4 }}
              transition={{ duration: 0.75 }}
            >
              {ef.text}
            </motion.div>
          ))}

          {/* Catcher */}
          {gameState === "playing" && (
            <motion.div
              className="absolute bottom-8 text-4xl flex items-center justify-center"
              style={{
                left: catcherX,
                width: CATCHER_W,
                height: 36,
                filter: "drop-shadow(0 2px 8px rgba(255,110,180,0.6))",
              }}
              animate={{ scaleX: [1, 1.05, 1] }}
              transition={{ duration: 0.3 }}
            >
              🎀
            </motion.div>
          )}

          {/* Overlays */}
          <AnimatePresence>
            {gameState === "idle" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                style={{ background: "rgba(255,240,247,0.85)", backdropFilter: "blur(4px)" }}
              >
                <div className="text-5xl">🧁</div>
                <div
                  className="text-2xl font-black text-pink-600 text-center px-4"
                  style={{ fontFamily: "'Fredoka One', cursive" }}
                >
                  Catch birthday treats!
                </div>
                <p className="text-sm text-pink-400 font-semibold text-center px-8">
                  Move your mouse to catch 🧁🎂🍭<br />Avoid 💀🥦 — they steal your lives!
                </p>
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={startGame}
                  className="shimmer-btn text-white font-black px-8 py-3 rounded-full text-lg shadow-lg"
                  style={{ fontFamily: "'Fredoka One', cursive" }}
                >
                  🎮 Start Game!
                </motion.button>
              </motion.div>
            )}

            {gameState === "over" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                style={{ background: "rgba(255,240,247,0.9)", backdropFilter: "blur(6px)" }}
              >
                <div className="text-5xl">{score >= 100 ? "🏆" : "🎀"}</div>
                <div
                  className="text-2xl font-black text-pink-600"
                  style={{ fontFamily: "'Fredoka One', cursive" }}
                >
                  {score >= 150 ? "Amazing! 🌟" : score >= 80 ? "Great job! ✨" : "Nice try! 🌸"}
                </div>
                <div className="glass-card px-8 py-4 text-center">
                  <div className="text-4xl font-black text-pink-500 mb-1" style={{ fontFamily: "'Fredoka One', cursive" }}>
                    {score}
                  </div>
                  <div className="text-sm text-pink-400 font-semibold">points scored</div>
                  {bestScore > 0 && (
                    <div className="text-xs text-purple-400 font-bold mt-1">
                      Best: {bestScore} 🏆
                    </div>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={startGame}
                  className="shimmer-btn text-white font-black px-7 py-2.5 rounded-full text-base shadow-lg"
                  style={{ fontFamily: "'Fredoka One', cursive" }}
                >
                  🔄 Play Again!
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tips */}
      <div className="glass-card p-4 flex flex-wrap justify-center gap-4 text-sm font-semibold">
        {[
          ["🧁", "+10 pts"],
          ["🔥", "Combo = +20"],
          ["💀", "-1 life"],
          ["⏱️", "30 seconds"],
        ].map(([e, t]) => (
          <div key={t} className="flex items-center gap-1.5 text-pink-500">
            <span className="text-base">{e}</span>
            <span>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
