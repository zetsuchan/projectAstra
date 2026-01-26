import { Composition, Folder } from "remotion";
import { AstraPromo } from "./AstraPromo";
import { PROMO_DURATION_FRAMES, VIDEO_FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from "./constants";

export const RemotionRoot = () => {
  return (
    <>
      <Folder name="Promo">
        <Composition
          id="AstraPromo"
          component={AstraPromo}
          durationInFrames={PROMO_DURATION_FRAMES}
          fps={VIDEO_FPS}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
        />
      </Folder>
    </>
  );
};
