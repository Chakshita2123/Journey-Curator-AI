"use client";

import React, { useState, useEffect, useRef } from "react";

export interface MotionProps extends React.HTMLAttributes<HTMLDivElement> {
  initial?: Record<string, any> | false;
  animate?: Record<string, any>;
  whileInView?: Record<string, any>;
  whileHover?: Record<string, any>;
  whileTap?: Record<string, any>;
  transition?: {
    duration?: number;
    delay?: number;
    ease?: string | number[];
    type?: string;
    stiffness?: number;
    damping?: number;
  };
  viewport?: {
    once?: boolean;
    margin?: string;
    amount?: number;
  };
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function MotionDiv({
  initial,
  animate,
  whileInView,
  whileHover,
  whileTap,
  transition = { duration: 0.4, delay: 0 },
  viewport,
  children,
  className = "",
  style = {},
  onClick,
  ...props
}: MotionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(!whileInView);
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!whileInView || !ref.current || typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (viewport?.once) observer.disconnect();
        } else if (!viewport?.once) {
          setIsInView(false);
        }
      },
      { threshold: viewport?.amount ?? 0.15 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [whileInView, viewport]);

  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={className} style={style} onClick={onClick} {...props}>
        {children}
      </div>
    );
  }

  let currentTransform = "";
  let currentOpacity = 1;

  if (initial && typeof initial === "object") {
    if (initial.opacity !== undefined) currentOpacity = initial.opacity;
    if (initial.y !== undefined) currentTransform += `translateY(${initial.y}px) `;
    if (initial.x !== undefined) currentTransform += `translateX(${initial.x}px) `;
    if (initial.scale !== undefined) currentTransform += `scale(${initial.scale}) `;
    if (initial.rotate !== undefined) currentTransform += `rotate(${initial.rotate}deg) `;
    if (initial.rotateY !== undefined) currentTransform += `rotateY(${initial.rotateY}deg) `;
  }

  if (whileInView && isInView) {
    const target = animate || whileInView;
    if (target.opacity !== undefined) currentOpacity = target.opacity;
    if (target.y !== undefined) currentTransform = `translateY(${target.y}px) `;
    if (target.x !== undefined) currentTransform += `translateX(${target.x}px) `;
    if (target.scale !== undefined) currentTransform += `scale(${target.scale}) `;
    if (target.rotate !== undefined) currentTransform += `rotate(${target.rotate}deg) `;
    if (target.rotateY !== undefined) currentTransform += `rotateY(${target.rotateY}deg) `;
  } else if (!whileInView && animate) {
    if (animate.opacity !== undefined) currentOpacity = animate.opacity;
    if (animate.y !== undefined) currentTransform = `translateY(${animate.y}px) `;
    if (animate.x !== undefined) currentTransform += `translateX(${animate.x}px) `;
    if (animate.scale !== undefined) currentTransform += `scale(${animate.scale}) `;
    if (animate.rotate !== undefined) currentTransform += `rotate(${animate.rotate}deg) `;
    if (animate.rotateY !== undefined) currentTransform += `rotateY(${animate.rotateY}deg) `;
  }

  if (isHovered && whileHover) {
    if (whileHover.y !== undefined) currentTransform += `translateY(${whileHover.y}px) `;
    if (whileHover.scale !== undefined) currentTransform += `scale(${whileHover.scale}) `;
    if (whileHover.rotate !== undefined) currentTransform += `rotate(${whileHover.rotate}deg) `;
    if (whileHover.rotateY !== undefined) currentTransform += `rotateY(${whileHover.rotateY}deg) `;
  }

  if (isTapped && whileTap) {
    if (whileTap.scale !== undefined) currentTransform += `scale(${whileTap.scale}) `;
  }

  const duration = transition?.duration ?? 0.4;
  const delay = transition?.delay ?? 0;

  const combinedStyle: React.CSSProperties = {
    ...style,
    opacity: currentOpacity,
    transform: currentTransform.trim() || undefined,
    transition: `opacity ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, box-shadow 0.25s ease`,
    willChange: "transform, opacity",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={combinedStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsTapped(false);
      }}
      onMouseDown={() => setIsTapped(true)}
      onMouseUp={() => setIsTapped(false)}
      onTouchStart={() => setIsTapped(true)}
      onTouchEnd={() => setIsTapped(false)}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export const motion = {
  div: MotionDiv,
  section: MotionDiv,
  article: MotionDiv,
  h1: MotionDiv,
  h2: MotionDiv,
  h3: MotionDiv,
  p: MotionDiv,
  button: MotionDiv,
  span: MotionDiv,
  header: MotionDiv,
  footer: MotionDiv,
  nav: MotionDiv,
  ul: MotionDiv,
  li: MotionDiv,
  form: MotionDiv,
  main: MotionDiv,
};

