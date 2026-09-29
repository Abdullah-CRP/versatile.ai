"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sliders, ShieldCheck, Globe, Play, Loader2, Sparkles, Cpu, Lock } from "lucide-react";
import { Magnetic } from "./Magnetic";
import { GenerationConfig } from "../lib/api";

interface RightSidebarProps {
  config: GenerationConfig;
  onChangeConfig: (config: GenerationConfig) => void;
  onGenerate: () => void;
  isLoading: boolean;
  route: string;
  onChangeRoute: (r: any) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  config,
  onChangeConfig,
  onGenerate,
  isLoading,
  route,
  onChangeRoute,
}) => {
  const updateConfig = (key: keyof GenerationConfig, val: any) => {
    onChangeConfig({ ...config, [key]: val });
  };

  const hasMasking = config.privacy_controls.some((p) => p.action === "mask");
  const hasDifferentialNoise = config.privacy_controls.some((p) => p.action === "differential_noise");
  const hasHashing = config.privacy_controls.some((p) => p.action === "hash");

  const togglePrivacy = (action: "mask" | "differential_noise" | "hash") => {
    let updated = [...config.privacy_controls];
    const exists = updated.some((p) => p.action === action);
    if (exists) {
      updated = updated.filter((p) => p.action !== action);
    } else {
      if (action === "mask") updated.push({ column: "email", action: "mask", mask_char: "*" });
      if (action === "differential_noise") updated.push({ column: "salary", action: "differential_noise", noise_epsilon: 0.3 });
      if (action === "hash") updated.push({ column: "applicant_id", action: "hash" });
    }
    updateConfig("privacy_controls", updated);
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-80 flex-shrink-0 flex flex-col gap-4 h-full"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" strokeWidth={1.5} />
          <h2 className="text-sm font-semibold tracking-tight text-white">Zone 2: Configuration</h2>
        </div>
        <span className="text-[10px] font-mono text-cyan-400/80 px-2 py-0.5 rounded-full bg-cyan-500/[0.08] border border-cyan-500/20">
          Step 3 & 4
        </span>
      </div>

      {/* Main Glass Configuration Card */}
      <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] shadow-glass-sm flex flex-col gap-5 flex-1 overflow-y-auto">
        {/* Pipeline Route Target */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono uppercase tracking-wider text-silver-400">
              Pipeline Synthesis Route
            </label>
            <Cpu className="w-3 h-3 text-cyan-400" />
          </div>
          <select
            value={route}
            onChange={(e) => onChangeRoute(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 transition-colors"
          >
            <option value="auto">Auto-Detect via RAG (Dynamic)</option>
            <option value="relational">Relational Graph (1:1, 1:N, N:M)</option>
            <option value="tabular">Tabular (Single Entity)</option>
            <option value="document">Document (Invoices / Statements)</option>
          </select>
        </div>

        {/* Razor-Thin Slider 1: Row Count */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono uppercase tracking-wider text-silver-400">
              Synthetic Row Count
            </label>
            <span className="text-xs font-mono font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
              {config.row_count} records
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="150"
            value={config.row_count}
            onChange={(e) => updateConfig("row_count", parseInt(e.target.value))}
            className="w-full razor-slider"
          />
          <div className="flex justify-between text-[10px] font-mono text-silver-600 px-0.5">
            <span>5</span>
            <span>75</span>
            <span>150</span>
          </div>
        </div>

        {/* Razor-Thin Slider 2: Edge-Case Injection Rate */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono uppercase tracking-wider text-silver-400">
              Edge-Case Injection Rate
            </label>
            <span className="text-xs font-mono font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
              {Math.round(config.edge_case_rate * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            value={Math.round(config.edge_case_rate * 100)}
            onChange={(e) => updateConfig("edge_case_rate", parseInt(e.target.value) / 100)}
            className="w-full razor-slider"
          />
          <p className="text-[10px] text-silver-500 leading-relaxed font-sans">
            Injects nulls, boundary outliers, and format anomalies for adversarial QA validation.
          </p>
        </div>

        <div className="h-px bg-white/[0.06] my-0.5" />

        {/* Thin-Line Toggle Switches: Privacy Controls */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" strokeWidth={1.5} />
              <label className="text-[11px] font-mono uppercase tracking-wider text-silver-400">
                Privacy Controls
              </label>
            </div>
            <Lock className="w-3 h-3 text-silver-600" />
          </div>

          <div className="space-y-2">
            {[
              {
                id: "mask",
                label: "Column-Level Masking",
                desc: "e****l@synthcorp.io",
                active: hasMasking,
              },
              {
                id: "hash",
                label: "SHA-256 Hashing",
                desc: "Cryptographic tokenized IDs",
                active: hasHashing,
              },
              {
                id: "differential_noise",
                label: "Differential Noise (ε=0.3)",
                desc: "Laplacian perturbation on metrics",
                active: hasDifferentialNoise,
              },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePrivacy(p.id as any)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all duration-200 ${
                  p.active
                    ? "bg-cyan-500/[0.08] border-cyan-500/40 text-white shadow-[0_0_15px_rgba(6,182,212,0.12)]"
                    : "bg-white/[0.02] border-white/[0.06] text-silver-400 hover:bg-white/[0.04] hover:text-silver-300"
                }`}
              >
                <div>
                  <div className="text-xs font-medium text-white">{p.label}</div>
                  <div className="text-[10px] text-silver-500 font-mono mt-0.5">{p.desc}</div>
                </div>

                {/* Thin-line Minimalist Toggle Switch */}
                <div
                  className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                    p.active ? "bg-cyan-400 justify-end shadow-[0_0_8px_#06b6d4]" : "bg-white/10 justify-start"
                  }`}
                >
                  <motion.div
                    layout
                    className={`w-3 h-3 rounded-full transition-colors ${
                      p.active ? "bg-black" : "bg-silver-500"
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-white/[0.06] my-0.5" />

        {/* Locale Settings */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" strokeWidth={1.5} />
            <label className="text-[11px] font-mono uppercase tracking-wider text-silver-400">
              Locale & Tax Rules
            </label>
          </div>
          <select
            value={`${config.locale_settings.currency}|${config.locale_settings.currency_symbol}|${config.locale_settings.tax_rate}`}
            onChange={(e) => {
              const [curr, sym, tax] = e.target.value.split("|");
              updateConfig("locale_settings", {
                ...config.locale_settings,
                currency: curr,
                currency_symbol: sym,
                tax_rate: parseFloat(tax),
              });
            }}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 transition-colors"
          >
            <option value="USD|$|0.0825">USD ($) — US Sales Tax (8.25%)</option>
            <option value="EUR|€|0.19">EUR (€) — EU Standard VAT (19.0%)</option>
            <option value="GBP|£|0.20">GBP (£) — UK Standard VAT (20.0%)</option>
            <option value="CAD|C$|0.13">CAD (C$) — Ontario HST (13.0%)</option>
          </select>
        </div>
      </div>

      {/* Action Button: Borderless, Intensely Glowing "Generate Data" Button */}
      <Magnetic strength={0.3} className="w-full">
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-2xl border-none bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-sm tracking-wide shadow-[0_0_35px_rgba(6,182,212,0.65)] hover:shadow-[0_0_55px_rgba(6,182,212,0.9)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-75 disabled:pointer-events-none group"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span className="font-mono text-xs tracking-wider uppercase">Synthesizing Data...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-black text-black group-hover:scale-110 transition-transform" />
              <span className="tracking-wide uppercase font-mono text-xs font-bold">Generate Data</span>
              <Sparkles className="w-3.5 h-3.5 text-black opacity-80" />
            </>
          )}
        </button>
      </Magnetic>
    </motion.aside>
  );
};
