"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  Layers,
  ChevronDown,
  ChevronRight,
  Key,
  Link2,
  Hash,
  Type,
  Calendar,
  Mail,
  DollarSign,
  FileJson,
  Sparkles,
} from "lucide-react";
import { TableSchema } from "../lib/api";

interface LeftSidebarProps {
  schemas: TableSchema[];
  onUploadSchema: (content: string) => void;
  selectedTemplate: string;
  onSelectTemplate: (tmpl: string) => void;
}

const TEMPLATES = [
  { id: "relational_ecommerce", label: "Relational E-Commerce", badge: "1:N FK" },
  { id: "document_invoice", label: "Corporate Invoices", badge: "Reconciled" },
  { id: "document_statement", label: "Commercial Statement", badge: "Ledger" },
  { id: "tabular_fintech", label: "FinTech Risk Scoring", badge: "Privacy" },
];

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  schemas,
  onUploadSchema,
  selectedTemplate,
  onSelectTemplate,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({
    customers: true,
    orders: true,
    credit_applicants: true,
  });

  const toggleTable = (tableName: string) => {
    setExpandedTables((prev) => ({ ...prev, [tableName]: !prev[tableName] }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUploadSchema(event.target.result as string);
        }
      };
      reader.readAsText(files[0]);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "uuid":
      case "integer":
      case "int":
      case "number":
        return <Hash className="w-3 h-3 text-cyan-400" strokeWidth={1.5} />;
      case "currency":
        return <DollarSign className="w-3 h-3 text-amber-400" strokeWidth={1.5} />;
      case "email":
        return <Mail className="w-3 h-3 text-cyan-300" strokeWidth={1.5} />;
      case "datetime":
      case "date":
        return <Calendar className="w-3 h-3 text-cyan-200" strokeWidth={1.5} />;
      default:
        return <Type className="w-3 h-3 text-silver-400" strokeWidth={1.5} />;
    }
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-80 flex-shrink-0 flex flex-col gap-4 h-full"
    >
      {/* Brand Header: Floating Glass */}
      <div className="flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping absolute" />
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-white">Versatile</span>
              <span className="text-[10px] font-mono tracking-widest px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                AI
              </span>
            </div>
            <p className="text-[10px] tracking-wider text-silver-400 uppercase font-mono">Zone 1: Schema Ingestion</p>
          </div>
        </div>
        <div className="text-[10px] font-mono text-cyan-400/80 px-2 py-0.5 rounded-full bg-cyan-500/[0.08] border border-cyan-500/20">
          Step 1 & 2
        </div>
      </div>

      {/* Preset Scenarios */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] shadow-glass-sm flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-silver-400 font-medium">
            <Layers className="w-3.5 h-3.5 text-cyan-400" strokeWidth={1.5} />
            <span className="text-[11px] uppercase tracking-wider">Enterprise Blueprints</span>
          </div>
          <Sparkles className="w-3 h-3 text-cyan-400/60" />
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {TEMPLATES.map((tmpl) => {
            const isActive = selectedTemplate === tmpl.id;
            return (
              <button
                key={tmpl.id}
                onClick={() => onSelectTemplate(tmpl.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-200 text-left ${
                  isActive
                    ? "bg-white/[0.08] border border-cyan-500/40 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    : "text-silver-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <span className="truncate font-medium">{tmpl.label}</span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "bg-white/[0.05] text-silver-500"
                  }`}
                >
                  {tmpl.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Glowing Dashed Drop-Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative p-5 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center gap-2 group backdrop-blur-2xl ${
          isDragOver
            ? "border-cyan-400 bg-cyan-500/[0.08] shadow-[0_0_30px_rgba(6,182,212,0.35)] scale-[1.01]"
            : "border-white/15 bg-white/[0.02] hover:border-cyan-400/50 hover:bg-cyan-500/[0.03]"
        }`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            isDragOver
              ? "bg-cyan-400/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
              : "bg-white/[0.04] text-silver-400 group-hover:text-cyan-300 group-hover:bg-cyan-500/10"
          }`}
        >
          <UploadCloud className="w-5 h-5" strokeWidth={1.5} />
        </div>

        <div>
          <p className="text-xs font-medium text-white tracking-wide">
            Drop Schema <span className="text-silver-400 font-normal">or</span> CSV Sample
          </p>
          <p className="text-[10px] text-silver-500 mt-0.5 font-mono">JSON definition or tabular extract</p>
        </div>

        <label className="cursor-pointer mt-1 px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-cyan-500/20 hover:border-cyan-400/40 border border-white/10 text-silver-200 hover:text-white text-[11px] font-medium transition-all duration-200 shadow-sm flex items-center gap-1.5">
          <FileJson className="w-3 h-3 text-cyan-400" />
          <span>Browse File</span>
          <input
            type="file"
            accept=".json,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                  if (evt.target?.result) onUploadSchema(evt.target.result as string);
                };
                reader.readAsText(file);
              }
            }}
          />
        </label>
      </div>

      {/* Minimalist Inferred Schema Tree-View */}
      <div className="flex-1 p-4 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] shadow-glass-sm overflow-hidden flex flex-col min-h-0">
        <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-silver-400">Inferred Schema</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">RAG Ingestion</span>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-2 text-xs">
          {schemas && schemas.length > 0 ? (
            schemas.map((table) => {
              const isOpen = expandedTables[table.table_name] ?? true;
              return (
                <div
                  key={table.table_name}
                  className="rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.06]"
                >
                  <button
                    onClick={() => toggleTable(table.table_name)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-white/[0.03] hover:bg-white/[0.06] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      {isOpen ? (
                        <ChevronDown className="w-3 h-3 text-cyan-400" strokeWidth={1.5} />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-silver-500" strokeWidth={1.5} />
                      )}
                      <span className="font-mono text-xs font-semibold text-white tracking-wide">
                        {table.table_name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-silver-400">
                      {table.columns?.length || 0} cols
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-3 py-2 space-y-1.5 border-t border-white/[0.04]"
                      >
                        {table.columns?.map((col) => (
                          <div
                            key={col.name}
                            className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-white/[0.03] text-[11px] transition-colors"
                          >
                            <div className="flex items-center gap-2 truncate">
                              {getTypeIcon(col.type)}
                              <span className="text-silver-300 font-mono truncate">{col.name}</span>
                              {col.is_primary_key && (
                                <span className="flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                                  <Key className="w-2.5 h-2.5" />
                                  PK
                                </span>
                              )}
                              {col.foreign_key_target && (
                                <span
                                  title={`FK -> ${col.foreign_key_target}`}
                                  className="flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono truncate max-w-[90px]"
                                >
                                  <Link2 className="w-2.5 h-2.5 flex-shrink-0" />
                                  FK
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-silver-500 ml-2 uppercase">
                              {col.type}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-silver-500">
              <p className="text-xs">No explicit schema loaded.</p>
              <p className="text-[10px] mt-1 text-silver-600">Dynamic AI synthesis will deduce target fields automatically.</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
