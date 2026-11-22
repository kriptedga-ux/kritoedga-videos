import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import React from "react";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ByBackground, candles, inAt, PhoneFrame } from "./BybitVideo";
import tvData from "./data/tradingview.json";
import tvBfData from "./data/tradingview_bf.json";
import { Captions, FONT, GREEN, Header, Headline, SceneData, YELLOW } from "./ui";

const T = 12;
const BLUE = "#2962FF";
const RED = "#F6465D";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const BG = "linear-gradient(175deg, #070b18 0%, #0c1530 60%, #101a3a 100%)";
const GLOW = "rgba(41,98,255,0.28)";

const ChartPanel: React.FC<{ top: number; height: number; reveal: number; ma?: number; rsi?: boolean; trend?: number }> = ({ top, height, reveal, ma = 0, rsi = false, trend = 0 }) => {
  const ks = candles.slice(60, 116);
  const lo = Math.min(...ks.map((k) => k.l));
  const hi = Math.max(...ks.map((k) => k.h));
  const W = 900;
  const mainH = rsi ? height * 0.7 : height;
  const w = W / ks.length;
  const n = Math.max(2, Math.floor(ks.length * reveal));
  const Y = (v: number) => 20 + (1 - (v - lo) / (hi - lo)) * (mainH - 40);
  const maPts = (p: number) =>
    ks
      .map((_, i) => {
        const s = ks.slice(Math.max(0, i - p + 1), i + 1);
        const avg = s.reduce((a, k) => a + k.c, 0) / s.length;
        return `${i * w + w / 2},${Y(avg)}`;
      })
      .slice(0, Math.max(2, Math.floor(n * ma)));
  const rsiPts = ks
    .map((k, i) => {
      const prev = ks[Math.max(0, i - 1)];
      const v = 50 + ((k.c - prev.c) / (hi - lo)) * 400;
      return `${i * w + w / 2},${mainH + 20 + (1 - Math.max(5, Math.min(95, v)) / 100) * (height - mainH - 30)}`;
    })
    .slice(0, n);
  return (
    <div style={{ position: "absolute", top, left: 60, width: 960, height: height + 80, background: "#0b1124", borderRadius: 30, border: "2px solid #1e2a4f", boxShadow: "0 40px 80px rgba(0,0,0,0.5)", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 18, alignItems: "center", padding: "18px 26px", fontFamily: FONT, color: "white", borderBottom: "2px solid #1e2a4f" }}>
        <div style={{ fontSize: 32, fontWeight: 700 }}>BTCUSD</div>
        {["1H", "4H", "1D"].map((t, i) => (
          <div key={t} style={{ fontSize: 24, padding: "4px 14px", borderRadius: 10, background: i === 1 ? BLUE : "#17213f" }}>{t}</div>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 24, color: "rgba(255,255,255,0.6)" }}>Indicators · Alerts</div>
      </div>
      <svg width={W} height={height} style={{ marginLeft: 30 }}>
        {[...Array(6)].map((_, i) => (
          <line key={i} x1={0} x2={W} y1={(i * mainH) / 5} y2={(i * mainH) / 5} stroke="#ffffff" strokeOpacity={0.05} />
        ))}
        {ks.slice(0, n).map((k, i) => {
          const up = k.c >= k.o;
          return (
            <g key={i}>
              <line x1={i * w + w / 2} x2={i * w + w / 2} y1={Y(k.h)} y2={Y(k.l)} stroke={up ? GREEN : RED} strokeWidth={2} />
              <rect x={i * w + 3} width={w - 6} y={Y(Math.max(k.o, k.c))} height={Math.max(3, Math.abs(Y(k.o) - Y(k.c)))} fill={up ? GREEN : RED} rx={2} />
            </g>
          );
        })}
        {ma > 0 ? (
          <>
            <polyline points={maPts(5).join(" ")} fill="none" stroke={YELLOW} strokeWidth={4} />
            <polyline points={maPts(14).join(" ")} fill="none" stroke={BLUE} strokeWidth={4} />
          </>
        ) : null}
        {trend > 0 ? (
          <line x1={w * 4} y1={Y(ks[4].l)} x2={w * 4 + (W * 0.8 - w * 4) * trend} y2={Y(ks[4].l) + (Y(ks[44].l) - Y(ks[4].l)) * ((W * 0.8 - w * 4) / (w * 40)) * trend} stroke="#ffffff" strokeWidth={4} strokeDasharray="14 10" />
        ) : null}
        {rsi ? (
          <>
            <line x1={0} x2={W} y1={mainH + 10} y2={mainH + 10} stroke="#1e2a4f" strokeWidth={2} />
            <polyline points={rsiPts.join(" ")} fill="none" stroke="#B388FF" strokeWidth={3} />
          </>
        ) : null}
      </svg>
    </div>
  );
};

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ ...inAt(f, 6, 80) }}>
        <ChartPanel top={620} height={560} reveal={interpolate(f, [6, 90], [0.1, 1], cl)} />
      </div>
    </>
  );
};

