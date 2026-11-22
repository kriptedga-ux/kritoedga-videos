import { loadFont } from "@remotion/fonts";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

loadFont({ family: "Poppins", url: staticFile("Poppins-Bold.ttf"), weight: "700" });
loadFont({ family: "Poppins", url: staticFile("Poppins-Medium.ttf"), weight: "600" });
loadFont({ family: "Poppins", url: staticFile("Poppins-Regular.ttf"), weight: "400" });

export const FONT = "Poppins, sans-serif";
export const GREEN = "#2BE6A0";
export const YELLOW = "#FFD23F";
export const PINK = "#FF3C8C";

export type Cap = { text: string; startMs: number; endMs: number };
export type SceneData = { headline: string; line: string; frames: number; captions: Cap[] };

const spring = Easing.bezier(0.16, 1, 0.3, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(170deg, #120a2e 0%, #24104f 55%, #3a1470 100%)" }}>
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,77,255,0.45) 0%, rgba(124,77,255,0) 70%)",
          left: -200 + Math.sin(frame / 70) * 120,
          top: 500 + Math.cos(frame / 90) * 140,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(43,230,160,0.18) 0%, rgba(43,230,160,0) 70%)",
          right: -250 + Math.cos(frame / 80) * 100,
          top: 1050 + Math.sin(frame / 60) * 120,
        }}
      />
    </AbsoluteFill>
  );
};

export const Header: React.FC = () => (
  <AbsoluteFill>
    <div style={{ position: "absolute", left: 60, top: 70, display: "flex", alignItems: "center", gap: 22 }}>
      <Img src={staticFile("logo.png")} style={{ width: 104, height: 104, borderRadius: 52 }} />
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: "white", letterSpacing: 1 }}>
        KRITO EDGA NEWS
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        right: 60,
        top: 92,
        background: PINK,
        color: "white",
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 36,
        padding: "6px 30px",
        borderRadius: 30,
      }}
    >
      #ad
    </div>
  </AbsoluteFill>
);

export const Headline: React.FC<{ text: string; top?: number; color?: string; size?: number }> = ({
  text,
  top = 250,
  color = "white",
  size = 92,
}) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 80,
        right: 80,
        textAlign: "center",
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.08,
        color,
        textShadow: "0 6px 30px rgba(0,0,0,0.35)",
      }}
    >
      {words.map((w, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            marginRight: "0.25em",
            opacity: interpolate(frame, [4 + i * 3, 14 + i * 3], [0, 1], cl),
            translate: interpolate(frame, [4 + i * 3, 18 + i * 3], ["0px 40px", "0px 0px"], {
              ...cl,
              easing: spring,
            }),
          }}
        >
          {w}
        </span>
      ))}
    </div>
  );
};

