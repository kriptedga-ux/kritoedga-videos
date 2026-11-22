import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import promoData from "./data/promo.json";
import { Background, Captions, FONT, GREEN, Header, Headline, SceneData, YELLOW } from "./ui";

const T = 12;
const RED = "#F6465D";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const inAt = (f: number, s: number, dy = 40) => ({
  opacity: interpolate(f, [s, s + 10], [0, 1], cl),
  translate: interpolate(f, [s, s + 16], [`0px ${dy}px`, "0px 0px"], { ...cl, easing: ease }),
});

const Spark: React.FC<{ seed: string; up: boolean; f: number; w?: number }> = ({ seed, up, f, w = 220 }) => {
  const n = 28;
  const pts = [...Array(n)].map((_, i) => {
    const trend = (up ? 1 : -1) * i * 1.2;
    const v = 40 + trend + Math.sin(i / 2.5 + random(seed) * 6) * 8 + (random(`${seed}${i}`) - 0.5) * 10;
    return `${(i * w) / (n - 1)},${80 - v}`;
  });
  const k = Math.max(2, Math.floor(n * interpolate(f, [0, 30], [0, 1], cl)));
  return (
    <svg width={w} height={90} style={{ overflow: "visible" }}>
      <polyline points={pts.slice(0, k).join(" ")} fill="none" stroke={up ? GREEN : RED} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

const Tickers: React.FC = () => {
  const f = useCurrentFrame();
  const t = [
    { n: "BTC", up: true },
    { n: "ETH", up: false },
    { n: "GOLD", up: true },
    { n: "S&P 500", up: true },
  ];
  return (
    <div style={{ position: "absolute", top: 640, left: 100, right: 100, display: "flex", flexDirection: "column", gap: 22 }}>
      {t.map((x, i) => (
        <div
          key={i}
          style={{
            ...inAt(f, 14 + i * 7, 0),
            translate: interpolate(f, [14 + i * 7, 30 + i * 7], [i % 2 ? "-300px 0px" : "300px 0px", "0px 0px"], { ...cl, easing: ease }),
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(255,255,255,0.07)",
            borderRadius: 26,
            padding: "18px 34px",
            fontFamily: FONT,
          }}
        >
          <div style={{ fontSize: 54, fontWeight: 700, color: "white", width: 260 }}>{x.n}</div>
          <Spark seed={x.n} up={x.up} f={f - 14 - i * 7} />
          <div style={{ fontSize: 60, color: x.up ? GREEN : RED, width: 60, textAlign: "right" }}>{x.up ? "▲" : "▼"}</div>
        </div>
      ))}
    </div>
  );
};

const Daily: React.FC = () => {
  const f = useCurrentFrame();
  const items = [
    { i: "₿", t: "Crypto news", s: "The biggest moves, verified", at: 22 },
    { i: "◎", t: "Economy brief", s: "Fed, inflation, jobs – every morning", at: 46 },
    { i: "▥", t: "Market wrap", s: "Gold, S&P 500, Nasdaq – nightly", at: 82 },
  ];
  return (
    <div style={{ position: "absolute", top: 520, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 28 }}>
      {items.map((x, k) => (
        <div key={k} style={{ ...inAt(f, x.at), display: "flex", alignItems: "center", gap: 30, background: "rgba(255,255,255,0.07)", border: "3px solid rgba(255,210,63,0.55)", borderRadius: 30, padding: "28px 34px", fontFamily: FONT }}>
          <div style={{ width: 110, height: 110, borderRadius: 55, background: YELLOW, color: "#1a1030", fontSize: 64, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{x.i}</div>
          <div>
            <div style={{ fontSize: 52, fontWeight: 700, color: "white" }}>{x.t}</div>
            <div style={{ fontSize: 30, color: "rgba(255,255,255,0.7)" }}>{x.s}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Feed: React.FC = () => {
  const f = useCurrentFrame();
  const posts = [
    { tag: "CRYPTO", h: "Bitcoin ETF flows: what changed this week", c: "#7C4DFF" },
    { tag: "ECONOMY", h: "Inflation data: 3 numbers that matter", c: GREEN },
    { tag: "MARKETS", h: "Gold, stocks & the dollar – daily wrap", c: YELLOW },
    { tag: "CRYPTO", h: "Ethereum upgrade explained in 60 seconds", c: "#7C4DFF" },
  ];
  const scroll = interpolate(f, [20, 110], [0, -260], { ...cl, easing: Easing.inOut(Easing.cubic) });
  return (
    <>
      <div style={{ position: "absolute", left: 290, top: 470, width: 500, height: 840, borderRadius: 66, background: "#0a0a0f", border: "6px solid #3b3b48", boxShadow: "0 40px 90px rgba(0,0,0,0.6)", padding: 18, ...inAt(f, 0, 140) }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 50, background: "#140c2c", overflow: "hidden", position: "relative", fontFamily: FONT }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "30px 26px 18px", background: "#140c2c", position: "relative", zIndex: 2 }}>
            <Img src={staticFile("logo.png")} style={{ width: 56, height: 56, borderRadius: 28 }} />
            <div style={{ color: "white", fontWeight: 700, fontSize: 26 }}>Krito Edga News</div>
          </div>
          <div style={{ translate: `0px ${scroll}px`, padding: "0 22px", display: "flex", flexDirection: "column", gap: 18 }}>
            {posts.map((p, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 22, padding: 20 }}>
                <div style={{ height: 130, borderRadius: 14, background: `linear-gradient(135deg, ${p.c}55, #1d1240)`, marginBottom: 14, display: "flex", alignItems: "flex-end", padding: 12 }}>
                  <span style={{ fontSize: 18, fontWeight: 700, background: p.c, color: "#120a2e", borderRadius: 8, padding: "2px 10px" }}>{p.tag}</span>
                </div>
                <div style={{ color: "white", fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>{p.h}</div>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 18, marginTop: 8 }}>Sources linked · 1 min read</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 1330, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontSize: 40, fontWeight: 700, color: YELLOW, ...inAt(f, 60) }}>
        No hype. No "get rich quick".
      </div>
    </>
  );
};

const Platforms: React.FC = () => {
  const f = useCurrentFrame();
  const p = ["Telegram", "Instagram", "Facebook", "X", "Threads", "Bluesky", "LinkedIn"];
  const starts = [8, 18, 30, 40, 48, 58, 70];
  return (
    <div style={{ position: "absolute", top: 610, left: 80, right: 80, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24 }}>
      {p.map((n, i) => (
        <div
          key={i}
          style={{
            opacity: interpolate(f, [starts[i], starts[i] + 8], [0, 1], cl),
            scale: interpolate(f, [starts[i], starts[i] + 14], [0.5, 1], { ...cl, easing: ease }),
            fontFamily: FONT,
            fontSize: 50,
            fontWeight: 700,
            color: i === 0 ? "#120a2e" : "white",
            background: i === 0 ? GREEN : "rgba(255,255,255,0.09)",
            border: i === 0 ? "none" : "3px solid rgba(255,255,255,0.25)",
            borderRadius: 50,
            padding: "18px 40px",
          }}
        >
          {n}
        </div>
      ))}
    </div>
  );
};

const FollowCTA: React.FC = () => {
  const f = useCurrentFrame();
  const pulse = 1 + 0.035 * Math.sin(Math.max(0, f - 30) / 5);
  return (
    <div style={{ position: "absolute", top: 330, left: 80, right: 80, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT, textAlign: "center" }}>
      <Img
        src={staticFile("logo.png")}
        style={{
          width: 380,
          height: 380,
          borderRadius: 190,
          boxShadow: "0 0 90px rgba(124,77,255,0.7)",
          scale: interpolate(f, [0, 20], [0.5, 1], { ...cl, easing: ease }),
          rotate: `${interpolate(f, [0, 20], [-20, 0], { ...cl, easing: ease })}deg`,
          opacity: interpolate(f, [0, 8], [0, 1], cl),
        }}
      />
      <div style={{ ...inAt(f, 10), fontSize: 64, fontWeight: 700, color: "white", marginTop: 50 }}>Follow</div>
      <div style={{ ...inAt(f, 16), fontSize: 96, fontWeight: 700, color: YELLOW, lineHeight: 1.05 }}>Krito Edga News</div>
      <div style={{ ...inAt(f, 26), marginTop: 46 }}>
        <div style={{ background: GREEN, color: "#120a2e", fontWeight: 700, fontSize: 54, padding: "20px 46px", borderRadius: 50, scale: pulse }}>t.me/kritoedganews</div>
      </div>
      <div style={{ ...inAt(f, 36), fontSize: 38, fontWeight: 600, color: "white", marginTop: 30 }}>Free · Daily · In English</div>
    </div>
  );
};

const Scene: React.FC<{ d: SceneData; children?: React.ReactNode; hideHeadline?: boolean; headlineTop?: number; color?: string }> = ({ d, children, hideHeadline, headlineTop, color }) => (
  <AbsoluteFill>
    <Background />
    {children}
    {hideHeadline ? null : <Headline text={d.headline} top={headlineTop} color={color} />}
    <Header ad={false} />
    <Captions captions={d.captions} top={1430} />
  </AbsoluteFill>
);

export const PromoVideo: React.FC = () => {
  const data = promoData.scenes as SceneData[];
  const dur = (i: number) => data[i].frames + (i < data.length - 1 ? T : 0);
  const sc = [
    <Scene key={0} d={data[0]} headlineTop={330}><Tickers /></Scene>,
    <Scene key={1} d={data[1]} headlineTop={300} color={YELLOW}><Daily /></Scene>,
    <Scene key={2} d={data[2]} headlineTop={215}><Feed /></Scene>,
    <Scene key={3} d={data[3]} headlineTop={330}><Platforms /></Scene>,
    <Scene key={4} d={data[4]} hideHeadline><FollowCTA /></Scene>,
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
            {i < sc.length - 1 ? <TransitionSeries.Transition presentation={pres[i]} timing={linearTiming({ durationInFrames: T })} /> : null}
          </React.Fragment>
        ))}
      </TransitionSeries>
      <div style={{ position: "absolute", top: 1560, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontSize: 28, color: "rgba(255,255,255,0.7)" }}>
        News &amp; information only · Not investment advice
      </div>
      <Audio src={staticFile("promo_vo.wav")} />
    </AbsoluteFill>
  );
};

export const promoFrames = promoData.total;
