import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  speed: number;
  size: number;
  emoji: string;
  drift: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const EMOJIS = [
  "🎈", "🎈", "🎈", "🎀", "🎀", "⭐", "✨", "💕", "🌸", "🎊",
  "🩷", "🌟", "💖", "🎁", "🧁", "🍭", "🌈", "🦋", "💫", "🎉",
];

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Spawn particles
    const spawnParticle = (): Particle => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 30,
      speed: 0.4 + Math.random() * 0.7,
      size: 14 + Math.random() * 14,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      drift: (Math.random() - 0.5) * 0.4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      opacity: 0.5 + Math.random() * 0.5,
    });

    // Initial particles spread across screen
    particlesRef.current = Array.from({ length: 18 }, () => ({
      ...spawnParticle(),
      y: Math.random() * window.innerHeight,
    }));

    let spawnTimer = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      spawnTimer++;
      if (spawnTimer > 80 && particlesRef.current.length < 25) {
        particlesRef.current.push(spawnParticle());
        spawnTimer = 0;
      }

      particlesRef.current = particlesRef.current.filter((p) => p.y > -60);

      particlesRef.current.forEach((p) => {
        p.y -= p.speed;
        p.x += p.drift;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <>
      {/* Soft blurred blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute rounded-full opacity-40"
          style={{
            width: 600,
            height: 600,
            top: "-100px",
            left: "-150px",
            background: "radial-gradient(circle, #ffb8e0 0%, transparent 70%)",
            animation: "floatSlow 12s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full opacity-30"
          style={{
            width: 500,
            height: 500,
            bottom: "-100px",
            right: "-100px",
            background: "radial-gradient(circle, #e8d5f5 0%, transparent 70%)",
            animation: "floatSlow 15s ease-in-out infinite reverse",
          }}
        />
        <div
          className="absolute rounded-full opacity-25"
          style={{
            width: 400,
            height: 400,
            top: "40%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "radial-gradient(circle, #ffd4e0 0%, transparent 70%)",
            animation: "floatSlow 10s ease-in-out infinite 2s",
          }}
        />
      </div>
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />
    </>
  );
}
