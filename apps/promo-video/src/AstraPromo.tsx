import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";

import { IntroScene } from "./components/IntroScene";
import { TaglineScene } from "./components/TaglineScene";
import { ChatDemoScene } from "./components/ChatDemoScene";
import { FeedDemoScene } from "./components/FeedDemoScene";
import { DiaryDemoScene } from "./components/DiaryDemoScene";
import { MarketsDemoScene } from "./components/MarketsDemoScene";
import { OutroScene } from "./components/OutroScene";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { COLORS, SCENE_DURATIONS, VIDEO_FPS } from "./constants";

const TRANSITION_DURATION = 15; // frames

export const AstraPromo = () => {
  const s = (seconds: number) => seconds * VIDEO_FPS;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bgDark,
        overflow: "hidden",
      }}
    >
      <AnimatedBackground />

      <TransitionSeries>
        {/* Intro - Logo reveal */}
        <TransitionSeries.Sequence durationInFrames={s(SCENE_DURATIONS.intro)}>
          <IntroScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Tagline */}
        <TransitionSeries.Sequence durationInFrames={s(SCENE_DURATIONS.tagline)}>
          <TaglineScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Chat Demo */}
        <TransitionSeries.Sequence durationInFrames={s(SCENE_DURATIONS.chatDemo)}>
          <ChatDemoScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Feed Demo */}
        <TransitionSeries.Sequence durationInFrames={s(SCENE_DURATIONS.feedDemo)}>
          <FeedDemoScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Diary Demo */}
        <TransitionSeries.Sequence durationInFrames={s(SCENE_DURATIONS.diaryDemo)}>
          <DiaryDemoScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Markets Demo */}
        <TransitionSeries.Sequence durationInFrames={s(SCENE_DURATIONS.marketsDemo)}>
          <MarketsDemoScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Outro - CTA */}
        <TransitionSeries.Sequence durationInFrames={s(SCENE_DURATIONS.outro)}>
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