const Tools: React.FC = () => {
  const f = useCurrentFrame();
  const chips = ["Moving averages", "RSI", "Trend lines", "Multi-chart"];
  return (
    <>
      <ChartPanel top={480} height={620} reveal={1} ma={interpolate(f, [10, 60], [0, 1], cl)} rsi trend={interpolate(f, [60, 100], [0, 1], { ...cl, easing: ease })} />
      <div style={{ position: "absolute", top: 1230, left: 60, right: 60, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
        {chips.map((c, i) => (
          <div key={c} style={{ ...inAt(f, 20 + i * 20, 20), fontFamily: FONT, fontSize: 36, fontWeight: 700, color: "white", background: "rgba(41,98,255,0.25)", border: `2px solid ${BLUE}`, borderRadius: 40, padding: "10px 28px" }}>
            {c}
          </div>
        ))}
      </div>
    </>
  );
};

const AlertPhone: React.FC = () => {
  const f = useCurrentFrame();
  const drop = interpolate(f, [40, 56], [-200, 0], { ...cl, easing: ease });
  const shake = f > 56 && f < 70 ? Math.sin(f * 2.5) * 6 : 0;
  return (
    <PhoneFrame top={440}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#1b2a5c,#0b1124)" }} />
      <div style={{ position: "absolute", top: 90, left: 0, right: 0, textAlign: "center", fontSize: 110, fontWeight: 700, color: "white" }}>19:42</div>
      <div style={{ position: "absolute", top: 230, left: 0, right: 0, textAlign: "center", fontSize: 30, color: "rgba(255,255,255,0.7)" }}>Price alert set · BTCUSD</div>
      <div
        style={{
          position: "absolute",
          top: 330,
          left: 22,
          right: 22,
          translate: `${shake}px ${drop}px`,
          opacity: interpolate(f, [40, 48], [0, 1], cl),
          background: "rgba(255,255,255,0.92)",
          borderRadius: 30,
          padding: "22px 24px",
          color: "#0b1124",
          display: "flex",
          gap: 18,
          alignItems: "center",
        }}
      >
        <div style={{ width: 70, height: 70, borderRadius: 18, background: BLUE, color: "white", fontSize: 40, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>🔔</div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>Price alert</div>
          <div style={{ fontSize: 24 }}>BTCUSD crossed your alert level</div>
        </div>
      </div>
    </PhoneFrame>
  );
};

const Offer: React.FC<{ bf: boolean }> = ({ bf }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: 560, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 44, fontFamily: FONT }}>
      <div style={{ ...inAt(f, 6), display: "flex", gap: 24 }}>
        <div style={{ background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.25)", borderRadius: 26, padding: "22px 40px", textAlign: "center", color: "white" }}>
          <div style={{ fontSize: 30, opacity: 0.7 }}>Basic</div>
          <div style={{ fontSize: 50, fontWeight: 700 }}>Free</div>
        </div>
        <div style={{ background: "rgba(41,98,255,0.25)", border: `3px solid ${BLUE}`, borderRadius: 26, padding: "22px 40px", textAlign: "center", color: "white" }}>
          <div style={{ fontSize: 30, opacity: 0.7 }}>Paid plans</div>
          <div style={{ fontSize: 50, fontWeight: 700 }}>More tools</div>
        </div>
      </div>
      <div
        style={{
          ...inAt(f, 40),
          rotate: `${interpolate(f, [40, 60], [-8, -3], { ...cl, easing: ease })}deg`,
          scale: interpolate(f, [40, 60], [0.6, 1], { ...cl, easing: ease }),
          background: bf ? "#0b0b0f" : YELLOW,
          color: bf ? YELLOW : "#0b1124",
          borderRadius: 30,
          padding: "30px 60px",
          textAlign: "center",
          border: bf ? `6px solid ${YELLOW}` : "6px dashed rgba(11,17,36,0.4)",
        }}
      >
        <div style={{ fontSize: bf ? 120 : 96, fontWeight: 700, lineHeight: 1 }}>{bf ? "BLACK FRIDAY" : "CURRENT OFFER"}</div>
        <div style={{ fontSize: 36, fontWeight: 700, marginTop: 10, color: bf ? "white" : "#0b1124" }}>{bf ? "Yearly sale · limited time" : "via our link"}</div>
      </div>
      <div style={{ ...inAt(f, 70), fontSize: 30, color: "rgba(255,255,255,0.7)", textAlign: "center", padding: "0 120px" }}>
        Prices and discounts are shown on TradingView. Terms apply.
      </div>
    </div>
  );
};

const CTA: React.FC<{ bf: boolean }> = ({ bf }) => {
  const f = useCurrentFrame();
  const pulse = 1 + 0.035 * Math.sin(Math.max(0, f - 30) / 5);
  return (
    <div style={{ position: "absolute", top: 420, left: 80, right: 80, textAlign: "center", fontFamily: FONT }}>
      <div style={{ ...inAt(f, 4), fontSize: 110, fontWeight: 700, color: "white" }}>TradingView</div>
      <div style={{ ...inAt(f, 12), fontSize: 50, fontWeight: 700, color: YELLOW, marginTop: 6 }}>{bf ? "Black Friday deals via our link" : "Current offer via our link"}</div>
      <div style={{ ...inAt(f, 20), display: "flex", justifyContent: "center", marginTop: 44 }}>
        <div style={{ background: BLUE, color: "white", fontWeight: 700, fontSize: 50, padding: "20px 46px", borderRadius: 50, scale: pulse }}>Link in bio</div>
      </div>
      <div style={{ ...inAt(f, 30), fontSize: 40, fontWeight: 600, color: "white", marginTop: 40 }}>
        and on Telegram <span style={{ color: GREEN }}>@kritoedganews</span>
      </div>
    </div>
  );
};

const Scene: React.FC<{ d: SceneData; children?: React.ReactNode; hideHeadline?: boolean; headlineTop?: number; color?: string }> = ({ d, children, hideHeadline, headlineTop, color }) => (
  <AbsoluteFill>
    <ByBackground glow={GLOW} bg={BG} />
    {children}
    {hideHeadline ? null : <Headline text={d.headline} top={headlineTop} color={color} />}
    <Header />
    <Captions captions={d.captions} />
  </AbsoluteFill>
);

export const TVVideo: React.FC<{ bf: boolean }> = ({ bf }) => {
  const data = (bf ? tvBfData : tvData).scenes as SceneData[];
  const dur = (i: number) => data[i].frames + (i < data.length - 1 ? T : 0);
  const sc = [
    <Scene key={0} d={data[0]} headlineTop={330}><Hook /></Scene>,
    <Scene key={1} d={data[1]} headlineTop={260}><Tools /></Scene>,
    <Scene key={2} d={data[2]} headlineTop={260}><AlertPhone /></Scene>,
    <Scene key={3} d={data[3]} headlineTop={300} color={YELLOW}><Offer bf={bf} /></Scene>,
    <Scene key={4} d={data[4]} hideHeadline><CTA bf={bf} /></Scene>,
  ];
  const pres = [slide({ direction: "from-right" }), fade(), slide({ direction: "from-bottom" }), fade()];
  return (
    <AbsoluteFill style={{ backgroundColor: "#070b18" }}>
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
      <div style={{ position: "absolute", top: 1530, left: 80, right: 80, textAlign: "center", fontFamily: FONT, fontSize: 26, lineHeight: 1.35, color: "rgba(255,255,255,0.72)" }}>
        #ad · TradingView partner link · Not investment advice.
      </div>
      <Audio src={staticFile(bf ? "tradingview_bf_vo.wav" : "tradingview_vo.wav")} />
    </AbsoluteFill>
  );
};

export const tvFrames = (bf: boolean) => (bf ? tvBfData : tvData).total;
