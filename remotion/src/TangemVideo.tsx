import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import React from "react";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import cardData from "./data/card.json";
import ringData from "./data/ring.json";
import { Card, Env, Ring } from "./three-objects";
import { Background, Captions, Chips, CTA, Header, Headline, Phone, SceneData } from "./ui";

const T = 12; // transition frames
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} camera={{ fov: 30, position: [0, 0, 6] }} gl={{ alpha: true, antialias: true }}>
      <Env />
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} />
      <directionalLight position={[-4, -1, 3]} intensity={0.6} color="#b9a4ff" />
      <pointLight position={[0, -2, 2]} intensity={2} color="#2be6a0" distance={6} />
      {children}
    </ThreeCanvas>
  );
};

/* ---------- RING scenes ---------- */
const RingHero: React.FC<{ y?: number; s?: number }> = ({ y = 0.12, s = 0.6 }) => {
  const f = useCurrentFrame();
  return (
    <Stage>
      <Ring
        position={[0, y + Math.sin(f / 20) * 0.03, 0]}
        rotation={[0.42 + Math.sin(f / 35) * 0.08, f / 45, 0.22]}
        scale={interpolate(f, [0, 25], [s * 0.6, s], { ...cl, easing: ease })}
      />
    </Stage>
  );
};

const RingTap: React.FC<{ touch: number }> = ({ touch }) => {
  const f = useCurrentFrame();
  const x = interpolate(f, [8, touch], [1.5, 0.17], { ...cl, easing: ease });
  const y = interpolate(f, [8, touch], [-0.9, 0.42], { ...cl, easing: ease });
  return (
    <>
      <Phone left={70} top={560} signedAt={touch + 10} />
      <Stage>
        <Ring position={[x, y, 0.6]} rotation={[0.5, 0.4 + f / 60, 0.6]} scale={0.3} />
      </Stage>
    </>
  );
};

const RingCards: React.FC = () => {
  const f = useCurrentFrame();
  const spread = interpolate(f, [6, 34], [0, 1], { ...cl, easing: ease });
  return (
    <Stage>
      <Card position={[-0.32 * spread, 0.32, -0.3]} rotation={[-0.25, 0.25, 0.22 * spread]} scale={0.55} variant={1} />
      <Card position={[0.32 * spread, 0.32, -0.2]} rotation={[-0.25, -0.25, -0.22 * spread]} scale={0.55} variant={1} />
      <Ring position={[0, -0.25 + Math.sin(f / 18) * 0.03, 0.6]} rotation={[0.45, f / 50, 0.2]} scale={0.38} />
    </Stage>
  );
};

/* ---------- CARD scenes ---------- */
const CardHero: React.FC<{ y?: number; s?: number; spin?: boolean }> = ({ y = 0.12, s = 0.95, spin = true }) => {
  const f = useCurrentFrame();
  return (
    <Stage>
      <Card
        position={[0, y + Math.sin(f / 20) * 0.03, 0]}
        rotation={[-0.2 + Math.sin(f / 30) * 0.08, spin ? interpolate(f, [0, 40], [Math.PI * 1.5, Math.PI * 2], { ...cl, easing: ease }) + Math.sin(f / 25) * 0.25 : Math.sin(f / 25) * 0.3, 0.08]}
        scale={interpolate(f, [0, 25], [s * 0.6, s], { ...cl, easing: ease })}
      />
    </Stage>
  );
};

const CardTap: React.FC<{ touch: number }> = ({ touch }) => {
  const f = useCurrentFrame();
  const x = interpolate(f, [8, touch], [1.7, 0.22], { ...cl, easing: ease });
  const y = interpolate(f, [8, touch], [-1.0, 0.3], { ...cl, easing: ease });
  return (
    <>
      <Phone left={70} top={560} signedAt={touch + 10} />
      <Stage>
        <Card position={[x, y, 0.5]} rotation={[-0.3, -0.45, 0.35]} scale={0.48} />
      </Stage>
    </>
  );
};

