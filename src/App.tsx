import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "./config";
import Background from "./components/Background";
import Countdown from "./components/Countdown";
import HelloKitty from "./components/HelloKitty";
import MiniGame from "./components/MiniGame";
import Leaderboard from "./components/Leaderboard";
import ChatWindow from "./components/ChatWindow";
import SoundToggle from "./components/SoundToggle";

const TABS = [
  { id: "countdown", label: "🎂 Birthday", emoji: "🎂" },
  { id: "kitty", label: "🐱 Kitty", emoji: "🐱" },
  { id: "game", label: "🎮 Game", emoji: "🎮" },
  { id: "scores", label: "🏆 Scores", emoji: "🏆" },
  { id: "chat", label: "💬 Chat", emoji: "💬" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("countdown");
  const [mounted, setMounted] = useState(false);
  const [scores, setScores] = useState<{ name: string; score: number; date: string }[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/highscores`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((row: any) => ({
          name: row.player_name,
          score: row.score,
          date: new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        }));
        setScores(formatted);
      })
      .catch((err) => console.error("Failed to fetch high scores:", err));
  }, []);

  const handleNewScore = async (score: number) => {
    const names = ["Player 🎀", "Star ⭐", "Bunny 🐰", "Cupcake 🧁", "Bow 🎀"];
    const name = names[Math.floor(Math.random() * names.length)];

    try {
      await fetch(`${API_URL}/api/highscores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: name, score }),
      });
      const res = await fetch(`${API_URL}/api/highscores`);
      const data = await res.json();
      const formatted = data.map((row: any) => ({
        name: row.player_name,
        score: row.score,
        date: new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      }));
      setScores(formatted);
    } catch (err) {
      console.error("Failed to submit score:", err);
    }
  };

  return (
    <div className="relative min-h-screen gradient-bg overflow-hidden">
      <Background />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -40 }}
        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative z-20 flex items-center justify-between px-4 md:px-8 pt-6 pb-2"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, -10, 10, -8, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-3xl md:text-4xl"
          >
            🎁
          </motion.div>
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold leading-none"
              style={{
                fontFamily: "'Fredoka One', cursive",
                background: "linear-gradient(135deg, #ff3d8a 0%, #ff6eb4 50%, #ff9dd1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Birthday Magic ✨
            </h1>
            <p className="text-xs md:text-sm text-pink-400 font-semibold mt-0.5">
              A celebration just for you 🌸
            </p>
          </div>
        </div>
        <SoundToggle />
      </motion.header>

      {/* Navigation Tabs */}
      <motion.nav
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative z-20 flex justify-center gap-2 px-4 py-4 flex-wrap"
      >
        {TABS.map((tab, i) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.07, type: "spring", stiffness: 400, damping: 15 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.92 }}
            className="relative px-4 md:px-5 py-2.5 rounded-full font-bold text-sm md:text-base transition-all duration-200 select-none"
            style={{
              fontFamily: "'Nunito', sans-serif",
              background:
                activeTab === tab.id
                  ? "linear-gradient(135deg, #ff3d8a 0%, #ff6eb4 100%)"
                  : "rgba(255,255,255,0.75)",
              color: activeTab === tab.id ? "white" : "#e0569a",
              border: activeTab === tab.id
                ? "2px solid transparent"
                : "2px solid rgba(255, 110, 180, 0.35)",
              boxShadow: activeTab === tab.id
                ? "0 4px 20px rgba(255, 61, 138, 0.45), 0 2px 8px rgba(255, 61, 138, 0.2)"
                : "0 2px 8px rgba(255, 110, 180, 0.15)",
              backdropFilter: "blur(12px)",
            }}
          >
            {activeTab === tab.id && (
              <motion.span
                layoutId="tab-glow"
                className="absolute inset-0 rounded-full"
                style={{ background: "rgba(255,255,255,0.15)" }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </motion.button>
        ))}
      </motion.nav>

      {/* Main Content */}
      <main className="relative z-10 px-4 md:px-8 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {activeTab === "countdown" && <Countdown />}
            {activeTab === "kitty" && <HelloKitty />}
            {activeTab === "game" && <MiniGame onScore={handleNewScore} />}
            {activeTab === "scores" && <Leaderboard scores={scores} />}
            {activeTab === "chat" && <ChatWindow />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}