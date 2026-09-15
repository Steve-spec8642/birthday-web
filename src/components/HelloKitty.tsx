import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import photo1 from "../assets/kitty/photo1.png";
import photo2 from "../assets/kitty/photo2.png";
import photo3 from "../assets/kitty/photo3.png";
import photo4 from "../assets/kitty/photo4.png";
import photo5 from "../assets/kitty/photo5.png";
import photo6 from "../assets/kitty/photo6.png";
import photo7 from "../assets/kitty/photo7.png";
import photo8 from "../assets/kitty/photo8.png";
import photo9 from "../assets/kitty/photo9.png";
import photo10 from "../assets/kitty/photo10.png";
import photo11 from "../assets/kitty/photo11.png";
import photo12 from "../assets/kitty/photo12.png";
import photo13 from "../assets/kitty/photo13.png";
import photo14 from "../assets/kitty/photo14.png";
import photo15 from "../assets/kitty/photo15.png";

const PHOTOS = [
  { src: photo1, caption: "Bright star, I wish I could stay steady like you are—" },
  { src: photo2, caption: "Not alone, hanging high in the night," },
  { src: photo3, caption: "Watching everything below without ever closing your eyes," },
  { src: photo4, caption: "Quiet and patient, never needing to sleep." },
  { src: photo5, caption: "Watching the ocean move along the shore," },
  { src: photo6, caption: "Washing over the earth again and again," },
  { src: photo7, caption: "Or looking down at fresh snow covering" },
  { src: photo8, caption: "The mountains and open fields." },
  { src: photo9, caption: "No—I'd rather stay right here, unchanged," },
  { src: photo10, caption: "Resting my head against my love's chest," },
  { src: photo11, caption: "Feeling her breathe slowly in and out," },
  { src: photo12, caption: "Awake forever in this beautiful kind of peace," },
  { src: photo13, caption: "Always listening to her soft, gentle breathing," },
  { src: photo14, caption: "And live like this forever—or lose myself in it completely." },
  { src: photo15, caption: "I love you so much baby 🎀" },
];

const HOLD_MS = 4000; // how long each photo stays on screen

export default function HelloKitty() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % PHOTOS.length);
    }, HOLD_MS);
    return () => clearInterval(id);
  }, []);

  const current = PHOTOS[index];

  return (
    <div className="max-w-xl mx-auto pt-4 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6"
      >
        <h2
          className="text-3xl md:text-4xl font-black mb-2"
          style={{
            fontFamily: "'Fredoka One', cursive",
            background: "linear-gradient(135deg, #ff3d8a, #ff6eb4, #c084fc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          A Little Trip Down Memory Lane 🐱
        </h2>
      </motion.div>

      <div
        className="glass-card relative overflow-hidden"
        style={{ aspectRatio: "1 / 1", boxShadow: "var(--glow-soft)" }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={current.src}
            alt={current.caption}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.2, ease: "easeInOut" },
              scale: { duration: HOLD_MS / 1000 + 1.2, ease: "easeOut" },
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.6 }}
          className="text-center mt-5 text-pink-500 font-semibold text-base md:text-lg"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          {current.caption}
        </motion.p>
      </AnimatePresence>

      <div className="flex justify-center gap-1.5 mt-5">
        {PHOTOS.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === index ? 18 : 6,
              height: 6,
              background: i === index ? "#ff6eb4" : "rgba(255,110,180,0.3)",
            }}
          />
        ))}
      </div>
    </div>
  );
}