import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, FONTS } from "../constants";

export const MarketsDemoScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Probability bar animation
  const barProgress = spring({
    frame: frame - 40,
    fps,
    config: { damping: 25 },
  });

  const yesWidth = interpolate(barProgress, [0, 1], [50, 73]);
  const noWidth = interpolate(barProgress, [0, 1], [50, 27]);

  return (
    <AbsoluteFill
      style={{
        padding: 40,
        paddingTop: 100,
      }}
    >
      {/* Scene label */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONTS.sans,
          fontSize: 18,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: COLORS.rose,
        }}
      >
        Prediction Markets
      </div>

      {/* Header */}
      <div
        style={{
          fontFamily: FONTS.serif,
          fontSize: 44,
          color: COLORS.textPrimary,
          marginBottom: 40,
        }}
      >
        Bet on the chaos
      </div>

      {/* Featured market card */}
      {(() => {
        const cardProgress = spring({
          frame: frame - 15,
          fps,
          config: { damping: 18 },
        });

        const opacity = interpolate(cardProgress, [0, 1], [0, 1]);
        const scale = interpolate(cardProgress, [0, 1], [0.95, 1]);

        return (
          <div
            style={{
              background: `linear-gradient(135deg, ${COLORS.bgCard}, ${COLORS.bgGlow})`,
              border: `2px solid ${COLORS.rose}40`,
              borderRadius: 28,
              padding: 32,
              marginBottom: 24,
              opacity,
              transform: `scale(${scale})`,
              boxShadow: `0 0 40px ${COLORS.rose}20`,
            }}
          >
            {/* Hot badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 999,
                backgroundColor: `${COLORS.rose}20`,
                fontFamily: FONTS.sans,
                fontSize: 14,
                fontWeight: 600,
                color: COLORS.rose,
                marginBottom: 16,
              }}
            >
              🔥 Hot Market
            </div>

            {/* Question */}
            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: 32,
                color: COLORS.textPrimary,
                marginBottom: 24,
                lineHeight: 1.3,
              }}
            >
              Will Timothée & Kylie make it past Valentine's Day?
            </div>

            {/* Probability bars */}
            <div style={{ marginBottom: 20 }}>
              {/* Yes bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: 16,
                    fontWeight: 600,
                    color: COLORS.emerald,
                    width: 40,
                  }}
                >
                  YES
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 32,
                    backgroundColor: `${COLORS.textMuted}20`,
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${yesWidth}%`,
                      height: "100%",
                      backgroundColor: COLORS.emerald,
                      borderRadius: 8,
                    }}
                  />
                </div>
                <div
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: 20,
                    fontWeight: 700,
                    color: COLORS.emerald,
                    width: 60,
                    textAlign: "right",
                  }}
                >
                  {Math.round(yesWidth)}%
                </div>
              </div>

              {/* No bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: 16,
                    fontWeight: 600,
                    color: COLORS.rose,
                    width: 40,
                  }}
                >
                  NO
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 32,
                    backgroundColor: `${COLORS.textMuted}20`,
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${noWidth}%`,
                      height: "100%",
                      backgroundColor: COLORS.rose,
                      borderRadius: 8,
                    }}
                  />
                </div>
                <div
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: 20,
                    fontWeight: 700,
                    color: COLORS.rose,
                    width: 60,
                    textAlign: "right",
                  }}
                >
                  {Math.round(noWidth)}%
                </div>
              </div>
            </div>

            {/* Volume */}
            <div
              style={{
                fontFamily: FONTS.sans,
                fontSize: 14,
                color: COLORS.textMuted,
              }}
            >
              $12.4k volume • 2.3k traders
            </div>
          </div>
        );
      })()}

      {/* Mini markets */}
      {(() => {
        const miniMarkets = [
          { q: "Taylor announces new album before March?", yes: 81 },
          { q: "Drake vs Kendrick collab happens?", yes: 12 },
        ];

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {miniMarkets.map((m, i) => {
              const delay = 60 + i * 20;
              const progress = spring({
                frame: frame - delay,
                fps,
                config: { damping: 18 },
              });

              const opacity = interpolate(progress, [0, 1], [0, 1]);
              const x = interpolate(progress, [0, 1], [40, 0]);

              return (
                <div
                  key={i}
                  style={{
                    backgroundColor: COLORS.bgCard,
                    border: `1px solid ${COLORS.textMuted}20`,
                    borderRadius: 16,
                    padding: 20,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    opacity,
                    transform: `translateX(${x}px)`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONTS.sans,
                      fontSize: 18,
                      color: COLORS.textPrimary,
                      flex: 1,
                    }}
                  >
                    {m.q}
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.sans,
                      fontSize: 20,
                      fontWeight: 700,
                      color: m.yes > 50 ? COLORS.emerald : COLORS.rose,
                    }}
                  >
                    {m.yes}%
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};
