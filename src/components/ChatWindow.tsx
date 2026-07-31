import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../config";

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  ts: Date;
}

const SUGGESTIONS = [
  "Make a birthday wish 🌟",
  "Tell me about cake! 🎂",
  "Best party ideas? 🎉",
  "Say happy birthday! 🩷",
];

let msgId = 0;

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: msgId++,
      role: "assistant",
      text: "Hi there! 🌸✨ I'm Kira, your magical Birthday Assistant! Ask me anything about birthdays, wishes, cake, parties — or just say hello! 🎂💕",
      ts: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;

    setInput("");
    const userMsg: Message = { id: msgId++, role: "user", text: msg, ts: new Date() };
    setMessages((m) => [...m, userMsg]);

    setTyping(true);
    try {
      const res = await fetch(`${API_URL}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setTyping(false);
      const reply = data.reply || "Sorry, I'm having trouble thinking right now! 🌸";
      setMessages((m) => [...m, { id: msgId++, role: "assistant", text: reply, ts: new Date() }]);
    } catch (err) {
      setTyping(false);
      setMessages((m) => [...m, { id: msgId++, role: "assistant", text: "Oops, I couldn't connect! Try again? 💕", ts: new Date() }]);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-4 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2
          className="text-3xl md:text-4xl font-black mb-2"
          style={{
            fontFamily: "'Fredoka One', cursive",
            background: "linear-gradient(135deg, #c084fc, #ff6eb4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Ask Kira ✨
        </h2>
        <p className="text-pink-400 font-semibold">Your magical birthday assistant 🌸</p>
      </motion.div>

      {/* Chat window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="glass-card overflow-hidden"
        style={{ boxShadow: "0 8px 40px rgba(192,132,252,0.25)" }}
      >
        {/* Chat header */}
        <div
          className="flex items-center gap-3 px-5 py-4 border-b"
          style={{
            background: "linear-gradient(135deg, rgba(255,110,180,0.15), rgba(192,132,252,0.2))",
            borderColor: "rgba(255,110,180,0.2)",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
            style={{
              background: "linear-gradient(135deg, #ff6eb4, #c084fc)",
              boxShadow: "0 0 16px rgba(255,110,180,0.4)",
            }}
          >
            🐱
          </motion.div>
          <div>
            <div className="font-black text-pink-600" style={{ fontFamily: "'Fredoka One', cursive" }}>
              Kira the Birthday Cat
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-500 font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Always Online ✨
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex flex-col gap-4 px-4 py-5 overflow-y-auto"
          style={{ height: 360 }}
        >
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {msg.role === "assistant" && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0 mt-1"
                    style={{ background: "linear-gradient(135deg, #ff6eb4, #c084fc)" }}
                  >
                    🐱
                  </div>
                )}
                <div
                  className="max-w-[78%] px-4 py-3 rounded-2xl text-sm font-semibold leading-relaxed"
                  style={
                    msg.role === "user"
                      ? {
                          background: "linear-gradient(135deg, #ff3d8a, #ff6eb4)",
                          color: "white",
                          borderBottomRightRadius: 4,
                          boxShadow: "0 4px 12px rgba(255,61,138,0.3)",
                        }
                      : {
                          background: "rgba(255,255,255,0.9)",
                          color: "#b03878",
                          borderBottomLeftRadius: 4,
                          border: "1.5px solid rgba(255,110,180,0.25)",
                          boxShadow: "0 2px 8px rgba(255,110,180,0.1)",
                        }
                  }
                >
                  {msg.text}
                  <div
                    className="text-right text-[10px] mt-1 opacity-60"
                  >
                    {msg.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {typing && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex items-center gap-2"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
                  style={{ background: "linear-gradient(135deg, #ff6eb4, #c084fc)" }}
                >
                  🐱
                </div>
                <div
                  className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    border: "1.5px solid rgba(255,110,180,0.25)",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{ background: "#ff9dd1" }}
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        <div
          className="px-4 pb-3 flex flex-wrap gap-2 border-t pt-3"
          style={{ borderColor: "rgba(255,110,180,0.15)" }}
        >
          {SUGGESTIONS.map((s) => (
            <motion.button
              key={s}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendMessage(s)}
              className="px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: "rgba(255,182,213,0.2)",
                color: "#e0569a",
                border: "1.5px solid rgba(255,110,180,0.3)",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              {s}
            </motion.button>
          ))}
        </div>

        {/* Input */}
        <div
          className="flex gap-2 px-4 py-3 border-t"
          style={{ borderColor: "rgba(255,110,180,0.15)" }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about birthdays, wishes, cake... 🎂"
            className="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold outline-none"
            style={{
              background: "rgba(255,240,247,0.8)",
              border: "2px solid rgba(255,110,180,0.3)",
              color: "#b03878",
              fontFamily: "'Nunito', sans-serif",
            }}
          />
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.88 }}
            onClick={() => sendMessage()}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 disabled:opacity-40"
            style={{
              background: input.trim()
                ? "linear-gradient(135deg, #ff3d8a, #ff6eb4)"
                : "rgba(255,182,213,0.3)",
              boxShadow: input.trim() ? "0 4px 12px rgba(255,61,138,0.35)" : "none",
            }}
          >
            {input.trim() ? "🚀" : "💬"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}