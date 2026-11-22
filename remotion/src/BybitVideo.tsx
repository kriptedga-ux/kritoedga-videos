import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import React from "react";
import { AbsoluteFill, Easing, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import signupData from "./data/bybit_signup.json";
import tradfiData from "./data/bybit_tradfi.json";
import { Captions, FONT, GREEN, Header, Headline, PINK, SceneData } from "./ui";

const T = 12;
const ORANGE = "#F7A600";
const RED = "#F6465D";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const inAt = (f: number, s: number, dy = 40) => ({
  opacity: interpolate(f, [s, s + 10], [0, 1], cl),
  translate: interpolate(f, [s, s + 16], [`0px ${dy}px`, "0px 0px"], { ...cl, easing: ease }),
});

/* ---------- background: drifting candlestick chart ---------- */
export const candles = (() => {
  const out: { o: number; c: number; h: number; l: number }[] = [];
  let p = 0.5;
  for (let i = 0; i < 160; i++) {
    const o = p;
    p = Math.min(0.9, Math.max(0.1, p + (random(`c${i}`) - 0.47) * 0.08));
    const c = p;
    out.push({ o, c, h: Math.max(o, c) + random(`h${i}`) * 0.03, l: Math.min(o, c) - random(`l${i}`) * 0.03 });
  }
  return out;
})();

export const ByBackground: React.FC<{ glow?: string; bg?: string }> = ({ glow = "rgba(247,166,0,0.16)", bg = "linear-gradient(175deg, #0b0e14 0%, #121826 60%, #17161f 100%)" }) => {
  const f = useCurrentFrame();
  const w = 34;
  const off = (f * 1.6) % (w * 160);
  return (
    <AbsoluteFill style={{ background: bg }}>
      <svg width={1080} height={1920} style={{ position: "absolute", opacity: 0.22 }}>
        {[...Array(12)].map((_, i) => (
          <line key={i} x1={0} x2={1080} y1={160 * i} y2={160 * i} stroke="#ffffff" strokeOpacity={0.06} />
        ))}
        {candles.map((k, i) => {
          const x = i * w - off;
          if (x < -w || x > 1100) return null;
          const Y = (v: number) => 1750 - v * 900;
          const up = k.c >= k.o;
          return (
            <g key={i}>
              <line x1={x + w / 2} x2={x + w / 2} y1={Y(k.h)} y2={Y(k.l)} stroke={up ? GREEN : RED} strokeWidth={3} />
              <rect x={x + 6} width={w - 12} y={Y(Math.max(k.o, k.c))} height={Math.max(4, Math.abs(k.c - k.o) * 900)} fill={up ? GREEN : RED} rx={3} />
            </g>
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          left: 40 + Math.sin(f / 80) * 100,
          top: 300,
          background: `radial-gradient(circle, ${glow} 0%, rgba(0,0,0,0) 65%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const PhoneFrame: React.FC<{ children: React.ReactNode; top?: number; enterAt?: number }> = ({ children, top = 470, enterAt = 0 }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 290,
        top,
        width: 500,
        height: 880,
        borderRadius: 66,
        background: "#0a0a0f",
        border: "6px solid #33384a",
        boxShadow: "0 40px 90px rgba(0,0,0,0.6)",
        padding: 18,
        ...inAt(f, enterAt, 140),
      }}
    >
      <div style={{ width: "100%", height: "100%", borderRadius: 50, background: "#11151f", overflow: "hidden", position: "relative", fontFamily: FONT, color: "white" }}>
        {children}
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; value: string; typedFrom: number; f: number; highlight?: boolean }> = ({ label, value, typedFrom, f, highlight }) => {
  const n = Math.floor(interpolate(f, [typedFrom, typedFrom + value.length * 2], [0, value.length], cl));
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ fontSize: 24, opacity: 0.6, marginBottom: 8 }}>{label}</div>
      <div
        style={{
          height: 74,
          borderRadius: 16,
          background: "#1b2130",
          border: `3px solid ${highlight && n === value.length ? ORANGE : "#2a3142"}`,
          display: "flex",
          alignItems: "center",
          padding: "0 22px",
          fontSize: 32,
          fontWeight: 600,
          color: highlight ? ORANGE : "white",
        }}
      >
        {value.slice(0, n)}
      </div>
    </div>
  );
};

const Check: React.FC<{ at: number; size?: number }> = ({ at, size = 150 }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: GREEN,
        color: "#0b1a14",
        fontSize: size * 0.62,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: interpolate(f, [at, at + 6], [0, 1], cl),
        scale: interpolate(f, [at, at + 12], [0.3, 1], { ...cl, easing: ease }),
      }}
    >
      ✓
    </div>
  );
};

const StepBadge: React.FC<{ n: number }> = ({ n }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top: 220,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        scale: interpolate(f, [0, 14], [0.4, 1], { ...cl, easing: ease }),
        opacity: interpolate(f, [0, 8], [0, 1], cl),
      }}
    >
      <div style={{ width: 110, height: 110, borderRadius: 55, background: ORANGE, color: "#111", fontFamily: FONT, fontWeight: 700, fontSize: 68, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {n}
      </div>
    </div>
  );
};

/* ---------- signup scenes ---------- */
const SignupHook: React.FC = () => {
  const f = useCurrentFrame();
  const steps = ["Sign up", "Verify", "Rewards"];
  return (
    <div style={{ position: "absolute", top: 720, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 26 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ ...inAt(f, 22 + i * 10), width: 280, padding: "34px 0", borderRadius: 30, background: "rgba(255,255,255,0.06)", border: "2px solid rgba(247,166,0,0.5)", textAlign: "center", fontFamily: FONT }}>
          <div style={{ fontSize: 76, fontWeight: 700, color: ORANGE }}>{i + 1}</div>
          <div style={{ fontSize: 38, fontWeight: 700, color: "white" }}>{s}</div>
        </div>
      ))}
    </div>
  );
};

const SignupPhone: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <PhoneFrame top={420}>
      <div style={{ padding: "60px 34px" }}>
        <div style={{ fontSize: 44, fontWeight: 700, marginBottom: 40 }}>Create account</div>
        <Field label="Email" value="you@email.com" typedFrom={14} f={f} />
        <Field label="Password" value="••••••••••" typedFrom={44} f={f} />
        <Field label="Referral code" value="PON4MBB" typedFrom={4} f={f} highlight />
        <div style={{ marginTop: 20, height: 84, borderRadius: 20, background: ORANGE, color: "#111", fontSize: 34, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", scale: f > 80 && f < 88 ? 0.95 : 1 }}>
          Sign up
        </div>
        <div style={{ marginTop: 22, fontSize: 24, textAlign: "center", ...inAt(f, 30, 0), color: "rgba(255,255,255,0.75)" }}>
          <span style={{ color: ORANGE }}>✓</span> Code already in our link
        </div>
      </div>
    </PhoneFrame>
  );
};

const VerifyPhone: React.FC = () => {
  const f = useCurrentFrame();
  const scan = interpolate(f, [15, 75], [0, 1], cl);
  return (
    <PhoneFrame top={420}>
      <div style={{ padding: "60px 34px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontSize: 44, fontWeight: 700, marginBottom: 40, alignSelf: "flex-start" }}>Verify identity</div>
        <div style={{ position: "relative", width: 400, height: 250, borderRadius: 22, background: "linear-gradient(135deg,#2a3350,#1a2036)", border: "2px solid #3a4565", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 28, top: 40, width: 110, height: 140, borderRadius: 14, background: "#4a5578" }} />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ position: "absolute", left: 165, top: 52 + i * 38, width: 200 - i * 30, height: 16, borderRadius: 8, background: "#4a5578" }} />
          ))}
          <div style={{ position: "absolute", left: 0, right: 0, top: scan * 250 - 4, height: 8, background: ORANGE, boxShadow: `0 0 30px ${ORANGE}`, opacity: f < 78 ? 1 : 0 }} />
        </div>
        <div style={{ marginTop: 50, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          {f >= 80 ? <Check at={80} /> : <div style={{ fontSize: 30, opacity: 0.7, height: 150, display: "flex", alignItems: "center" }}>Scanning ID…</div>}
          <div style={{ fontSize: 34, fontWeight: 700, opacity: f >= 80 ? 1 : 0 }}>Verified</div>
        </div>
      </div>
    </PhoneFrame>
  );
};

const Rewards: React.FC = () => {
  const f = useCurrentFrame();
  const items = ["Complete tasks", "Make a deposit", "Try your first trade"];
  return (
    <>
      <div style={{ position: "absolute", top: 470, left: 0, right: 0, display: "flex", justifyContent: "center", ...inAt(f, 6) }}>
        <div style={{ fontSize: 210, rotate: `${Math.sin(f / 6) * 6}deg` }}>🎁</div>
      </div>
      <div style={{ position: "absolute", top: 790, left: 150, right: 150, display: "flex", flexDirection: "column", gap: 22 }}>
        {items.map((t, i) => (
          <div key={i} style={{ ...inAt(f, 20 + i * 12), fontFamily: FONT, fontSize: 44, fontWeight: 700, color: "white", background: "rgba(255,255,255,0.07)", borderLeft: `8px solid ${ORANGE}`, borderRadius: 18, padding: "20px 30px" }}>
            {t}
          </div>
        ))}
        <div style={{ ...inAt(f, 58), fontFamily: FONT, fontSize: 30, color: "rgba(255,255,255,0.7)", textAlign: "center", marginTop: 6 }}>
          Rewards and conditions vary – check the app
        </div>
      </div>
    </>
  );
};

const LinkCard: React.FC<{ title: string; region: string; code: string; url: string; at: number; f: number }> = ({ title, region, code, url, at, f }) => (
  <div style={{ ...inAt(f, at), background: "rgba(255,255,255,0.06)", border: `3px solid ${ORANGE}`, borderRadius: 30, padding: "26px 30px", textAlign: "center", fontFamily: FONT }}>
    <div style={{ fontSize: 30, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{region}</div>
    <div style={{ fontSize: 54, color: "white", fontWeight: 700 }}>{title}</div>
    <div style={{ fontSize: 46, color: ORANGE, fontWeight: 700, letterSpacing: 3 }}>{code}</div>
    <div style={{ fontSize: 30, color: GREEN, fontWeight: 600 }}>{url}</div>
  </div>
);

const SignupCTA: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: 420, left: 110, right: 110, display: "flex", flexDirection: "column", gap: 34 }}>
      <LinkCard f={f} at={8} region="Europe (EEA)" title="Bybit EU" code="PON4MBB" url="tinyurl.com/kritoedga-eu" />
      <LinkCard f={f} at={36} region="Rest of the world" title="Bybit Global" code="RP0OQW" url="tinyurl.com/kritoedga-bybit" />
      <div style={{ ...inAt(f, 70), textAlign: "center", fontFamily: FONT, fontSize: 40, fontWeight: 700, color: "white" }}>
        Links in bio · Telegram <span style={{ color: GREEN }}>@kritoedganews</span>
      </div>
    </div>
  );
};

/* ---------- tradfi scenes ---------- */
const Spark: React.FC<{ seed: string; color: string; f: number }> = ({ seed, color, f }) => {
  const pts = [...Array(30)].map((_, i) => {
    const v = 30 + Math.sin(i / 3 + random(seed) * 6) * 14 + (random(`${seed}${i}`) - 0.5) * 12 + i * 0.6;
    return `${i * 7},${70 - v}`;
  });
  const len = interpolate(f, [0, 40], [0, 1], cl);
  return (
    <svg width={210} height={70}>
      <polyline points={pts.slice(0, Math.max(2, Math.floor(30 * len))).join(" ")} fill="none" stroke={color} strokeWidth={5} strokeLinejoin="round" />
    </svg>
  );
};

const MarketsHook: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: 720, left: 0, right: 0, display: "flex", justifyContent: "center", ...inAt(f, 26) }}>
      <div style={{ fontFamily: FONT, fontSize: 46, fontWeight: 700, color: "#111", background: ORANGE, borderRadius: 50, padding: "18px 44px" }}>
        Bybit TradFi · MetaTrader 5
      </div>
    </div>
  );
};

const Markets: React.FC = () => {
  const f = useCurrentFrame();
  const rows = [
    { n: "Gold", s: "XAU/USD", c: ORANGE },
    { n: "Forex", s: "EUR/USD · GBP/USD", c: "#4C8DFF" },
    { n: "Indices", s: "S&P 500 · Nasdaq", c: GREEN },
    { n: "US stocks", s: "AAPL · TSLA · NVDA", c: "#ffffff" },
  ];
  return (
    <div style={{ position: "absolute", top: 440, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 24 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ ...inAt(f, 8 + i * 14), display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.06)", borderLeft: `10px solid ${r.c}`, borderRadius: 22, padding: "24px 30px", fontFamily: FONT }}>
          <div>
            <div style={{ fontSize: 52, fontWeight: 700, color: "white" }}>{r.n}</div>
            <div style={{ fontSize: 28, color: "rgba(255,255,255,0.6)" }}>{r.s}</div>
          </div>
          <Spark seed={r.n} color={r.c} f={f - 8 - i * 14} />
        </div>
      ))}
      <div style={{ ...inAt(f, 70), textAlign: "center", fontFamily: FONT, fontSize: 38, fontWeight: 700, color: ORANGE, marginTop: 10 }}>
        Margin in USDT
      </div>
    </div>
  );
};

const MT5Phone: React.FC = () => {
  const f = useCurrentFrame();
  const shown = Math.floor(interpolate(f, [5, 70], [6, 26], cl));
  const all = candles.slice(40, 66);
  const ks = all.slice(0, shown);
  const lo = Math.min(...all.map((k) => k.l));
  const hi = Math.max(...all.map((k) => k.h));
  const Y = (v: number) => 430 - ((v - lo) / (hi - lo)) * 410;
  return (
    <PhoneFrame top={420}>
      <div style={{ padding: "50px 26px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 38, fontWeight: 700 }}>XAU/USD</div>
          <div style={{ fontSize: 24, background: "#1f2636", borderRadius: 12, padding: "6px 14px" }}>H1 · MT5</div>
        </div>
        <svg width={436} height={460} style={{ marginTop: 20 }}>
          {ks.map((k, i) => {
            const up = k.c >= k.o;
            const x = i * 16 + 4;
            return (
              <g key={i}>
                <line x1={x + 6} x2={x + 6} y1={Y(k.h)} y2={Y(k.l)} stroke={up ? GREEN : RED} strokeWidth={2} />
                <rect x={x} width={12} y={Y(Math.max(k.o, k.c))} height={Math.max(3, (Math.abs(k.c - k.o) / (hi - lo)) * 410)} fill={up ? GREEN : RED} rx={2} />
              </g>
            );
          })}
          <polyline
            points={ks.map((k, i) => `${i * 16 + 10},${Y((k.o + k.c) / 2)}`).join(" ")}
            fill="none"
            stroke={ORANGE}
            strokeWidth={3}
            opacity={0.9}
          />
        </svg>
        <div style={{ display: "flex", gap: 14, marginTop: 16 }}>
          {["Indicators", "Expert Advisors"].map((t, i) => (
            <div key={i} style={{ ...inAt(f, 30 + i * 12, 20), flex: 1, textAlign: "center", fontSize: 24, fontWeight: 700, background: "#1f2636", borderRadius: 14, padding: "14px 0", border: `2px solid ${ORANGE}` }}>
              {t}
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
};

const RiskCard: React.FC = () => {
  const f = useCurrentFrame();
  const items = ["Leverage magnifies losses", "You can lose money rapidly", "Not available in EEA, UK, US"];
  return (
    <>
      <div style={{ position: "absolute", top: 470, left: 0, right: 0, textAlign: "center", fontSize: 170, ...inAt(f, 4) }}>⚠️</div>
      <div style={{ position: "absolute", top: 720, left: 120, right: 120, display: "flex", flexDirection: "column", gap: 22 }}>
        {items.map((t, i) => (
          <div key={i} style={{ ...inAt(f, 18 + i * 22), fontFamily: FONT, fontSize: 42, fontWeight: 700, color: "white", background: "rgba(246,70,93,0.14)", border: `3px solid ${RED}`, borderRadius: 22, padding: "20px 28px", textAlign: "center" }}>
            {t}
          </div>
        ))}
      </div>
    </>
  );
};

const TradfiCTA: React.FC = () => {
  const f = useCurrentFrame();
  const pulse = 1 + 0.035 * Math.sin(Math.max(0, f - 30) / 5);
  return (
    <div style={{ position: "absolute", top: 470, left: 90, right: 90, textAlign: "center", fontFamily: FONT }}>
      <div style={{ ...inAt(f, 6), fontSize: 64, fontWeight: 700, color: "white" }}>Bybit Global</div>
      <div style={{ ...inAt(f, 14), display: "flex", justifyContent: "center", marginTop: 30 }}>
        <div style={{ background: ORANGE, color: "#111", fontWeight: 700, fontSize: 96, letterSpacing: 6, padding: "14px 56px", borderRadius: 30, scale: pulse }}>RP0OQW</div>
      </div>
      <div style={{ ...inAt(f, 24), fontSize: 44, fontWeight: 700, color: GREEN, marginTop: 34 }}>tinyurl.com/kritoedga-bybit</div>
      <div style={{ ...inAt(f, 34), fontSize: 40, fontWeight: 600, color: "white", marginTop: 34 }}>
        Link in bio · Telegram <span style={{ color: GREEN }}>@kritoedganews</span>
      </div>
    </div>
  );
};

/* ---------- assembly ---------- */
const Disclaimer: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", top: 1530, left: 70, right: 70, textAlign: "center", fontFamily: FONT, fontSize: 26, lineHeight: 1.35, color: "rgba(255,255,255,0.72)" }}>{text}</div>
);

const Scene: React.FC<{ d: SceneData; children?: React.ReactNode; hideHeadline?: boolean; headlineTop?: number; color?: string }> = ({ d, children, hideHeadline, headlineTop, color }) => (
  <AbsoluteFill>
    <ByBackground />
    {children}
    {hideHeadline ? null : <Headline text={d.headline} top={headlineTop} color={color} />}
    <Header />
    <Captions captions={d.captions} />
  </AbsoluteFill>
);

const D_SIGNUP = "#ad · Referral partner of Bybit · Not investment advice. Crypto is high-risk – you can lose money. Availability varies by country.";
const D_TRADFI = "#ad · Referral partner of Bybit · Not investment advice. CFDs are leveraged and high-risk – you can lose money rapidly. Bybit Global TradFi is not available in the EEA, UK, US and other restricted regions.";

export const BybitVideo: React.FC<{ kind: "signup" | "tradfi" }> = ({ kind }) => {
  const data = (kind === "signup" ? signupData : tradfiData).scenes as SceneData[];
  const dur = (i: number) => data[i].frames + (i < data.length - 1 ? T : 0);
  const sc =
    kind === "signup"
      ? [
          <Scene key={0} d={data[0]} headlineTop={460} color={ORANGE}><SignupHook /></Scene>,
          <Scene key={1} d={data[1]} headlineTop={330}><StepBadge n={1} /><div style={{ position: "absolute", inset: 0, translate: "0px 60px" }}><SignupPhone /></div></Scene>,
          <Scene key={2} d={data[2]} headlineTop={330}><StepBadge n={2} /><div style={{ position: "absolute", inset: 0, translate: "0px 60px" }}><VerifyPhone /></div></Scene>,
          <Scene key={3} d={data[3]} headlineTop={330}><StepBadge n={3} /><Rewards /></Scene>,
          <Scene key={4} d={data[4]} headlineTop={250}><SignupCTA /></Scene>,
        ]
      : [
          <Scene key={0} d={data[0]} headlineTop={430}><MarketsHook /></Scene>,
          <Scene key={1} d={data[1]} headlineTop={250}><Markets /></Scene>,
          <Scene key={2} d={data[2]} headlineTop={250}><MT5Phone /></Scene>,
          <Scene key={3} d={data[3]} headlineTop={250} color={RED}><RiskCard /></Scene>,
          <Scene key={4} d={data[4]} headlineTop={250} hideHeadline><TradfiCTA /></Scene>,
        ];
  const pres = [slide({ direction: "from-right" }), fade(), slide({ direction: "from-bottom" }), fade()];
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0e14" }}>
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
      <Disclaimer text={kind === "signup" ? D_SIGNUP : D_TRADFI} />
      <Audio src={staticFile(`bybit_${kind}_vo.wav`)} />
    </AbsoluteFill>
  );
};

export const bybitFrames = (kind: "signup" | "tradfi") => (kind === "signup" ? signupData : tradfiData).total;
export { PINK };
