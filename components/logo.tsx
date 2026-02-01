"use client";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
}

export function Logo({ className = "", size = "md", variant = "light" }: LogoProps) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const bgColor = variant === "light" ? "bg-white" : "bg-zinc-900";
  const strokeColor = variant === "light" ? "#000000" : "#ffffff";

  return (
    <div className={`${sizes[size]} ${bgColor} rounded-lg flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
      >
        {/* Medical cross with chart line */}
        <path
          d="M12 2v4M12 18v4M2 12h4M18 12h4"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Inner analysis chart wave */}
        <path
          d="M7 12h2l1.5-3 2 6 1.5-3H17"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Center circle */}
        <circle
          cx="12"
          cy="12"
          r="6"
          stroke={strokeColor}
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </div>
  );
}

export function LogoIcon({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Medical cross with chart line */}
      <path
        d="M12 2v4M12 18v4M2 12h4M18 12h4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Inner analysis chart wave */}
      <path
        d="M7 12h2l1.5-3 2 6 1.5-3H17"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Center circle */}
      <circle
        cx="12"
        cy="12"
        r="6"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}
