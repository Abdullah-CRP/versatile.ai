"use client";

import React from "react";
import { Download, FileCode, FileSpreadsheet, Database } from "lucide-react";
import { Magnetic } from "./Magnetic";

interface FloatingExportBarProps {
  onExport: (format: "csv" | "json" | "sql") => void;
  recordCount: number;
}

export const FloatingExportBar: React.FC<FloatingExportBarProps> = ({ onExport, recordCount }) => {
  return (
    <div className="absolute bottom-5 right-5 z-30">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/80 border border-white/10 shadow-glow-cyan-sm backdrop-blur-2xl">
        <div className="flex items-center gap-2 pr-3 border-r border-white/10">
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-mono font-semibold text-white">Export</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
            {recordCount} rows
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Magnetic strength={0.2}>
            <button
              onClick={() => onExport("csv")}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-silver-300 hover:text-white hover:bg-cyan-500/20 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
              <span>CSV</span>
            </button>
          </Magnetic>

          <Magnetic strength={0.2}>
            <button
              onClick={() => onExport("json")}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-silver-300 hover:text-white hover:bg-cyan-500/20 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>JSON</span>
            </button>
          </Magnetic>

          <Magnetic strength={0.2}>
            <button
              onClick={() => onExport("sql")}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-silver-300 hover:text-white hover:bg-cyan-500/20 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>SQL</span>
            </button>
          </Magnetic>
        </div>
      </div>
    </div>
  );
};
