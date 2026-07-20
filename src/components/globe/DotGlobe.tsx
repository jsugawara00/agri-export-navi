"use client";

import { useEffect, useRef } from "react";
import { sampleMask, type CellType } from "./landmask";

/**
 * Canvas 2D の点描地球儀。3Dライブラリは使わない（保守規模の制約）。
 * 緯度経度グリッドの点を球面投影し、陸=ティール / 海=暗グレー / 日本=アンバーで描く。
 * flyTarget が与えられると対象国方向へ回転→ズーム(scale 2.6, 900ms)→フェードアウトし、
 * 完了時に onDone を呼ぶ。
 */

interface Point {
  cosLat: number;
  sinLat: number;
  lng: number; // ラジアン
  type: CellType;
}

const COLORS: Record<CellType, string> = {
  sea: "#233047",
  land: "#8fd4b8",
  japan: "#f0b95a",
};

const SIZES: Record<CellType, number> = {
  sea: 0.9,
  land: 1.5,
  japan: 1.9,
};

function buildPoints(): Point[] {
  const points: Point[] = [];
  for (let lat = -87; lat <= 87; lat += 3) {
    for (let lng = -180; lng < 180; lng += 3) {
      const phi = (lat * Math.PI) / 180;
      points.push({
        cosLat: Math.cos(phi),
        sinLat: Math.sin(phi),
        lng: (lng * Math.PI) / 180,
        type: sampleMask(lat, lng),
      });
    }
  }
  return points;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export interface FlyTarget {
  lat: number;
  lng: number;
}

export default function DotGlobe({
  flyTarget,
  onDone,
}: {
  flyTarget: FlyTarget | null;
  onDone?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const stateRef = useRef({
    theta: 0.6, // 経度方向の回転（初期は日本が正面寄り）
    tilt: 0.45, // 緯度方向の傾き
    mode: "auto" as "auto" | "aim" | "fly" | "zoom",
    aimStart: 0, // 照準（仕向地パルス）開始時刻
    targetLatR: 0, // 仕向地（ラジアン）
    targetLngR: 0,
    flyStart: 0,
    fromTheta: 0,
    fromTilt: 0,
    toTheta: 0,
    toTilt: 0,
  });

  // 初期回転で日本付近（東経138°）を正面に
  useEffect(() => {
    stateRef.current.theta = (-138 * Math.PI) / 180;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const points = buildPoints();
    let raf = 0;
    let last = performance.now();

    const resize = () => {
      const parent = canvas.parentElement!;
      const size = Math.min(parent.clientWidth, parent.clientHeight);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
    };
    resize();
    window.addEventListener("resize", resize);

    const AIM_MS = 680; // 照準フェーズの長さ

    // 照準完了 → 対象国方向への回転を開始
    const beginFly = (s: typeof stateRef.current) => {
      const toTheta = -s.targetLngR;
      const twoPi = Math.PI * 2;
      const from = s.theta % twoPi;
      const diff = ((((toTheta - from) % twoPi) + twoPi * 1.5) % twoPi) - twoPi / 2;
      s.fromTheta = from;
      s.toTheta = from + diff;
      s.fromTilt = s.tilt;
      s.toTilt = s.targetLatR;
      s.flyStart = performance.now();
      s.mode = "fly";
    };

    const draw = (now: number) => {
      const s = stateRef.current;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (s.mode === "auto") {
        s.theta += dt * 0.12; // 自動回転
      } else if (s.mode === "aim") {
        s.theta += dt * 0.12; // 照準中もゆっくり回す
        if (now - s.aimStart >= AIM_MS) beginFly(s);
      } else if (s.mode === "fly") {
        const t = Math.min(1, (now - s.flyStart) / 800);
        const e = easeInOutCubic(t);
        s.theta = s.fromTheta + (s.toTheta - s.fromTheta) * e;
        s.tilt = s.fromTilt + (s.toTilt - s.fromTilt) * e;
        if (t >= 1) {
          s.mode = "zoom";
          const wrapper = wrapperRef.current;
          if (wrapper) {
            wrapper.style.transform = "scale(2.6)";
            setTimeout(() => {
              wrapper.style.opacity = "0";
            }, 550);
            setTimeout(() => onDoneRef.current?.(), 1050);
          }
        }
      }

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const R = (Math.min(w, h) / 2) * 0.86;
      const dpr = window.devicePixelRatio || 1;

      ctx.clearRect(0, 0, w, h);

      // 球体の下地
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.01, 0, Math.PI * 2);
      ctx.fillStyle = "#0a1120";
      ctx.fill();

      const cosT = Math.cos(s.tilt);
      const sinT = Math.sin(s.tilt);
      for (const p of points) {
        const a = p.lng + s.theta;
        const x = p.cosLat * Math.sin(a);
        const z0 = p.cosLat * Math.cos(a);
        const y = p.sinLat * cosT - z0 * sinT;
        const z = p.sinLat * sinT + z0 * cosT;
        if (z < 0.02) continue; // 裏側は描かない
        const px = cx + x * R;
        const py = cy - y * R;
        ctx.globalAlpha = 0.18 + 0.82 * z;
        ctx.fillStyle = COLORS[p.type];
        const r = SIZES[p.type] * dpr * (0.7 + 0.5 * z);
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 照準フェーズ: 仕向地が正面側にあればパルス発光で「狙いを定める」演出
      if (s.mode === "aim") {
        const a = s.targetLngR + s.theta;
        const cosLatT = Math.cos(s.targetLatR);
        const sinLatT = Math.sin(s.targetLatR);
        const tx = cosLatT * Math.sin(a);
        const tz0 = cosLatT * Math.cos(a);
        const ty = sinLatT * cosT - tz0 * sinT;
        const tz = sinLatT * sinT + tz0 * cosT;
        if (tz > 0.02) {
          const px = cx + tx * R;
          const py = cy - ty * R;
          const elapsed = now - s.aimStart;
          // 柔らかいグロー（背後のハロー）
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = "#f0b95a";
          ctx.beginPath();
          ctx.arc(px, py, 10 * dpr, 0, Math.PI * 2);
          ctx.fill();
          // 拡がるリング（2重・明るめ）
          for (let k = 0; k < 2; k++) {
            const phase = ((elapsed / 650 + k * 0.5) % 1 + 1) % 1;
            ctx.globalAlpha = (1 - phase) * 0.9;
            ctx.strokeStyle = "#ffd27a";
            ctx.lineWidth = 2 * dpr;
            ctx.beginPath();
            ctx.arc(px, py, (4 + phase * 24) * dpr, 0, Math.PI * 2);
            ctx.stroke();
          }
          // 明るいコア
          ctx.globalAlpha = 1;
          ctx.fillStyle = "#ffe6ad";
          ctx.beginPath();
          ctx.arc(px, py, 3.2 * dpr, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // 検索実行: まず仕向地を「照準」（パルス）→ その後に回転（beginFly）
  useEffect(() => {
    if (!flyTarget) return;
    const s = stateRef.current;
    s.targetLatR = (flyTarget.lat * Math.PI) / 180;
    s.targetLngR = (flyTarget.lng * Math.PI) / 180;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // 動きを控える設定なら照準を飛ばして即回転（aimStartを過去にして即遷移）
    s.aimStart = reduce ? performance.now() - 10000 : performance.now();
    s.mode = "aim";
  }, [flyTarget]);

  return (
    <div
      ref={wrapperRef}
      className="h-full w-full flex items-center justify-center"
      style={{
        transition:
          "transform 900ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 450ms ease-out",
      }}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
