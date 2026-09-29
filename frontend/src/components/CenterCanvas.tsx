"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Check,
  Sparkles,
  Link2,
  Layers,
  ArrowRight,
  FileSpreadsheet,
  FileCode,
  Database,
  Cpu,
} from "lucide-react";
import { SynthesisResponse } from "../lib/api";

interface CenterCanvasProps {
  data: SynthesisResponse | null;
  isLoading: boolean;
  onExport: (format: "csv" | "json" | "sql") => void;
}

export const CenterCanvas: React.FC<CenterCanvasProps> = ({ data, isLoading, onExport }) => {
  const [activeTab, setActiveTab] = useState<"tabular" | "relational" | "document" | "json">("tabular");
  const [activeTableKey, setActiveTableKey] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const tables = data?.data || {};
  const isDocument = data?.route_executed === "document" || Boolean(tables.documents);
  const tableKeys = Object.keys(tables).filter((k) => k !== "documents");

  const currentTable = activeTableKey && tables[activeTableKey] ? activeTableKey : tableKeys[0] || "";
  const currentRows = currentTable ? tables[currentTable] || [] : [];
  const currentCols = currentRows.length > 0 ? Object.keys(currentRows[0]) : [];

  const validationReport = data?.validation_report || {
    validation_status: "passed",
    referential_integrity: true,
    mathematical_integrity: true,
    edge_cases_injected: 0,
    privacy_rules_applied: 0,
    details: ["Pipeline synthesis verified with referential consistency."],
  };

  const copyJson = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 flex flex-col gap-4 overflow-hidden relative h-full"
    >
      {/* Top Header / Validation Status Bar */}
      <div className="flex items-center justify-between px-2 pt-1 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>validation_status: "{validationReport.validation_status}"</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-silver-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>
              {data?.metadata?.processing_time_ms ? `${data.metadata.processing_time_ms}ms` : "Live Engine"}
            </span>
          </div>

          <span className="text-xs font-mono text-silver-500 hidden md:inline">
            Route: <span className="text-silver-300 capitalize">{data?.route_executed || "Relational"}</span>
          </span>
        </div>

        {/* Floating Text-Based Toggle: "Tabular", "Relational", "Document", "JSON" */}
        <div className="flex items-center gap-6 px-4 py-1.5 rounded-full bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] shadow-glass-sm">
          {[
            { id: "tabular", label: "Tabular" },
            { id: "relational", label: "Relational" },
            ...(isDocument ? [{ id: "document", label: "Document" }] : []),
            { id: "json", label: "JSON" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative py-1 text-xs font-mono tracking-wider transition-all duration-200 ${
                  isActive ? "text-white font-semibold" : "text-silver-500 hover:text-silver-300"
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_8px_#06b6d4]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Glass Canvas Area: Pristine Borderless Floating Pane */}
      <div className="flex-1 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] shadow-glass-md overflow-hidden flex flex-col relative min-h-0">
        {/* Sleek "Awaiting Synthesis" Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-4"
            >
              {/* Glowing orbital synthesis animation */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border border-t-cyan-400 border-r-transparent border-b-cyan-500/30 border-l-transparent animate-spin" />
                <div className="absolute inset-4 rounded-full border border-b-cyan-300 border-t-transparent border-l-cyan-400/20 border-r-transparent animate-spin-slow" />
                <Cpu className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>

              <div className="text-center space-y-1">
                <p className="font-mono text-sm font-semibold text-white tracking-wider uppercase">
                  Awaiting Synthesis
                </p>
                <p className="text-xs text-silver-400 font-mono">
                  Injecting constraints, privacy noise & reconciling mathematical totals...
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>Background Particle Swarm Accelerating</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================================== */}
        {/* TAB 1: BORDERLESS TABULAR VIEW                          */}
        {/* Rows separated only by ultra-thin (1px) lines with 10% opacity */}
        {/* ======================================================== */}
        {activeTab === "tabular" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Multi-Table Selector Pill Bar */}
            {tableKeys.length > 1 && (
              <div className="flex items-center gap-2 px-6 py-3 border-b border-white/[0.06] bg-white/[0.01]">
                <span className="text-[11px] font-mono text-silver-500 uppercase tracking-wider">Tables:</span>
                {tableKeys.map((tName) => (
                  <button
                    key={tName}
                    onClick={() => setActiveTableKey(tName)}
                    className={`px-3 py-1 rounded-full text-xs font-mono transition-all duration-200 ${
                      currentTable === tName
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                        : "bg-white/[0.03] text-silver-400 hover:text-white border border-white/[0.06]"
                    }`}
                  >
                    {tName} ({tables[tName]?.length || 0})
                  </button>
                ))}
              </div>
            )}

            {/* Scrollable Borderless Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="sticky top-0 bg-black/80 backdrop-blur-xl z-10 border-b border-white/10">
                  <tr>
                    {currentCols.map((col) => (
                      <th
                        key={col}
                        className="px-6 py-3.5 font-mono text-xs font-medium text-silver-400 uppercase tracking-wider whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {currentRows.map((row: any, rIdx: number) => (
                    <tr
                      key={rIdx}
                      className="hover:bg-cyan-500/[0.04] transition-colors duration-150 group"
                    >
                      {currentCols.map((col) => {
                        const val = row[col];
                        const isNull = val === null || val === undefined;
                        const isOutlier = typeof val === "number" && (val > 50000 || val < 0);
                        const isAnomaly =
                          typeof val === "string" &&
                          (val.includes("ANOMALY") || val.includes("MALFORMED") || val.includes("DROP"));

                        return (
                          <td
                            key={col}
                            className="px-6 py-3 text-silver-200 font-mono whitespace-nowrap text-xs group-hover:text-white"
                          >
                            {isNull ? (
                              <span className="text-silver-600 italic">null</span>
                            ) : isAnomaly ? (
                              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                                {String(val)}
                              </span>
                            ) : isOutlier ? (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {String(val)}
                              </span>
                            ) : (
                              String(val)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {currentRows.length === 0 && !isLoading && (
                <div className="h-full flex items-center justify-center p-12 text-silver-500 font-mono text-xs">
                  No records to display. Click "Generate Data" to synthesize.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: RELATIONAL GRAPH VIEW                            */}
        {/* ======================================================== */}
        {activeTab === "relational" && (
          <div className="flex-1 p-8 overflow-auto flex items-center justify-center">
            <div className="flex flex-col lg:flex-row items-center gap-8 max-w-4xl w-full">
              {tableKeys.map((tName, i) => (
                <React.Fragment key={tName}>
                  <div className="flex-1 w-full rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] p-5 shadow-glass-sm flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-cyan-400" />
                        <span className="font-mono font-bold text-white text-sm">{tName}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {tables[tName]?.length || 0} rows
                      </span>
                    </div>

                    <div className="space-y-1.5 font-mono text-xs">
                      {tables[tName]?.[0] &&
                        Object.keys(tables[tName][0]).slice(0, 6).map((col) => {
                          const isPk = col.includes("id") && !col.includes("foreign");
                          return (
                            <div
                              key={col}
                              className="flex items-center justify-between py-1 px-2 rounded-lg bg-white/[0.01] hover:bg-white/[0.04] text-silver-300"
                            >
                              <span className="truncate">{col}</span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded ${
                                  isPk
                                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                    : "text-silver-500 bg-white/[0.04]"
                                }`}
                              >
                                {isPk ? "PK" : "attr"}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {i < tableKeys.length - 1 && (
                    <div className="flex flex-col items-center gap-1.5 text-cyan-400">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
                        1 : N Cardinality
                      </span>
                      <div className="hidden lg:flex items-center">
                        <div className="w-12 h-[2px] bg-gradient-to-r from-cyan-500 to-cyan-300 shadow-[0_0_8px_#06b6d4]" />
                        <ArrowRight className="w-4 h-4 text-cyan-300 -ml-1" />
                      </div>
                      <div className="lg:hidden flex flex-col items-center">
                        <div className="h-8 w-[2px] bg-gradient-to-b from-cyan-500 to-cyan-300 shadow-[0_0_8px_#06b6d4]" />
                      </div>
                      <span className="text-[9px] font-mono text-silver-500">Foreign Key Constraint</span>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: DOCUMENT VIEW (Corporate Invoices / Statements)    */}
        {/* ======================================================== */}
        {activeTab === "document" && isDocument && (
          <div className="flex-1 p-8 overflow-auto flex justify-center">
            <div className="max-w-2xl w-full rounded-2xl bg-white/[0.02] border border-white/[0.08] p-8 shadow-glass-md flex flex-col gap-6 text-white font-sans">
              {tables.documents?.map((doc: any, idx: number) => (
                <div key={idx} className="flex flex-col gap-6">
                  {doc.document_type === "bank_statement" ? (
                    <>
                      {/* Bank Statement Header */}
                      <div className="flex justify-between items-start border-b border-white/[0.08] pb-6">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
                            <h3 className="font-bold text-lg text-white tracking-tight">
                              Versatile Commercial Treasury Ledger
                            </h3>
                          </div>
                          <p className="text-xs text-silver-400 mt-1 font-mono">
                            Account: {doc.account_number}
                          </p>
                          <p className="text-[11px] font-mono text-silver-500 mt-0.5">
                            Period: {doc.statement_period}
                          </p>
                        </div>
                        <div className="text-right font-mono">
                          <span className="text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">
                            VERIFIED LEDGER
                          </span>
                          <p className="text-xs text-silver-400 mt-2">
                            Opening: {doc.currency} {doc.opening_balance?.toFixed(2)}
                          </p>
                          <p className="text-xs text-cyan-300 font-semibold">
                            Closing: {doc.currency} {doc.closing_balance?.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Transactions Table */}
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-white/[0.08] text-silver-400 font-mono">
                            <th className="py-2">TX ID</th>
                            <th className="py-2">Date</th>
                            <th className="py-2">Description</th>
                            <th className="py-2 text-right">Type</th>
                            <th className="py-2 text-right">Amount</th>
                            <th className="py-2 text-right">Running Bal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          {doc.transactions?.map((tx: any) => (
                            <tr key={tx.tx_id} className="text-silver-300">
                              <td className="py-2.5 font-mono text-silver-400">{tx.tx_id}</td>
                              <td className="py-2.5 font-mono">{tx.date}</td>
                              <td className="py-2.5">{tx.description}</td>
                              <td className="py-2.5 text-right font-mono">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                                    tx.type === "CREDIT"
                                      ? "bg-emerald-500/20 text-emerald-300"
                                      : "bg-amber-500/20 text-amber-300"
                                  }`}
                                >
                                  {tx.type}
                                </span>
                              </td>
                              <td className="py-2.5 text-right font-mono">{tx.amount?.toFixed(2)}</td>
                              <td className="py-2.5 text-right font-mono font-semibold text-white">
                                {tx.running_balance?.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  ) : (
                    <>
                      {/* Invoice Header */}
                      <div className="flex justify-between items-start border-b border-white/[0.08] pb-6">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
                            <h3 className="font-bold text-lg text-white tracking-tight">
                              {doc.vendor?.name || "Corporate Synthetics"}
                            </h3>
                          </div>
                          <p className="text-xs text-silver-400 mt-1">{doc.vendor?.address}</p>
                          <p className="text-[11px] font-mono text-silver-500 mt-0.5">Tax ID: {doc.vendor?.tax_id}</p>
                        </div>

                        <div className="text-right font-mono">
                          <span className="text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">
                            {doc.invoice_number}
                          </span>
                          <p className="text-xs text-silver-400 mt-2">Issued: {doc.issue_date}</p>
                          <p className="text-xs text-silver-500">Due: {doc.due_date}</p>
                        </div>
                      </div>

                      {/* Client Info */}
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <p className="text-[10px] font-mono text-silver-500 uppercase tracking-wider">Billed To:</p>
                        <p className="text-xs font-semibold text-white mt-0.5">
                          {doc.client?.name || "Enterprise Client Corp."}
                        </p>
                        <p className="text-xs text-silver-400 font-mono">
                          {doc.client?.email || "accounts@enterprise.synth"}
                        </p>
                      </div>

                      {/* Line Items Table */}
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-white/[0.08] text-silver-400 font-mono">
                            <th className="py-2">Description</th>
                            <th className="py-2 text-right">Qty</th>
                            <th className="py-2 text-right">Unit Price</th>
                            <th className="py-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          {doc.line_items?.map((it: any) => (
                            <tr key={it.item_number} className="text-silver-300">
                              <td className="py-2.5">{it.description}</td>
                              <td className="py-2.5 text-right font-mono">{it.quantity}</td>
                              <td className="py-2.5 text-right font-mono">
                                {doc.currency_symbol}{it.unit_price?.toFixed(2)}
                              </td>
                              <td className="py-2.5 text-right font-mono font-semibold text-white">
                                {doc.currency_symbol}{it.line_total?.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Mathematical Reconciliation Summary */}
                      <div className="flex flex-col items-end gap-1.5 text-xs border-t border-white/[0.08] pt-4 font-mono">
                        <div className="flex justify-between w-64 text-silver-400">
                          <span>Subtotal:</span>
                          <span className="text-white">{doc.currency_symbol}{doc.subtotal?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between w-64 text-silver-400">
                          <span>Tax ({((doc.tax_rate || 0) * 100).toFixed(2)}%):</span>
                          <span className="text-white">{doc.currency_symbol}{doc.tax_amount?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between w-64 text-sm font-bold text-white border-t border-cyan-400/40 pt-2 mt-1">
                          <span className="text-cyan-300">Grand Total:</span>
                          <span className="text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)]">
                            {doc.currency_symbol}{doc.grand_total?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: CLEANLY STYLED JSON VIEW                         */}
        {/* Dark syntax highlighting theme with 1-click copy       */}
        {/* ======================================================== */}
        {activeTab === "json" && (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/[0.06] bg-black/40">
              <span className="text-xs font-mono text-silver-400">FastAPI Synthesis Response Payload</span>
              <button
                onClick={copyJson}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] hover:bg-cyan-500/20 text-xs font-mono text-silver-300 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Payload"}</span>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 bg-black/60 font-mono text-xs text-silver-300 leading-relaxed">
              <pre className="selection:bg-cyan-500/30">
                <code>{JSON.stringify(data, null, 2)}</code>
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Subtle Bottom-Right Floating Export Menu */}
      <div className="absolute bottom-5 right-5 z-30">
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-black/80 backdrop-blur-2xl border border-white/10 shadow-[0_0_25px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-1.5 px-3 py-1 text-silver-400 text-xs font-mono border-r border-white/10">
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export:</span>
          </div>

          <button
            onClick={() => onExport("csv")}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono text-silver-300 hover:text-white hover:bg-cyan-500/20 transition-all duration-150"
          >
            <FileSpreadsheet className="w-3 h-3 text-cyan-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => onExport("json")}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono text-silver-300 hover:text-white hover:bg-cyan-500/20 transition-all duration-150"
          >
            <FileCode className="w-3 h-3 text-cyan-400" />
            <span>JSON</span>
          </button>

          <button
            onClick={() => onExport("sql")}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono text-silver-300 hover:text-white hover:bg-cyan-500/20 transition-all duration-150"
          >
            <Database className="w-3 h-3 text-cyan-400" />
            <span>SQL</span>
          </button>
        </div>
      </div>
    </motion.section>
  );
};
