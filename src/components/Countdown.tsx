import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../config";

function calcTime(targetDate: Date) {
  const diff = Math.max(0, targetDate.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    done: diff === 0,
  };
}

// Clean odometer-style digit roll — old digit slides down & fades,
// new digit slides in from top, both locked in a fixed clipped box
// so they can never overlap or glitch.
function Digit({ value }: { value: string }) {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        width: "0.62em",
        height: "1.15em",
        overflow: "hidden",
      }}
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          initial={{ y: "-100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.34, 1.1, 0.64, 1] }}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const FLOAT_DURATIONS = [3.2, 3.8, 3.5, 4.0]; // fixed per card, never random

interface UnitCardProps {
  value: number;
  label: string;
  emoji: string;
  floatDuration: number;
}
function UnitCard({ value, label, emoji, floatDuration }: UnitCardProps) {
  const digits = String(value).padStart(2, "0").split("");

  return (
    <motion.div
      animate={{ y: [0, -7, 0] }}
      transition={{ duration: floatDuration, repeat: Infinity, ease: "easeInOut" }}
      className="glass-card flex flex-col items-center px-4 md:px-8 py-5 md:py-7 gap-1"
      style={{
        minWidth: 100,
        boxShadow: "var(--glow-soft), 0 2px 0 rgba(255,255,255,0.9) inset",
      }}
    >
      <div
        className="text-5xl md:text-7xl font-black tabular-nums leading-none flex"
        style={{
          fontFamily: "'Fredoka One', cursive",
          background: "linear-gradient(135deg, #ff3d8a 0%, #ff6eb4 50%, #ff9dd1 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        <Digit value={digits[0]} />
        <Digit value={digits[1]} />
      </div>
      <div className="text-lg">{emoji}</div>
      <div
        className="text-xs md:text-sm font-bold uppercase tracking-widest text-pink-400"
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        {label}
      </div>
    </motion.div>
  );
}

export default function Countdown() {
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [time, setTime] = useState(calcTime(new Date()));

  useEffect(() => {
    fetch(`${API_URL}/api/countdown`)
      .then((res) => res.json())
      .then((data) => setTargetDate(new Date(data.targetDate)))
      .catch((err) => console.error("Failed to fetch countdown date:", err));
  }, []);

  useEffect(() => {
    if (!targetDate) return;
    setTime(calcTime(targetDate));
    const id = setInterval(() => setTime(calcTime(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <div className="max-w-3xl mx-auto pt-4 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="text-center mb-8"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-5xl md:text-7xl mb-4"
        >
          🎂
        </motion.div>
        <h2
          className="text-3xl md:text-5xl font-black mb-2"
          style={{
            fontFamily: "'Fredoka One', cursive",
            background: "linear-gradient(135deg, #ff3d8a, #ff6eb4, #c084fc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {time.done ? "Happy Birthday! 🎉" : "Birthday Countdown"}
        </h2>
        <p className="text-pink-400 font-semibold text-base md:text-lg">
          {time.done
            ? "Today is the magical day! 🌟✨"
            : "Until the most magical day of the year ✨"}
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-3 md:gap-5 mb-10">
        <UnitCard value={time.days}    label="Days"    emoji="☀️" floatDuration={FLOAT_DURATIONS[0]} />
        <UnitCard value={time.hours}   label="Hours"   emoji="⏰" floatDuration={FLOAT_DURATIONS[1]} />
        <UnitCard value={time.minutes} label="Minutes" emoji="⌛" floatDuration={FLOAT_DURATIONS[2]} />
        <UnitCard value={time.seconds} label="Seconds" emoji="✨" floatDuration={FLOAT_DURATIONS[3]} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { emoji: "🌸", title: "Make a Wish", desc: "Close your eyes, make a wish, and blow out the candles! Every wish deserves to come true.", color: "#ffd6e8" },
          { emoji: "🎀", title: "Spread Joy", desc: "This is YOUR special day. Dance, laugh, eat cake, and celebrate everything wonderful about you!", color: "#e8d5f5" },
          { emoji: "🧁", title: "Sweet Moments", desc: "May this birthday be filled with cake, love, laughter, and all your favorite things!", color: "#d4eeff" },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
            whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(255,110,180,0.25)" }}
            className="glass-card p-5 text-center cursor-default"
            style={{ background: `linear-gradient(135deg, ${card.color}99, rgba(255,255,255,0.8))` }}
          >
            <div className="text-3xl mb-3">{card.emoji}</div>
            <h3
              className="text-lg font-black mb-2 text-pink-600"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              {card.title}
            </h3>
            <p className="text-sm text-pink-500 leading-relaxed font-semibold">{card.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}