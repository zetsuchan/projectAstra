import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, FONTS } from "../constants";

export const TaglineScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = ["She", "knows", "your", "entire", "history."];
  const secondLine = "Ask her anything.";

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
        }}
      >
        {/* First line - word by word */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 20,
          }}
        >
          {words.map((word, i) => {
            const delay = i * 6;
            const progress = spring({
              frame: frame - delay,
              fps,
              config: { damping: 15, stiffness: 100 },
            });

            const opacity = interpolate(progress, [0, 1], [0, 1]);
            const y = interpolate(progress, [0, 1], [40, 0]);

            return (
              <span
                key={i}
                style={{
                  fontFamily: FONTS.serif,
                  fontSize: 72,
                  fontStyle: "italic",
                  color: COLORS.textPrimary,
                  opacity,
                  transform: `translateY(${y}px)`,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Second line */}
        {(() => {
          const delay = words.length * 6 + 15;
          const progress = spring({
            frame: frame - delay,
            fps,
            config: { damping: 20, stiffness: 80 },
          });

          const opacity = interpolate(progress, [0, 1], [0, 1]);
          const scale = interpolate(progress, [0, 1], [0.9, 1]);

          return (
            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: 64,
                color: COLORS.rose,
                opacity,
                transform: `scale(${scale})`,
                textShadow: `0 0 40px ${COLORS.rose}50`,
              }}
            >
              {secondLine}
            </div>
          );
        })()}
      </div>
    </AbsoluteFill>
  );
};
