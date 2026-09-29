"use client";

import React, { useEffect, useRef } from "react";

interface ShiningParticleCanvasProps {
  isAccelerating?: boolean;
  particleCount?: number;
  accentColor?: string; // e.g. '#06b6d4' for cyan or '#fbbf24' for amber
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  originVx: number;
  originVy: number;
  size: number;
  baseAlpha: number;
  currentAlpha: number;
  glow: number;
  mass: number;
  swirlOffset: number;
}

export const ShiningParticleCanvas: React.FC<ShiningParticleCanvasProps> = ({
  isAccelerating = false,
  particleCount = 2000,
  accentColor = "#06b6d4",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Use refs for animation variables to avoid re-renders and ensure rock-solid 60 FPS
  const mouseRef = useRef({
    x: -1000,
    y: -1000,
    prevX: -1000,
    prevY: -1000,
    vx: 0,
    vy: 0,
    isHovered: false,
  });

  const accelMultiplierRef = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", handleResize);

    // Initialize Particle Swarm
    const particles: Particle[] = [];
    const count = Math.min(particleCount, Math.floor((width * height) / 800));

    for (let i = 0; i < count; i++) {
      const vx = (Math.random() - 0.5) * 0.45;
      const vy = (Math.random() - 0.5) * 0.45;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx,
        vy,
        originVx: vx,
        originVy: vy,
        size: Math.random() * 1.3 + 0.7, // 0.7px to 2.0px tiny micro-dots
        baseAlpha: Math.random() * 0.25 + 0.1, // 0.10 to 0.35 ambient opacity
        currentAlpha: 0.15,
        glow: 0,
        mass: Math.random() * 0.8 + 0.6,
        swirlOffset: Math.random() * Math.PI * 2,
      });
    }

    // Cursor tracking
    const handleMouseMove = (e: MouseEvent) => {
      const mouse = mouseRef.current;
      mouse.vx = e.clientX - (mouse.prevX === -1000 ? e.clientX : mouse.prevX);
      mouse.vy = e.clientY - (mouse.prevY === -1000 ? e.clientY : mouse.prevY);
      mouse.prevX = e.clientX;
      mouse.prevY = e.clientY;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.isHovered = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.isHovered = false;
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
      mouseRef.current.prevX = -1000;
      mouseRef.current.prevY = -1000;
      mouseRef.current.vx = 0;
      mouseRef.current.vy = 0;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Color definitions
    const isAmber = accentColor.toLowerCase().includes("fbbf24") || accentColor.toLowerCase().includes("amber");
    const baseR = isAmber ? 251 : 6;
    const baseG = isAmber ? 191 : 182;
    const baseB = isAmber ? 36 : 212;

    // Animation Loop
    let lastTime = performance.now();

    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Handle Acceleration State (Warp-Speed / Quantum Acceleration)
      const targetMultiplier = isAccelerating ? 6.5 : 1.0;
      accelMultiplierRef.current += (targetMultiplier - accelMultiplierRef.current) * (isAccelerating ? 0.08 : 0.04);
      const accel = accelMultiplierRef.current;

      // Mouse velocity damping
      mouseRef.current.vx *= 0.92;
      mouseRef.current.vy *= 0.92;

      // Clear Screen with deep obsidian backdrop
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)"; // subtle trail persistence in void
      ctx.fillRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const mouseRadius = 175; // Proximity threshold for the "shining" effect
      const mouseRadiusSq = mouseRadius * mouseRadius;

      // Separate passes: Ambient swarm batch vs Shining Bloom batch
      const shiningParticles: Particle[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Fluid Cursor Physics: Attraction, Magnetic Swirl, and Momentum
        if (mouse.isHovered && mouse.x > -500) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < mouseRadiusSq) {
            const dist = Math.sqrt(distSq);
            const proximity = 1 - dist / mouseRadius; // 0 (edge) to 1 (center)

            // Shining Effect: Spikes opacity to 100% and activates bloom
            p.currentAlpha = p.baseAlpha + (1.0 - p.baseAlpha) * Math.pow(proximity, 1.2);
            p.glow = proximity;

            // Fluid Magnetic Swirl & Gentle Attraction
            const angle = Math.atan2(dy, dx);
            const attractionForce = (proximity * 0.45) / p.mass;
            const tangentialForce = (proximity * 0.65) / p.mass;

            // Pull gently toward cursor
            p.vx += Math.cos(angle) * attractionForce;
            p.vy += Math.sin(angle) * attractionForce;

            // Swirl around cursor (vortex physics)
            p.vx += -Math.sin(angle) * tangentialForce;
            p.vy += Math.cos(angle) * tangentialForce;

            // Transfer kinetic momentum from moving cursor
            p.vx += mouse.vx * 0.018 * proximity;
            p.vy += mouse.vy * 0.018 * proximity;

            shiningParticles.push(p);
          } else {
            // Decay shine back to calm ambient starlight
            p.currentAlpha += (p.baseAlpha - p.currentAlpha) * 0.08;
            p.glow = Math.max(0, p.glow - 0.05);
          }
        } else {
          p.currentAlpha += (p.baseAlpha - p.currentAlpha) * 0.08;
          p.glow = Math.max(0, p.glow - 0.05);
        }

        // Apply velocities with acceleration factor
        p.x += p.vx * accel;
        p.y += p.vy * accel;

        // Velocity damping back to baseline organic drift
        p.vx = p.vx * 0.98 + p.originVx * 0.02;
        p.vy = p.vy * 0.98 + p.originVy * 0.02;

        // Wrap around boundaries seamlessly
        if (p.x < -10) p.x = width + 10;
        else if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        else if (p.y > height + 10) p.y = -10;

        // Fast ambient rendering for non-shining particles
        if (p.glow <= 0.05) {
          ctx.fillStyle = `rgba(${baseR}, ${baseG}, ${baseB}, ${p.currentAlpha})`;
          ctx.beginPath();
          if (accel > 2.0) {
            // Hyper-drive streaks when accelerating
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * accel * 1.5, p.y - p.vy * accel * 1.5);
            ctx.strokeStyle = `rgba(${baseR}, ${baseG}, ${baseB}, ${p.currentAlpha * 0.8})`;
            ctx.lineWidth = p.size * 0.8;
            ctx.stroke();
          } else {
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Second Pass: Render Shining Bloom Aura for particles near cursor
      if (shiningParticles.length > 0) {
        ctx.save();
        for (let i = 0; i < shiningParticles.length; i++) {
          const sp = shiningParticles[i];

          // Bloom glow aura
          ctx.shadowBlur = sp.glow * 14;
          ctx.shadowColor = `rgba(${baseR}, ${baseG}, ${baseB}, ${sp.glow * 0.95})`;

          // Bright pure core with radiant halo
          ctx.fillStyle = `rgba(255, 255, 255, ${sp.currentAlpha})`;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size * (1 + sp.glow * 0.7), 0, Math.PI * 2);
          ctx.fill();

          // Outer colored bloom ring
          ctx.fillStyle = `rgba(${baseR}, ${baseG}, ${baseB}, ${sp.glow * 0.85})`;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size * (1.8 + sp.glow * 1.2), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [particleCount, isAccelerating, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 w-full h-full bg-black block"
      style={{
        zIndex: -1,
        transform: "translate3d(0, 0, 0)",
      }}
    />
  );
};
