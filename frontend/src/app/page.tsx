"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ShiningParticleCanvas } from "../components/ShiningParticleCanvas";
import { CustomCursor } from "../components/CustomCursor";
import { LeftSidebar } from "../components/LeftSidebar";
import { RightSidebar } from "../components/RightSidebar";
import { CenterCanvas } from "../components/CenterCanvas";
import {
  generateSyntheticData,
  GenerationConfig,
  SynthesisPayload,
  SynthesisResponse,
  TableSchema,
  exportCsv,
  exportJson,
  exportSql,
} from "../lib/api";
import { Sparkles, Terminal, Activity } from "lucide-react";

const PRESET_TEMPLATES: Record<
  string,
  {
    route: "auto" | "relational" | "tabular" | "document";
    business_context: string;
    document_template?: "invoice" | "bank_statement";
    schemas: TableSchema[];
  }
> = {
  relational_ecommerce: {
    route: "relational",
    business_context: "E-Commerce multi-table customer order relationships with referential keys",
    schemas: [
      {
        table_name: "customers",
        row_count: 5,
        columns: [
          { name: "customer_id", type: "integer", is_primary_key: true },
          { name: "full_name", type: "string" },
          { name: "email", type: "email" },
          { name: "city", type: "address" },
          { name: "signup_date", type: "datetime" },
        ],
      },
      {
        table_name: "orders",
        row_count: 20,
        columns: [
          { name: "order_id", type: "uuid", is_primary_key: true },
          { name: "customer_id", type: "integer", foreign_key_target: "customers.customer_id" },
          { name: "order_date", type: "datetime" },
          { name: "order_total", type: "currency", min_value: 35.0, max_value: 1800.0 },
          { name: "status", type: "string" },
          { name: "payment_method", type: "string" },
        ],
      },
    ],
  },
  document_invoice: {
    route: "document",
    document_template: "invoice",
    business_context: "Enterprise B2B Cloud Infrastructure invoices with exact mathematical reconciliation",
    schemas: [],
  },
  document_statement: {
    route: "document",
    document_template: "bank_statement",
    business_context: "Commercial bank statement ledger reconciliation with verified balance checks",
    schemas: [],
  },
  tabular_fintech: {
    route: "tabular",
    business_context: "FinTech risk scoring applicants with privacy masking, hashing, and differential noise",
    schemas: [
      {
        table_name: "credit_applicants",
        row_count: 20,
        columns: [
          { name: "applicant_id", type: "uuid", is_primary_key: true },
          { name: "full_name", type: "string" },
          { name: "email", type: "email" },
          { name: "credit_score", type: "integer", min_value: 450, max_value: 850 },
          { name: "annual_salary", type: "currency", min_value: 45000, max_value: 220000 },
          { name: "risk_tier", type: "string" },
        ],
      },
    ],
  },
};

