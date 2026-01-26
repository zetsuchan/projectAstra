import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, FONTS } from "../constants";

const moods = [
  { emoji: "😊", label: "happy", color: COLORS.amber },
  { emoji: "😰", label: "anxious", color: COLORS.violet },
  { emoji: "😌", label: "calm", color: COLORS.emerald },
  { emoji: "😤", label: "frustrated", color: COLORS.rose },
];

export const DiaryDemoScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entry text typing effect
  const entryText = "Feeling weirdly hopeful today after that conversation with mom. Maybe Mercury retrograde isn't all chaos.";
  const typedLength = Math.min(
    entryText.length,
    Math.floor(interpolate(frame, [30, 30 + entryText.length * 1.2], [0, entryText.length]))
  );

  // Selected mood
  const selectedMoodIndex = 2; // calm
  const moodSelectFrame = 30 + entryText.length * 1.2 + 20;

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
        Rolling Diary
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
        New Entry
      </div>
      <div
        style={{
          fontFamily: FONTS.sans,
          fontSize: 18,
          color: COLORS.textSecondary,
          marginBottom: 32,
        }}
      >
        Sun 26 • Mercury in Capricorn
      </div>

      {/* Entry card */}
      <div
        style={{
          backgroundColor: COLORS.bgCard,
          border: `1px solid ${COLORS.textMuted}20`,
          borderRadius: 24,
          padding: 28,
          marginBottom: 32,
        }}
      >
        {/* Typed text */}
        <div
          style={{
            fontFamily: FONTS.sans,
            fontSize: 24,
            color: COLORS.textPrimary,
            lineHeight: 1.6,
            minHeight: 120,
          }}
        >
          {entryText.slice(0, typedLength)}
          {typedLength < entryText.length && (
            <span
              style={{
                opacity: interpolate((frame % 30) / 30, [0, 0.5, 1], [1, 0, 1]),
                color: COLORS.rose,
              }}
            >
              |
            </span>
          )}
        </div>
      </div>

      {/* Mood selector */}
      <div
        style={{
          marginBottom: 40,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.sans,
            fontSize: 16,
            color: COLORS.textMuted,
            marginBottom: 16,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          How are you feeling?
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {moods.map((mood, i) => {
            const isSelected = i === selectedMoodIndex && frame > moodSelectFrame;

            const selectProgress = spring({
              frame: frame - moodSelectFrame,
              fps,
              config: { damping: 12 },
            });

            const scale = isSelected ? interpolate(selectProgress, [0, 1], [1, 1.1]) : 1;
            const borderColor = isSelected ? mood.color : `${COLORS.textMuted}30`;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  padding: 16,
                  borderRadius: 16,
                  border: `2px solid ${borderColor}`,
                  backgroundColor: isSelected ? `${mood.color}20` : "transparent",
                  transform: `scale(${scale})`,
                }}
              >
                <span style={{ fontSize: 36 }}>{mood.emoji}</span>
                <span
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: 14,
                    color: isSelected ? mood.color : COLORS.textSecondary,
                  }}
                >
                  {mood.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Reflection preview */}
      {(() => {
        const reflectionDelay = moodSelectFrame + 30;
        const progress = spring({
          frame: frame - reflectionDelay,
          fps,
          config: { damping: 20 },
        });

        const opacity = interpolate(progress, [0, 1], [0, 1]);
        const y = interpolate(progress, [0, 1], [20, 0]);

        return (
          <div
            style={{
              backgroundColor: `${COLORS.lilac}10`,
              border: `1px solid ${COLORS.lilac}30`,
              borderRadius: 20,
              padding: 24,
              opacity,
              transform: `translateY(${y}px)`,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.sans,
                fontSize: 14,
                color: COLORS.lilac,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 12,
              }}
            >
              ✨ Astra's Reflection
            </div>
            <div
              style={{
                fontFamily: FONTS.sans,
                fontSize: 18,
                color: COLORS.textSecondary,
                lineHeight: 1.5,
              }}
            >
              Mercury trine your natal Moon today—perfect for those heart-to-heart convos. Your calm energy is hitting different.
            </div>
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};
