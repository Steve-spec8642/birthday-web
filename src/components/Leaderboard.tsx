import { motion } from "framer-motion";

interface Score {
  name: string;
  score: number;
  date: string;
}

interface Props {
  scores: Score[];
}

const RANK_CONFIG = [
  { icon: "🥇", color: "#ffd700", bg: "linear-gradient(135deg, #fff9e6, #fff3c8)", border: "#ffd700" },
  { icon: "🥈", color: "#c0c0c0", bg: "linear-gradient(135deg, #f5f5f5, #e8e8e8)", border: "#c0c0c0" },
  { icon: "🥉", color: "#cd7f32", bg: "linear-gradient(135deg, #fff0e6, #ffe0c8)", border: "#cd7f32" },
];

function ScoreBar({ score, maxScore }: { score: number; maxScore: number }) {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  return (
    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,110,180,0.15)" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ background: "linear-gradient(90deg, #ff6eb4, #c084fc)" }}
      />
    </div>
  );
}

export default function Leaderboard({ scores }: Props) {
  const maxScore = scores.length > 0 ? scores[0].score : 0;

  return (
    <div className="max-w-2xl mx-auto pt-4 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
          className="text-5xl mb-3"
        >
          🏆
        </motion.div>
        <h2
          className="text-3xl md:text-4xl font-black mb-2"
          style={{
            fontFamily: "'Fredoka One', cursive",
            background: "linear-gradient(135deg, #ffd700, #ff6eb4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          High Scores
        </h2>
        <p className="text-pink-400 font-semibold">The birthday champions! 🌟</p>
      </motion.div>

      {/* Top 3 podium */}
      {scores.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-8">
          {[1, 0, 2].map((rank) => {
            const entry = scores[rank];
            if (!entry) return null;
            const cfg = RANK_CONFIG[rank];
            const heights = [100, 130, 85];

            return (
              <motion.div
                key={rank}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rank * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center gap-2"
                style={{ width: rank === 0 ? 110 : 90 }}
              >
                <div className="text-2xl">{cfg.icon}</div>
                <div
                  className="text-center px-3 py-2 rounded-2xl"
                  style={{ background: cfg.bg, border: `2px solid ${cfg.border}40` }}
                >
                  <div
                    className="text-lg font-black"
                    style={{ fontFamily: "'Fredoka One', cursive", color: cfg.color }}
                  >
                    {entry.score}
                  </div>
                  <div className="text-xs font-bold text-gray-500 truncate max-w-[80px]">
                    {entry.name}
                  </div>
                </div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: heights[rank] }}
                  transition={{ delay: 0.3 + rank * 0.1, duration: 0.6, ease: "easeOut" }}
                  className="w-full rounded-t-xl flex items-center justify-center"
                  style={{
                    background: cfg.bg,
                    border: `2px solid ${cfg.border}40`,
                    borderBottom: "none",
                  }}
                >
                  <span
                    className="text-xl font-black"
                    style={{ color: cfg.color, fontFamily: "'Fredoka One', cursive" }}
                  >
                    #{rank + 1}
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="glass-card overflow-hidden">
        {scores.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="text-5xl">🎈</div>
            <div
              className="text-xl font-black text-pink-400"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              No scores yet...
            </div>
            <p className="text-sm text-pink-300 font-semibold text-center px-8">
              Play the mini game to earn your spot on the leaderboard! 🎮
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div
              className="flex items-center gap-3 px-5 py-3 border-b"
              style={{
                background: "linear-gradient(135deg, rgba(255,110,180,0.15), rgba(192,132,252,0.15))",
                borderColor: "rgba(255,110,180,0.2)",
              }}
            >
              <span className="w-8 text-center text-xs font-black text-pink-400 uppercase tracking-widest">Rank</span>
              <span className="flex-1 text-xs font-black text-pink-400 uppercase tracking-widest">Player</span>
              <span className="text-xs font-black text-pink-400 uppercase tracking-widest">Score</span>
            </div>

            {scores.map((entry, i) => (
              <motion.div
                key={`${entry.name}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="flex items-center gap-3 px-5 py-3 border-b transition-all duration-200 hover:bg-pink-50/50"
                style={{ borderColor: "rgba(255,110,180,0.1)" }}
              >
                {/* Rank */}
                <div className="w-8 text-center">
                  {i < 3 ? (
                    <span className="text-lg">{RANK_CONFIG[i].icon}</span>
                  ) : (
                    <span
                      className="text-sm font-black text-pink-300"
                      style={{ fontFamily: "'Fredoka One', cursive" }}
                    >
                      #{i + 1}
                    </span>
                  )}
                </div>

                {/* Avatar + name */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                    style={{
                      background: `hsl(${(i * 67) % 360}, 60%, 90%)`,
                      border: "2px solid rgba(255,110,180,0.3)",
                    }}
                  >
                    {["🌸", "⭐", "🎀", "🍭", "💕", "🌈", "🎈", "🦋", "✨", "🩷"][i % 10]}
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-sm text-gray-700 truncate">{entry.name}</div>
                    <div className="text-xs text-pink-300 font-semibold">{entry.date}</div>
                  </div>
                  <ScoreBar score={entry.score} maxScore={maxScore} />
                </div>

                {/* Score */}
                <div
                  className="font-black text-pink-600 text-base shrink-0"
                  style={{ fontFamily: "'Fredoka One', cursive" }}
                >
                  {entry.score.toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Decorative floaters */}
      <div className="flex justify-center gap-3 mt-6">
        {["🎊", "🌟", "🎉", "✨", "🎊"].map((e, i) => (
          <motion.span
            key={i}
            className="text-xl"
            animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
          >
            {e}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
