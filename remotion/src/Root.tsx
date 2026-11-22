import { Composition } from "remotion";
import { TangemVideo, totalFrames } from "./TangemVideo";
import { BybitVideo, bybitFrames } from "./BybitVideo";
import { PromoVideo, promoFrames } from "./PromoVideo";
import { TVVideo, tvFrames } from "./TVVideo";

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
      <Composition id="BybitSignup" component={BybitVideo} durationInFrames={bybitFrames("signup")} fps={30} width={1080} height={1920} defaultProps={{ kind: "signup" as const }} />
      <Composition id="BybitTradfi" component={BybitVideo} durationInFrames={bybitFrames("tradfi")} fps={30} width={1080} height={1920} defaultProps={{ kind: "tradfi" as const }} />
      <Composition id="Promo" component={PromoVideo} durationInFrames={promoFrames} fps={30} width={1080} height={1920} />
      <Composition id="TradingView" component={TVVideo} durationInFrames={tvFrames} fps={30} width={1080} height={1920} />
    </>
  );
};