const CardSet: React.FC = () => {
  const f = useCurrentFrame();
  const sp = interpolate(f, [6, 36], [0, 1], { ...cl, easing: ease });
  return (
    <Stage>
      <Card position={[-0.35 * sp, 0.15 + 0.05 * sp, -0.4]} rotation={[-0.3, 0.3, 0.3 * sp]} scale={0.62} variant={1} />
      <Card position={[0.35 * sp, 0.15 + 0.05 * sp, -0.3]} rotation={[-0.3, -0.3, -0.3 * sp]} scale={0.62} variant={1} />
      <Card position={[0, 0.0, 0.2]} rotation={[-0.3 + Math.sin(f / 25) * 0.05, Math.sin(f / 30) * 0.15, 0]} scale={0.66} variant={0} />
    </Stage>
  );
};

/* ---------- assembly ---------- */
const Scene: React.FC<{ d: SceneData; children?: React.ReactNode; headlineTop?: number; hideHeadline?: boolean }> = ({
  d,
  children,
  headlineTop,
  hideHeadline,
}) => (
  <AbsoluteFill>
    <Background />
    {children}
    {hideHeadline ? null : <Headline text={d.headline} top={headlineTop} />}
    <Header />
    <Captions captions={d.captions} />
  </AbsoluteFill>
);

const DISCLAIMER =
  "#ad – affiliate link. Self-custody means you are responsible for your backup. Not investment advice.";

export const TangemVideo: React.FC<{ kind: "ring" | "card" }> = ({ kind }) => {
  const data = (kind === "ring" ? ringData : cardData).scenes as SceneData[];
  const dur = (i: number) => data[i].frames + (i < data.length - 1 ? T : 0);
  const sc =
    kind === "ring"
      ? [
          <Scene key={0} d={data[0]}><RingHero /></Scene>,
          <Scene key={1} d={data[1]}><RingTap touch={60} /></Scene>,
          <Scene key={2} d={data[2]}>
            <RingHero y={0.35} s={0.34} />
            <Chips items={["No battery", "No cables", "Water resistant"]} top={1020} startFrames={[14, 30, 46]} />
          </Scene>,
          <Scene key={3} d={data[3]}><RingCards /></Scene>,
          <Scene key={4} d={data[4]} hideHeadline>
            <RingHero y={0.88} s={0.27} />
            <CTA title="Tangem Ring" sub="Get yours with our link" top={760} disclaimer={DISCLAIMER} />
          </Scene>,
        ]
      : [
          <Scene key={0} d={data[0]}><CardHero /></Scene>,
          <Scene key={1} d={data[1]}><CardHero spin={false} /></Scene>,
          <Scene key={2} d={data[2]}><CardTap touch={55} /></Scene>,
          <Scene key={3} d={data[3]}><CardSet /></Scene>,
          <Scene key={4} d={data[4]} hideHeadline>
            <CardHero y={0.95} s={0.5} spin={false} />
            <CTA title="Tangem Wallet" sub="10% off with our link" top={760} disclaimer={DISCLAIMER} />
          </Scene>,
        ];
  const pres = [slide({ direction: "from-right" }), fade(), slide({ direction: "from-bottom" }), fade()];
  return (
    <AbsoluteFill style={{ backgroundColor: "#120a2e" }}>
      <TransitionSeries>
        {sc.map((el, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Sequence name={`Scene ${i + 1}`} durationInFrames={dur(i)}>
              {el}
            </TransitionSeries.Sequence>
            {i < sc.length - 1 ? (
              <TransitionSeries.Transition presentation={pres[i]} timing={linearTiming({ durationInFrames: T })} />
            ) : null}
          </React.Fragment>
        ))}
      </TransitionSeries>
      <Audio src={staticFile(`${kind}_vo.wav`)} />
    </AbsoluteFill>
  );
};

export const totalFrames = (kind: "ring" | "card") => (kind === "ring" ? ringData : cardData).total;
