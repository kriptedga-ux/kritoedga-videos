import { Composition } from "remotion";
import { TangemVideo, totalFrames } from "./TangemVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TangemRing"
        component={TangemVideo}
        durationInFrames={totalFrames("ring")}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ kind: "ring" as const }}
      />
      <Composition
        id="TangemCard"
        component={TangemVideo}
        durationInFrames={totalFrames("card")}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ kind: "card" as const }}
      />
    </>
  );
};
