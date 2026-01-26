import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, FONTS } from "../constants";

const features = [
  "AI that knows your chart",
  "Rolling diary with cosmic context",
  "Daily personalized feed",
  "Prediction markets for pop culture",
];

export const OutroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo pulse
  const logoPulse = spring({
    frame,
    fps,
    config: { damping: 8 },
  });

  const logoScale = interpolate(logoPulse, [0, 1], [0.8, 1]);

  // Feature list stagger
  const featureStagger = 20;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          marginBottom: 60,
          transform: `scale(${logoScale})`,
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 28,
            background: `linear-gradient(135deg, ${COLORS.rose}, ${COLORS.lilac})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 50px ${COLORS.rose}50`,
          }}
        >
          <span style={{ fontSize: 48 }}>✨</span>
        </div>
        <div
          style={{
            fontFamily: FONTS.serif,
            fontSize: 72,
            color: COLORS.textPrimary,
          }}
        >
          Astra
        </div>
      </div>

      {/* Features */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          marginBottom: 60,
        }}
      >
        {features.map((feature, i) => {
          const delay = 30 + i * featureStagger;
          const progress = spring({
            frame: frame - delay,
            fps,
            config: { damping: 15 },
          });

          const opacity = interpolate(progress, [0, 1], [0, 1]);
          const x = interpolate(progress, [0, 1], [-30, 0]);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity,
                transform: `translateX(${x}px)`,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: COLORS.rose,
                  boxShadow: `0 0 10px ${COLORS.rose}`,
                }}
              />
              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 24,
                  color: COLORS.textSecondary,
                }}
              >
                {feature}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      {(() => {
        const ctaDelay = 30 + features.length * featureStagger + 30;
        const progress = spring({
          frame: frame - ctaDelay,
          fps,
          config: { damping: 12, stiffness: 80 },
        });

        const opacity = interpolate(progress, [0, 1], [0, 1]);
        const scale = interpolate(progress, [0, 1], [0.9, 1]);

        // Glow pulse
        const glowIntensity = interpolate(
          Math.sin(((frame - ctaDelay) / fps) * 3),
          [-1, 1],
          [30, 60]
        );

        return (
          <div
            style={{
              opacity,
              transform: `scale(${scale})`,
            }}
          >
            <div
              style={{
                padding: "24px 48px",
                borderRadius: 999,
                background: `linear-gradient(135deg, ${COLORS.rose}, ${COLORS.violet})`,
                boxShadow: `0 0 ${glowIntensity}px ${COLORS.rose}80`,
                fontFamily: FONTS.sans,
                fontSize: 28,
                fontWeight: 600,
                color: "white",
                textAlign: "center",
              }}
            >
              Coming Soon
            </div>
          </div>
        );
      })()}

      {/* URL */}
      {(() => {
        const urlDelay = 30 + features.length * featureStagger + 60;
        const progress = spring({
          frame: frame - urlDelay,
          fps,
          config: { damping: 20 },
        });

        const opacity = interpolate(progress, [0, 1], [0, 0.6]);

        return (
          <div
            style={{
              position: "absolute",
              bottom: 100,
              fontFamily: FONTS.sans,
              fontSize: 20,
              color: COLORS.textMuted,
              opacity,
            }}
          >
            astra.app
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};
