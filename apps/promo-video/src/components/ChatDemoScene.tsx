import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, FONTS } from "../constants";

const messages = [
  {
    type: "user",
    text: "why do i keep falling for emotionally unavailable people?",
  },
  {
    type: "ai",
    text: "Ah, the eternal question. With your Venus in Aquarius opposing your Moon in Leo, you crave both freedom AND dramatic devotion. You're drawn to people who seem independent because that feels safe...",
  },
  {
    type: "ai",
    text: "But then your Leo Moon is like 'wait, worship me though?' 💀",
  },
];

export const ChatDemoScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header slide in
  const headerY = spring({
    frame,
    fps,
    config: { damping: 20 },
  });

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
          opacity: interpolate(headerY, [0, 1], [0, 1]),
        }}
      >
        AI Chat
      </div>

      {/* Chat header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 40,
          transform: `translateY(${interpolate(headerY, [0, 1], [-30, 0])}px)`,
          opacity: headerY,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: `linear-gradient(135deg, ${COLORS.rose}, ${COLORS.lilac})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 32 }}>✨</span>
        </div>
        <div>
          <div
            style={{
              fontFamily: FONTS.sans,
              fontSize: 28,
              fontWeight: 600,
              color: COLORS.textPrimary,
            }}
          >
            Astra
          </div>
          <div
            style={{
              fontFamily: FONTS.sans,
              fontSize: 16,
              color: COLORS.emerald,
            }}
          >
            Online & Judging
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {messages.map((msg, i) => {
          const delay = 30 + i * 40;
          const progress = spring({
            frame: frame - delay,
            fps,
            config: { damping: 15, stiffness: 80 },
          });

          const opacity = interpolate(progress, [0, 1], [0, 1]);
          const y = interpolate(progress, [0, 1], [30, 0]);

          const isUser = msg.type === "user";

          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
                opacity,
                transform: `translateY(${y}px)`,
              }}
            >
              <div
                style={{
                  maxWidth: "85%",
                  padding: "20px 24px",
                  borderRadius: isUser ? "24px 24px 8px 24px" : "24px 24px 24px 8px",
                  backgroundColor: isUser ? COLORS.violet : COLORS.bgCard,
                  border: isUser ? "none" : `1px solid ${COLORS.textMuted}30`,
                  fontFamily: FONTS.sans,
                  fontSize: 22,
                  lineHeight: 1.5,
                  color: COLORS.textPrimary,
                }}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Typing indicator */}
      {(() => {
        const delay = 30 + messages.length * 40 + 20;
        const progress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 20 },
        });

        const opacity = interpolate(progress, [0, 1], [0, 1]);

        const dotDelay = (i: number) => {
          // Stagger each dot by offset, use sine wave for smooth bounce
          const cycleProgress = ((frame - delay) % 45) / 45;
          const offset = i * 0.15;
          const adjusted = (cycleProgress + offset) % 1;
          return Math.sin(adjusted * Math.PI);
        };

        return (
          <div
            style={{
              display: "flex",
              gap: 8,
              padding: "16px 24px",
              marginTop: 20,
              opacity,
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: COLORS.lilac,
                  opacity: 0.5 + dotDelay(i) * 0.5,
                  transform: `translateY(${dotDelay(i) * -6}px)`,
                }}
              />
            ))}
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};
