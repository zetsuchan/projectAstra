import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, FONTS } from "../constants";

const feedItems = [
  {
    type: "personal",
    title: "Mercury enters your 7th house",
    subtitle: "Communication in relationships gets clearer today",
    badge: "Your Transit",
    badgeColor: COLORS.lilac,
  },
  {
    type: "tea",
    title: "Chappell Roan's chart SCREAMS diva",
    subtitle: "Sun conjunct Pluto? The intensity makes sense",
    badge: "The Tea",
    badgeColor: COLORS.rose,
  },
  {
    type: "prompt",
    title: "Journal prompt for your Moon",
    subtitle: "What makes you feel emotionally safe?",
    badge: "Weekly",
    badgeColor: COLORS.amber,
  },
];

export const FeedDemoScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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
        Cosmic Feed
      </div>

      {/* Header */}
      <div
        style={{
          fontFamily: FONTS.serif,
          fontSize: 48,
          color: COLORS.textPrimary,
          marginBottom: 8,
        }}
      >
        Today's Cosmic Tea
      </div>
      <div
        style={{
          fontFamily: FONTS.sans,
          fontSize: 20,
          color: COLORS.textSecondary,
          marginBottom: 40,
        }}
      >
        January 26, 2026
      </div>

      {/* Feed cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {feedItems.map((item, i) => {
          const delay = 20 + i * 25;
          const progress = spring({
            frame: frame - delay,
            fps,
            config: { damping: 18, stiffness: 100 },
          });

          const opacity = interpolate(progress, [0, 1], [0, 1]);
          const x = interpolate(progress, [0, 1], [60, 0]);

          return (
            <div
              key={i}
              style={{
                backgroundColor: COLORS.bgCard,
                border: `1px solid ${COLORS.textMuted}20`,
                borderRadius: 20,
                padding: 24,
                opacity,
                transform: `translateX(${x}px)`,
              }}
            >
              {/* Badge */}
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  borderRadius: 999,
                  backgroundColor: `${item.badgeColor}20`,
                  fontFamily: FONTS.sans,
                  fontSize: 14,
                  fontWeight: 600,
                  color: item.badgeColor,
                  marginBottom: 12,
                }}
              >
                {item.badge}
              </div>

              {/* Title */}
              <div
                style={{
                  fontFamily: FONTS.serif,
                  fontSize: 28,
                  color: COLORS.textPrimary,
                  marginBottom: 8,
                }}
              >
                {item.title}
              </div>

              {/* Subtitle */}
              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 18,
                  color: COLORS.textSecondary,
                  lineHeight: 1.4,
                }}
              >
                {item.subtitle}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll hint */}
      {(() => {
        const delay = 20 + feedItems.length * 25 + 30;
        const progress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 20 },
        });

        const opacity = interpolate(progress, [0, 1], [0, 0.6]);
        const y = interpolate(
          (frame - delay) % 60,
          [0, 30, 60],
          [0, 10, 0]
        );

        return (
          <div
            style={{
              position: "absolute",
              bottom: 100,
              left: "50%",
              transform: `translateX(-50%) translateY(${y}px)`,
              opacity,
              fontFamily: FONTS.sans,
              fontSize: 16,
              color: COLORS.textMuted,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>↓</span>
            <span>Scroll for more</span>
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};
