import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Hello Kitty drawn with CSS/divs in 8-bit pixel style
// Each frame is a grid of colored pixels

const PINK = "#ff9dd1";
const WHITE = "#ffffff";
const BLACK = "#1a1a2e";
const YELLOW = "#ffd700";
const RED = "#ff3d8a";
const NONE = "transparent";

// Pixel grid: 16x16
// 0=none, 1=white, 2=pink, 3=black, 4=yellow, 5=red
const IDLE_FRAME: number[][] = [
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,3,3,1,1,1,1,1,1,3,3,1,1,0],
  [0,1,1,3,3,1,1,1,1,1,1,3,3,1,1,0],
  [4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4],
  [0,1,1,1,1,1,3,1,1,3,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,3,3,1,1,1,1,1,1,0],
  [0,0,1,1,2,2,1,1,1,1,2,2,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,2,2,2,1,1,2,2,2,0,0,0,0],
  [0,0,0,0,0,2,1,1,1,1,2,0,0,0,0,0],
  [0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0],
  [0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0],
];

// Wave frame - bow moved, one arm up
const WAVE_FRAME: number[][] = [
  [0,0,0,0,0,5,5,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,1,5,5,1,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,3,3,1,1,1,1,1,1,3,3,1,1,0],
  [0,1,1,3,3,1,1,1,1,1,1,3,3,1,1,0],
  [4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4],
  [0,1,1,1,1,1,3,1,1,3,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,2,2,1,1,1,1,1,1,0],
  [0,0,1,1,2,2,1,1,1,1,2,2,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,2,2,2,1,1,2,2,2,0,0,0,0],
  [0,0,0,0,0,2,1,1,1,1,2,0,0,0,0,0],
  [0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0],
  [0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0],
];

const COLOR_MAP: Record<number, string> = {
  0: NONE,
  1: WHITE,
  2: PINK,
  3: BLACK,
  4: YELLOW,
  5: RED,
};

const ANIMATIONS = ["idle", "wave", "jump", "dance"] as const;
type AnimState = typeof ANIMATIONS[number];

const ANIM_LABELS: Record<AnimState, string> = {
  idle: "😊 Idle",
  wave: "👋 Waving",
  jump: "🌟 Jumping",
  dance: "💃 Dancing",
};

