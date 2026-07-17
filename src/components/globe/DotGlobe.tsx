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
    mode: "auto" as "auto" | "fly" | "zoom",
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

    const draw = (now: number) => {
      const s = stateRef.current;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (s.mode === "auto") {
        s.theta += dt * 0.12; // 自動回転
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

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // 検索実行: 対象国方向への回転を開始
  useEffect(() => {
    if (!flyTarget) return;
    const s = stateRef.current;
    const toTheta = (-flyTarget.lng * Math.PI) / 180;
    // 現在角から最短経路で回す
    const twoPi = Math.PI * 2;
    const from = s.theta % twoPi;
    const diff = ((((toTheta - from) % twoPi) + twoPi * 1.5) % twoPi) - twoPi / 2;
    s.fromTheta = from;
    s.toTheta = from + diff;
    s.fromTilt = s.tilt;
    s.toTilt = (flyTarget.lat * Math.PI) / 180;
    s.flyStart = performance.now();
    s.mode = "fly";
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
