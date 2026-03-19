"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download } from "lucide-react";

import { Button } from "@/components/ui/button";

type RunExportActionsProps = {
  runType: string;
  input: unknown;
  output: unknown;
  generatedAt?: string;
  fileName: string;
};

type ExportPayload = {
  metadata: {
    runType: string;
    generatedAt: string | null;
    exportedAt: string;
  };
  input: unknown;
  output: unknown;
};

function createExportPayload({ runType, input, output, generatedAt }: Omit<RunExportActionsProps, "fileName">): ExportPayload {
  return {
    metadata: {
      runType,
      generatedAt: generatedAt ?? null,
      exportedAt: new Date().toISOString()
    },
    input,
    output
  };
}

export function RunExportActions({ runType, input, output, generatedAt, fileName }: RunExportActionsProps) {
  const [copied, setCopied] = useState(false);

  const exportValue = useMemo(
    () => JSON.stringify(createExportPayload({ runType, input, output, generatedAt }), null, 2),
    [generatedAt, input, output, runType]
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(exportValue);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const blob = new Blob([exportValue], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-background/60 p-2">
      <span className="px-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Export</span>
      <Button type="button" variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-1.5">
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied JSON" : "Copy JSON"}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={handleDownload} className="h-8 gap-1.5">
        <Download className="h-3.5 w-3.5" />
        Download JSON
      </Button>
    </div>
  );
}