interface KittyPixelProps {
  frame: number[][];
  scale?: number;
}
function KittyPixel({ frame, scale = 3 }: KittyPixelProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(16, ${scale * 4}px)`,
        gridTemplateRows: `repeat(16, ${scale * 4}px)`,
        imageRendering: "pixelated",
        gap: 0,
      }}
    >
      {frame.flatMap((row, ri) =>
        row.map((cell, ci) => (
          <div
            key={`${ri}-${ci}`}
            style={{
              width: scale * 4,
              height: scale * 4,
              background: COLOR_MAP[cell] ?? NONE,
            }}
          />
        ))
      )}
    </div>
  );
}

function PixelSparkle({ x, y }: { x: number; y: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none text-xl"
      style={{ left: x, top: y }}
      initial={{ scale: 0, opacity: 1, rotate: 0 }}
      animate={{ scale: [0, 1.5, 0], opacity: [1, 1, 0], rotate: [0, 180, 360] }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      ✨
    </motion.div>
  );
}

export default function HelloKitty() {
  const [anim, setAnim] = useState<AnimState>("idle");
  const [frameIdx, setFrameIdx] = useState(0);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [sparkleId, setSparkleId] = useState(0);
  const [blinking, setBlinking] = useState(false);

  // Auto-animate frame cycling
  useEffect(() => {
    const speed = anim === "dance" ? 200 : anim === "jump" ? 150 : 600;
    const id = setInterval(() => setFrameIdx((f) => (f + 1) % 2), speed);
    return () => clearInterval(id);
  }, [anim]);

  // Blink every few seconds
  useEffect(() => {
    const id = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 200);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const addSparkle = () => {
    const x = 40 + Math.random() * 160;
    const y = 20 + Math.random() * 200;
    const id = sparkleId;
    setSparkleId((s) => s + 1);
    setSparkles((s) => [...s, { id, x, y }]);
    setTimeout(() => setSparkles((s) => s.filter((sp) => sp.id !== id)), 900);
  };

  const currentFrame = frameIdx === 0 ? IDLE_FRAME : WAVE_FRAME;

  const kittyTransform: Record<AnimState, object> = {
    idle: { y: [0, -4, 0] },
    wave: { y: [0, -6, 0], rotate: [0, 3, -3, 0] },
    jump: { y: [0, -20, 0, -14, 0] },
    dance: { x: [0, 6, 0, -6, 0], rotate: [0, 5, 0, -5, 0] },
  };

  return (
    <div className="max-w-3xl mx-auto pt-4 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2
          className="text-3xl md:text-4xl font-black mb-2"
          style={{
            fontFamily: "'Fredoka One', cursive",
            background: "linear-gradient(135deg, #ff3d8a, #c084fc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Hello Kitty 8-Bit ✨
        </h2>
        <p className="text-pink-400 font-semibold">
          A tiny retro world just for you 🎮🌸
        </p>
      </motion.div>

      {/* Game area */}
      <div className="glass-card p-6 md:p-10 mb-6">
        <div
          className="relative rounded-2xl overflow-hidden flex items-center justify-center mx-auto"
          style={{
            width: "100%",
            maxWidth: 340,
            height: 280,
            background: "linear-gradient(135deg, #ffd6e8 0%, #e8d5f5 50%, #d4eeff 100%)",
            border: "3px solid rgba(255,110,180,0.4)",
            boxShadow: "inset 0 2px 8px rgba(255,110,180,0.2)",
          }}
        >
          {/* Pixel background decorations */}
          {["🌸", "⭐", "💕", "🌈", "✨"].map((e, i) => (
            <div
              key={i}
              className="absolute text-lg opacity-30"
              style={{
                left: `${10 + i * 18}%`,
                top: `${15 + (i % 2) * 50}%`,
                animation: `float ${3 + i}s ease-in-out infinite ${i * 0.5}s`,
              }}
            >
              {e}
            </div>
          ))}

          {/* Pixel floor */}
          <div
            className="absolute bottom-0 left-0 right-0 h-8"
            style={{
              background: "repeating-linear-gradient(90deg, #ffb8e0 0px, #ffb8e0 16px, #ff9dd1 16px, #ff9dd1 32px)",
              opacity: 0.5,
            }}
          />

          {/* Kitty */}
          <motion.div
            animate={kittyTransform[anim]}
            transition={{ duration: anim === "jump" ? 0.6 : 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative cursor-pointer"
            onClick={addSparkle}
            style={{ filter: blinking ? "brightness(1.2)" : "none" }}
          >
            <div style={{ filter: "drop-shadow(0 4px 16px rgba(255,61,138,0.4))" }}>
              <KittyPixel frame={currentFrame} scale={4} />
            </div>
          </motion.div>

          {/* Sparkles */}
          {sparkles.map((sp) => (
            <PixelSparkle key={sp.id} x={sp.x} y={sp.y} />
          ))}

          {/* Click hint */}
          <div
            className="absolute bottom-2 right-3 text-xs font-bold text-pink-400 opacity-60 pixel-font"
          >
            tap to sparkle ✨
          </div>
        </div>
      </div>

      {/* Animation selector */}
      <div className="glass-card p-5">
        <h3
          className="text-center text-lg font-black text-pink-600 mb-4"
          style={{ fontFamily: "'Fredoka One', cursive" }}
        >
          Choose Animation 🎬
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {ANIMATIONS.map((a) => (
            <motion.button
              key={a}
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setAnim(a)}
              className="px-5 py-2.5 rounded-full font-bold text-sm"
              style={{
                fontFamily: "'Nunito', sans-serif",
                background:
                  anim === a
                    ? "linear-gradient(135deg, #ff3d8a, #c084fc)"
                    : "rgba(255,255,255,0.8)",
                color: anim === a ? "white" : "#e0569a",
                border: "2px solid rgba(255,110,180,0.3)",
                boxShadow: anim === a ? "0 4px 16px rgba(255,61,138,0.4)" : "none",
              }}
            >
              {ANIM_LABELS[a]}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Pixel hearts row */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -6, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
            className="text-xl md:text-2xl"
          >
            🩷
          </motion.div>
        ))}
      </div>
    </div>
  );
}