// Captions: show 3-word pages, highlight the active word
export const Captions: React.FC<{ captions: Cap[]; top?: number }> = ({ captions, top = 1400 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const pages: Cap[][] = [];
  let cur: Cap[] = [];
  captions.forEach((c) => {
    cur.push(c);
    const endSentence = /[.,!?]$/.test(c.text.trim());
    if (cur.length >= 3 || endSentence) {
      pages.push(cur);
      cur = [];
    }
  });
  if (cur.length) pages.push(cur);
  const page = pages.find((p) => ms >= p[0].startMs - 80 && ms < p[p.length - 1].endMs + 120);
  if (!page) return null;
  const pStart = page[0].startMs;
  const pop = interpolate(ms, [pStart - 80, pStart + 120], [0.85, 1], { ...cl, easing: spring });
  return (
    <div style={{ position: "absolute", top, left: 70, right: 70, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          scale: pop,
          background: "rgba(10,6,25,0.72)",
          borderRadius: 28,
          padding: "18px 34px",
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 60,
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {page.map((c, i) => {
          const active = ms >= c.startMs - 40 && ms < c.endMs + 40;
          return (
            <span key={i} style={{ color: active ? YELLOW : "white" }}>
              {i === 0 ? c.text.trimStart() : c.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const Phone: React.FC<{ left: number; top: number; signedAt: number; label?: string }> = ({
  left,
  top,
  signedAt,
  label = "Tap to sign",
}) => {
  const frame = useCurrentFrame();
  const signed = frame >= signedAt;
  const enter = interpolate(frame, [0, 20], [120, 0], { ...cl, easing: spring });
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: 430,
        height: 860,
        translate: `0px ${enter}px`,
        opacity: interpolate(frame, [0, 12], [0, 1], cl),
        borderRadius: 64,
        background: "#0d0d12",
        border: "6px solid #3b3b48",
        boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
        padding: 18,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 48,
          background: signed
            ? "linear-gradient(180deg, #0f5f4a 0%, #0b3b31 100%)"
            : "linear-gradient(180deg, #1b3f8f 0%, #10265a 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 30,
          fontFamily: FONT,
          color: "white",
        }}
      >
        <div style={{ fontSize: 30, opacity: 0.75, fontWeight: 600 }}>Send 0.05 BTC</div>
        {signed ? (
          <div
            style={{
              width: 170,
              height: 170,
              borderRadius: 85,
              background: GREEN,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 110,
              color: "#0b3b31",
              fontWeight: 700,
              scale: interpolate(frame, [signedAt, signedAt + 10], [0.4, 1], { ...cl, easing: spring }),
            }}
          >
            ✓
          </div>
        ) : (
          <div style={{ position: "relative", width: 200, height: 170 }}>
            {[0, 1, 2].map((i) => {
              const t = ((frame + i * 10) % 30) / 30;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: 100 - (40 + t * 60),
                    top: 85 - (40 + t * 60),
                    width: 2 * (40 + t * 60),
                    height: 2 * (40 + t * 60),
                    borderRadius: "50%",
                    border: `8px solid ${GREEN}`,
                    opacity: 1 - t,
                  }}
                />
              );
            })}
          </div>
        )}
        <div style={{ fontSize: 46, fontWeight: 700 }}>{signed ? "Signed" : label}</div>
      </div>
    </div>
  );
};

export const Chips: React.FC<{ items: string[]; top: number; startFrames: number[] }> = ({ items, top, startFrames }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 80,
        right: 80,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
      }}
    >
      {items.map((t, i) => (
        <div
          key={i}
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 50,
            color: "white",
            background: "rgba(255,255,255,0.1)",
            border: "3px solid rgba(43,230,160,0.7)",
            borderRadius: 40,
            padding: "14px 40px",
            opacity: interpolate(frame, [startFrames[i], startFrames[i] + 8], [0, 1], cl),
            scale: interpolate(frame, [startFrames[i], startFrames[i] + 12], [0.6, 1], { ...cl, easing: spring }),
          }}
        >
          <span style={{ color: GREEN }}>✓ </span>
          {t}
        </div>
      ))}
    </div>
  );
};

export const CTA: React.FC<{ title: string; sub: string; top: number; disclaimer: string }> = ({
  title,
  sub,
  top,
  disclaimer,
}) => {
  const frame = useCurrentFrame();
  const a = (s: number) => ({
    opacity: interpolate(frame, [s, s + 10], [0, 1], cl),
    translate: interpolate(frame, [s, s + 16], ["0px 40px", "0px 0px"], { ...cl, easing: spring }),
  });
  const pulse = 1 + 0.035 * Math.sin(Math.max(0, frame - 30) / 5);
  return (
    <>
      <div style={{ position: "absolute", top, left: 80, right: 80, textAlign: "center", fontFamily: FONT }}>
        <div style={{ fontSize: 104, fontWeight: 700, color: YELLOW, ...a(4) }}>{title}</div>
        <div style={{ fontSize: 50, fontWeight: 700, color: "white", marginTop: 10, ...a(10) }}>{sub}</div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 40, ...a(16) }}>
          <div
            style={{
              background: GREEN,
              color: "#0c0c14",
              fontWeight: 700,
              fontSize: 52,
              padding: "20px 44px",
              borderRadius: 50,
              scale: pulse,
            }}
          >
            tangem.com/invite/B33M5T
          </div>
        </div>
        <div style={{ fontSize: 40, fontWeight: 600, color: "white", marginTop: 44, ...a(24) }}>
          Link in bio &amp; on Telegram
          <br />
          <span style={{ color: GREEN }}>@kritoedganews</span>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 300,
          left: 90,
          right: 90,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 28,
          fontWeight: 400,
          color: "rgba(255,255,255,0.75)",
          ...a(30),
        }}
      >
        {disclaimer}
      </div>
    </>
  );
};
