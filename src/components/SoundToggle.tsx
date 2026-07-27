import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function SoundToggle() {
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem("birthday-muted") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("birthday-muted", String(muted));
    } catch {}
  }, [muted]);

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.88 }}
      onClick={() => setMuted((m) => !m)}
      className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm select-none"
      style={{
        background: "rgba(255,255,255,0.75)",
        border: "2px solid rgba(255, 110, 180, 0.35)",
        color: "#e0569a",
        backdropFilter: "blur(12px)",
        boxShadow: "0 2px 8px rgba(255,110,180,0.15)",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <motion.span
        key={muted ? "muted" : "unmuted"}
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="text-lg"
      >
        {muted ? "🔇" : "🔊"}
      </motion.span>
      <span className="hidden md:inline">{muted ? "Muted" : "Sound"}</span>
    </motion.button>
  );
}
