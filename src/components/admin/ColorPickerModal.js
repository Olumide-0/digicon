"use client";

import { useEffect, useRef, useState } from "react";
import SelectField from "@/components/ui/SelectField";

// ── Colour maths ─────────────────────────────────────────────────────────────
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
export function hsvToRgb({ h, s, v }) {
  const f = (n) => {
    const k = (n + h / 60) % 6;
    return Math.round(255 * (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))));
  };
  return { r: f(5), g: f(3), b: f(1) };
}
export function rgbToHsv({ r, g, b }) {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const d = max - Math.min(R, G, B);
  let h = 0;
  if (d) h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}
export const rgbToHex = ({ r, g, b }) => `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
export function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: n >> 16, g: (n >> 8) & 255, b: n & 255 };
}
// Closest preset colour name, so a custom colour still gets a sensible name.
function nearestName(rgb, presets) {
  let best = null;
  for (const p of presets) {
    const q = hexToRgb(p.hex);
    if (!q) continue;
    const d = (q.r - rgb.r) ** 2 + (q.g - rgb.g) ** 2 + (q.b - rgb.b) ** 2;
    if (!best || d < best.d) best = { name: p.name, d };
  }
  return best && best.d < 60 ** 2 ? best.name : "";
}

// Pointer dragging over an element; calls onMove with 0..1 x/y.
function useDrag(onMove) {
  const ref = useRef(null);
  const handle = (e) => {
    const r = ref.current.getBoundingClientRect();
    onMove(clamp((e.clientX - r.left) / r.width, 0, 1), clamp((e.clientY - r.top) / r.height, 0, 1));
  };
  return {
    ref,
    onPointerDown: (e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      handle(e);
    },
    onPointerMove: (e) => e.buttons && handle(e),
  };
}

const slider =
  "h-2.5 w-full cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-transparent [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-transparent";
const small = "h-8 w-full rounded bg-[#4a4a4a] px-2 text-xs text-white outline-none focus:ring-2 focus:ring-brand/60";

// "Color Selection" modal. value: { name, hex } | null. presets: [{ name, hex }].
export default function ColorPickerModal({ value, presets, onSave, onClose }) {
  const start = hexToRgb(value?.hex ?? "") ?? { r: 151, g: 81, b: 242 };
  const [hsv, setHsv] = useState(() => rgbToHsv(start));
  const [hexDraft, setHexDraft] = useState(null); // text while typing in HEX
  const [name, setName] = useState(value?.name ?? "");
  const [nameTouched, setNameTouched] = useState(Boolean(value?.name));
  const [preset, setPreset] = useState("");
  const [error, setError] = useState(null);

  const rgb = hsvToRgb(hsv);
  const hex = rgbToHex(rgb);
  const suggested = nearestName(rgb, presets);
  const shownName = nameTouched ? name : suggested;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const setFromRgb = (c) => {
    setHsv(rgbToHsv(c));
    setPreset("");
  };
  const square = useDrag((x, y) => {
    setHsv((p) => ({ ...p, s: x, v: 1 - y }));
    setPreset("");
  });

  const pickScreen = async () => {
    try {
      const { sRGBHex } = await new window.EyeDropper().open();
      const c = hexToRgb(sRGBHex);
      if (c) setFromRgb(c);
    } catch {
      /* cancelled */
    }
  };
  const canPickScreen = typeof window !== "undefined" && "EyeDropper" in window;

  const save = () => {
    const finalName = shownName.trim();
    if (!finalName) return setError("Give this colour a name customers will see (e.g. Deep Purple).");
    onSave({ name: finalName.slice(0, 40), hex });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-800/55 backdrop-blur-[2px] sm:p-6">
      <div role="dialog" aria-modal="true" aria-labelledby="color-title" className="flex h-full w-full flex-col overflow-y-auto bg-white px-5 pt-8 pb-6 text-ink sm:h-auto sm:max-h-full sm:max-w-[38rem] sm:rounded-sm sm:px-8 sm:pt-9 sm:pb-8">
        <div className="flex items-start justify-between gap-6">
          <h2 id="color-title" className="text-lg font-semibold text-black">
            Color Selection
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="-mt-1 p-1 text-black transition hover:text-brand">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
              <path d="M5 5l14 14M19 5 5 19" />
            </svg>
          </button>
        </div>
        <p className="mt-5 text-sm text-ink">Choose custom colors or select from predefined options</p>

        <p className="mt-7 text-xs font-medium text-ink">Custom color</p>
        <div className="mt-3 rounded-md bg-[#2f2f2f] p-3 sm:w-[28rem] sm:max-w-full">
          <div
            {...square}
            role="slider"
            tabIndex={0}
            aria-label="Saturation and brightness"
            aria-valuenow={Math.round(hsv.s * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={`${hex}, saturation ${Math.round(hsv.s * 100)}%, brightness ${Math.round(hsv.v * 100)}%`}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 0.1 : 0.02;
              const map = { ArrowLeft: ["s", -step], ArrowRight: ["s", step], ArrowUp: ["v", step], ArrowDown: ["v", -step] };
              const m = map[e.key];
              if (!m) return;
              e.preventDefault();
              setHsv((p) => ({ ...p, [m[0]]: clamp(p[m[0]] + m[1], 0, 1) }));
            }}
            className="relative h-40 cursor-crosshair touch-none rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-brand sm:h-44"
            style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h} 100% 50%))` }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
              style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={canPickScreen ? pickScreen : undefined}
              disabled={!canPickScreen}
              title={canPickScreen ? "Pick a colour from the screen" : "Colour picking from the screen needs Chrome or Edge"}
              aria-label="Pick a colour from the screen"
              className="grid size-8 shrink-0 place-items-center rounded text-white disabled:cursor-not-allowed"
              style={{ background: hex }}
            >
              <svg viewBox="0 0 24 24" className="size-4 drop-shadow" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m14 7 3 3M4 20l1-4L15.5 5.5a2.1 2.1 0 0 1 3 3L8 19Z" />
              </svg>
            </button>
            <div className="min-w-32 flex-1 space-y-2.5">
              <input
                type="range"
                min="0"
                max="359"
                value={Math.round(hsv.h)}
                onChange={(e) => {
                  setHsv((p) => ({ ...p, h: Number(e.target.value), s: p.s || 1, v: p.v || 1 }));
                  setPreset("");
                }}
                aria-label="Hue"
                className={slider}
                style={{ background: "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" }}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(hsv.v * 100)}
                onChange={(e) => {
                  setHsv((p) => ({ ...p, v: Number(e.target.value) / 100 }));
                  setPreset("");
                }}
                aria-label="Brightness"
                className={slider}
                style={{ background: `linear-gradient(to right, #000, ${rgbToHex(hsvToRgb({ ...hsv, v: 1 }))})` }}
              />
            </div>
            <div className="grid grid-cols-[5rem_repeat(3,2.75rem)] gap-1.5">
              {["HEX", "R", "G", "B"].map((l) => (
                <span key={l} className="text-[9px] font-semibold text-white/70">
                  {l}
                </span>
              ))}
              <input
                aria-label="Hex colour"
                value={hexDraft ?? hex.toUpperCase()}
                onChange={(e) => {
                  setHexDraft(e.target.value);
                  const c = hexToRgb(e.target.value);
                  if (c) setFromRgb(c);
                }}
                onBlur={() => setHexDraft(null)}
                maxLength={7}
                className={small}
              />
              {["r", "g", "b"].map((k) => (
                <input
                  key={k}
                  aria-label={`${k.toUpperCase()} (0–255)`}
                  inputMode="numeric"
                  value={rgb[k]}
                  onChange={(e) => {
                    const n = clamp(Number(e.target.value.replace(/\D/g, "")) || 0, 0, 255);
                    setFromRgb({ ...rgb, [k]: n });
                  }}
                  className={`${small} text-center`}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="mt-7 mb-3 text-xs font-medium text-ink">Pre- Defined color</p>
        <div className="sm:w-[28rem] sm:max-w-full">
          <SelectField
            name="preset-color"
            label="Pre-defined colour"
            value={preset}
            onChange={(e) => {
              const p = presets.find((x) => x.name === e.target.value);
              const c = p && hexToRgb(p.hex);
              if (!c) return;
              setHsv(rgbToHsv(c));
              setPreset(p.name);
              setName(p.name);
              setNameTouched(true);
              setError(null);
            }}
            options={presets.map((p) => ({ value: p.name, label: p.name, meta: p.hex.toUpperCase() }))}
            placeholder="Select color"
          />
        </div>

        <label htmlFor="color-name" className="mt-6 mb-3 block text-xs font-medium text-ink">
          Colour name <span className="font-normal text-neutral-500">(what customers see)</span>
        </label>
        <div className="flex items-center gap-3 sm:w-[28rem] sm:max-w-full">
          <span className="size-10 shrink-0 rounded-md border border-neutral-200" style={{ background: hex }} aria-hidden />
          <input
            id="color-name"
            value={shownName}
            onChange={(e) => {
              setName(e.target.value);
              setNameTouched(true);
              setError(null);
            }}
            maxLength={40}
            placeholder="e.g. Deep Purple"
            className="h-10 min-w-0 flex-1 rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-10 flex justify-end">
          <button type="button" onClick={save} className="h-10 rounded-md bg-brand px-4 text-[13px] font-medium text-white transition hover:bg-brand-hover">
            Save Product Color
          </button>
        </div>
      </div>
    </div>
  );
}
