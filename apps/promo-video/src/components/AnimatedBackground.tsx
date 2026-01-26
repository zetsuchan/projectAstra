import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { COLORS } from "../constants";

export const AnimatedBackground = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slow orbital rotation
  const rotation1 = interpolate(frame, [0, 120 * fps], [0, 360]);
  const rotation2 = interpolate(frame, [0, 90 * fps], [360, 0]);
  const rotation3 = interpolate(frame, [0, 40 * fps], [0, 360]);

  return (
    <AbsoluteFill>
      {/* Base gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 30%, ${COLORS.bgGlow} 0%, ${COLORS.bgDark} 70%)`,
        }}
      />

      {/* Orbital ring 1 */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 800,
          height: 800,
          marginLeft: -400,
          marginTop: -400,
          border: `1px solid ${COLORS.rose}20`,
          borderRadius: "50%",
          transform: `rotate(${rotation1}deg)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -4,
            left: "50%",
            width: 8,
            height: 8,
            marginLeft: -4,
            borderRadius: "50%",
            backgroundColor: COLORS.rose,
            boxShadow: `0 0 20px ${COLORS.rose}`,
          }}
        />
      </div>

      {/* Orbital ring 2 */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 1200,
          height: 1200,
          marginLeft: -600,
          marginTop: -600,
          border: `1px solid ${COLORS.lilac}15`,
          borderRadius: "50%",
          transform: `rotate(${rotation2}deg)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -5,
            left: "50%",
            width: 10,
            height: 10,
            marginLeft: -5,
            borderRadius: "50%",
            backgroundColor: COLORS.lilac,
            boxShadow: `0 0 25px ${COLORS.lilac}`,
          }}
        />
      </div>

      {/* Orbital ring 3 - faster */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 500,
          height: 500,
          marginLeft: -250,
          marginTop: -250,
          border: `1px solid ${COLORS.amber}10`,
          borderRadius: "50%",
          transform: `rotate(${rotation3}deg)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -3,
            left: "50%",
            width: 6,
            height: 6,
            marginLeft: -3,
            borderRadius: "50%",
            backgroundColor: COLORS.amber,
            boxShadow: `0 0 15px ${COLORS.amber}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
