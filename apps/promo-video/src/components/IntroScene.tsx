import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, FONTS } from "../constants";

export const IntroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo scale animation
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Sparkle rotation
  const sparkleRotation = interpolate(frame, [0, 4 * fps], [0, 360]);

  // Text fade in after logo
  const textOpacity = interpolate(frame, [1.5 * fps, 2.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textY = interpolate(frame, [1.5 * fps, 2.5 * fps], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Logo container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          transform: `scale(${logoScale})`,
        }}
      >
        {/* Sparkle icon */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 32,
            background: `linear-gradient(135deg, ${COLORS.rose}, ${COLORS.lilac})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 60px ${COLORS.rose}50`,
            transform: `rotate(${sparkleRotation}deg)`,
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
            <path d="M5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1z" opacity="0.6" />
            <path d="M19 5l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5L17 6l1.5-.5.5-1.5z" opacity="0.6" />
          </svg>
        </div>

        {/* Logo text */}
        <div
          style={{
            fontFamily: FONTS.serif,
            fontSize: 96,
            fontWeight: 400,
            color: COLORS.textPrimary,
            letterSpacing: "-0.02em",
          }}
        >
          Astra
        </div>
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          bottom: 300,
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.sans,
            fontSize: 28,
            color: COLORS.textSecondary,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
          }}
        >
          Your AI Astrology Companion
        </div>
      </div>
    </AbsoluteFill>
  );
};