export default function WorkspacePage() {
  const [selectedTemplate, setSelectedTemplate] = useState("relational_ecommerce");
  const [route, setRoute] = useState<"auto" | "relational" | "tabular" | "document">("auto");
  const [schemas, setSchemas] = useState<TableSchema[]>(PRESET_TEMPLATES.relational_ecommerce.schemas);
  const [accentColor, setAccentColor] = useState<"#06b6d4" | "#fbbf24">("#06b6d4");

  const [config, setConfig] = useState<GenerationConfig>({
    row_count: 20,
    document_volume: 2,
    edge_case_rate: 0.05,
    privacy_controls: [
      { column: "email", action: "mask", mask_char: "*" },
      { column: "annual_salary", action: "differential_noise", noise_epsilon: 0.3 },
    ],
    locale_settings: {
      locale: "en_US",
      currency: "USD",
      currency_symbol: "$",
      tax_rate: 0.0825,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<SynthesisResponse | null>(null);

  const handleSelectTemplate = (tmplKey: string) => {
    setSelectedTemplate(tmplKey);
    const tmpl = PRESET_TEMPLATES[tmplKey];
    if (tmpl) {
      setRoute(tmpl.route);
      setSchemas(tmpl.schemas || []);
    }
  };

  const handleUploadSchema = (rawContent: string) => {
    try {
      const parsed = JSON.parse(rawContent);
      if (parsed.schemas && Array.isArray(parsed.schemas)) {
        setSchemas(parsed.schemas);
      } else if (Array.isArray(parsed)) {
        setSchemas(parsed);
      }
      if (parsed.route) setRoute(parsed.route);
      if (parsed.config) setConfig((prev) => ({ ...prev, ...parsed.config }));
    } catch {
      // Inferred tabular columns from simple CSV headers
      const lines = rawContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length > 0) {
        const headers = lines[0].split(",").map((h) => h.trim().replace(/['"]/g, ""));
        const inferredColumns = headers.map((colName, idx) => ({
          name: colName,
          type: colName.includes("id")
            ? "uuid"
            : colName.includes("date")
            ? "datetime"
            : colName.includes("email")
            ? "email"
            : colName.includes("amount") || colName.includes("price") || colName.includes("salary")
            ? "currency"
            : "string",
          is_primary_key: idx === 0 && colName.includes("id"),
        }));

        setSchemas([
          {
            table_name: "custom_ingested_schema",
            row_count: 20,
            columns: inferredColumns,
          },
        ]);
        setRoute("tabular");
      }
    }
  };

  const executeGeneration = useCallback(async () => {
    setIsLoading(true);

    const activeTemplate = PRESET_TEMPLATES[selectedTemplate];
    const payload: SynthesisPayload = {
      route: route as any,
      business_context: activeTemplate?.business_context || "Enterprise synthetic transaction dataset",
      document_template: activeTemplate?.document_template,
      config,
      schemas: schemas.length > 0 ? schemas : undefined,
    };

    try {
      const result = await generateSyntheticData(payload);
      setGeneratedOutput(result);
    } catch (err) {
      console.error("Synthetic generation failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [route, selectedTemplate, config, schemas]);

  const handleExport = (format: "csv" | "json" | "sql") => {
    if (!generatedOutput?.data) return;

    if (format === "csv") {
      exportCsv(generatedOutput.data, `versatile_${selectedTemplate}.csv`);
    } else if (format === "json") {
      exportJson(generatedOutput.data, `versatile_${selectedTemplate}.json`);
    } else if (format === "sql") {
      exportSql(generatedOutput.data, `versatile_${selectedTemplate}.sql`);
    }
  };

  // Initial synthetic generation on load or template switch
  useEffect(() => {
    executeGeneration();
  }, [selectedTemplate]);

  return (
    <div className="min-h-screen w-full relative flex flex-col p-6 overflow-hidden bg-black text-white">
      {/* High-Performance 60fps Micro-Particle Swarm Canvas with Fluid Cursor Physics & Bloom Spikes */}
      <ShiningParticleCanvas
        isAccelerating={isLoading}
        accentColor={accentColor}
        particleCount={2200}
      />

      {/* Trailing Fluid Spring Cursor */}
      <CustomCursor />

      {/* Floating Top Navigation Header */}
      <header className="flex items-center justify-between max-w-[1780px] w-full mx-auto mb-4 px-3 py-2 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4] animate-pulse" />
            <h1 className="text-sm font-semibold tracking-wide text-white">
              Versatile
            </h1>
          </div>
          <span className="text-silver-600">/</span>
          <span className="text-xs text-silver-400 font-mono tracking-wider">
            SYNTHETIC DATA PLATFORM
          </span>
        </div>

        {/* Backend & Engine Status Indicator */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-silver-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>FastAPI + Gemini AI Engine</span>
          </div>

          {/* Accent Color Palette Selector */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <button
              title="Cyan Bloom (#06b6d4)"
              onClick={() => setAccentColor("#06b6d4")}
              className={`w-3.5 h-3.5 rounded-full transition-transform ${
                accentColor === "#06b6d4"
                  ? "bg-cyan-400 scale-125 shadow-[0_0_8px_#06b6d4]"
                  : "bg-cyan-700 hover:scale-110"
              }`}
            />
            <button
              title="Electric Amber Bloom (#fbbf24)"
              onClick={() => setAccentColor("#fbbf24")}
              className={`w-3.5 h-3.5 rounded-full transition-transform ${
                accentColor === "#fbbf24"
                  ? "bg-amber-400 scale-125 shadow-[0_0_8px_#fbbf24]"
                  : "bg-amber-700 hover:scale-110"
              }`}
            />
          </div>
        </div>
      </header>

      {/* Main 3-Zone Floating Glass Workspace */}
      <main className="flex-1 flex gap-6 max-w-[1780px] w-full mx-auto h-[calc(100vh-6.5rem)] min-h-0">
        {/* Zone 1: Schema Ingestion (Left Panel — Steps 1 & 2) */}
        <LeftSidebar
          schemas={schemas}
          onUploadSchema={handleUploadSchema}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={handleSelectTemplate}
        />

        {/* Zone 3: Live Preview & Export (Center Canvas — Steps 4 & 5) */}
        <CenterCanvas
          data={generatedOutput}
          isLoading={isLoading}
          onExport={handleExport}
        />

        {/* Zone 2: Configuration Console (Right Panel — Step 3) */}
        <RightSidebar
          config={config}
          onChangeConfig={setConfig}
          onGenerate={executeGeneration}
          isLoading={isLoading}
          route={route}
          onChangeRoute={setRoute}
        />
      </main>
    </div>
  );
}