export function AnimatePresence({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/**
 * Custom Soft Cursor Follower Glow
 */
export function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };
    const handleLeave = () => setVisible(false);

    window.addEventListener("mousemove", handleMove);
    document.body.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.body.removeEventListener("mouseleave", handleLeave);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 w-[420px] h-[420px] rounded-full z-40 transition-transform duration-100 ease-out hidden md:block"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`,
        background: "radial-gradient(circle, rgba(108, 92, 231, 0.14) 0%, rgba(0, 184, 148, 0.08) 40%, rgba(255, 151, 118, 0.04) 65%, transparent 80%)",
        filter: "blur(18px)",
      }}
    />
  );
}

/**
 * Animated Count-Up Number (0 -> Target)
 */
export function CountUpNumber({
  target,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current || typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 1200;
          const steps = 30;
          const increment = target / steps;
          const stepTime = duration / steps;
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, stepTime);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {prefix}
      {decimals > 0 ? count.toFixed(decimals) : Math.round(count).toLocaleString()}
      {suffix}
    </span>
  );
}

/**
 * Magnetic Pull Card (Subtly pulls towards mouse position on hover)
 */
export function MagneticCard({
  children,
  className = "",
  pullStrength = 6,
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  pullStrength?: number;
  style?: React.CSSProperties;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * pullStrength * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * pullStrength * 2;
    setOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      className={`transition-transform duration-200 ease-out ${className}`}
      style={{
        ...style,
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

/**
 * 3D Interactive Cursor-Following Tilt Card
 */
export function TiltCard({
  children,
  className = "",
  maxTilt = 7,
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  style?: React.CSSProperties;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)");
  const [shadow, setShadow] = useState("0 4px 20px rgba(45, 42, 74, 0.06)");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px) translateY(-6px)`);
    setShadow("0 16px 36px rgba(108, 92, 231, 0.18)");
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) translateY(0px)");
    setShadow("0 4px 20px rgba(45, 42, 74, 0.06)");
  };

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-300 ease-out ${className}`}
      style={{
        ...style,
        transform,
        boxShadow: shadow,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

/**
 * Smooth Animated Progress Bar (0% -> target value on scroll into view with leading edge glow)
 */
export function AnimatedProgressBar({
  progress,
  className = "h-2.5 rounded-full bg-[var(--color-bg)] border border-[var(--color-border-mid)] overflow-hidden",
  barClassName = "h-full rounded-full coral-gradient progress-glow-thumb",
  style = {},
}: {
  progress: number;
  className?: string;
  barClassName?: string;
  style?: React.CSSProperties;
}) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth(progress), 120);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [progress]);

  return (
    <div ref={ref} className={className} style={style}>
      <div
        className={`${barClassName} transition-all duration-1000 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

/**
 * Animated Loading State Card with floating compass/plane & pulsing gradient skeletons
 */
export function LoadingStateCard({ message = "AI Processing..." }: { message?: string }) {
  return (
    <div className="card p-8 max-w-xl w-full mx-auto text-center space-y-6 animate-fade-in shadow-coral">
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full coral-gradient opacity-20 animate-ping" />
        <div className="w-16 h-16 rounded-3xl coral-gradient flex items-center justify-center text-white shadow-coral animate-bounce">
          <span className="text-2xl animate-spin" style={{ animationDuration: "3.5s" }}>🧭</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <h3 className="font-heading font-700 text-xl text-[var(--color-text)] animate-pulse">{message}</h3>
        <p className="text-xs text-[var(--color-muted)]">Analyzing data points & generating AI predictions...</p>
      </div>

      <div className="space-y-3 pt-2">
        <div className="skeleton h-4 w-3/4 mx-auto rounded-lg" />
        <div className="skeleton h-3 w-1/2 mx-auto rounded-lg" />
        <div className="skeleton h-12 w-full rounded-2xl" />
      </div>
    </div>
  );
}

/**
 * Friendly Error State Card with Retry Action
 */
export function ErrorStateCard({
  title = "Connection Error",
  message = "Unable to connect to Journey Curator AI backend. Please make sure the backend service is active and try again.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="card p-8 max-w-xl w-full mx-auto text-center space-y-5 border-t-4 border-t-[var(--color-danger)] shadow-coral animate-pop-in">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--color-danger-light)] text-[var(--color-danger)] flex items-center justify-center text-2xl font-bold shadow-xs">
        ⚠️
      </div>
      <div className="space-y-1.5">
        <h3 className="font-heading font-700 text-xl text-[var(--color-text)]">{title}</h3>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed max-w-md mx-auto font-medium">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white btn-3d-primary btn-shimmer mx-auto"
        >
          <span>🔄</span> Try Again
        </button>
      )}
    </div>
  );
}
