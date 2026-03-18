"use client";

import { useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { FormInputField } from "@/components/workspace/form-input-field";
import { FormTextareaField } from "@/components/workspace/form-textarea-field";
import { AnalyzeResults } from "@/components/workspace/analyze-results";
import { StatusMessage } from "@/components/workspace/status-message";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import type { AnalyzeRequest, AnalyzeResponse, AnalyzeMode, DataSourceType } from "@/lib/contracts/workspace";

const initialRequest: AnalyzeRequest = {
  mode: "formula_analyzer",
  artifactName: "Order Gallery Items",
  artifactPurpose: "Load manager-visible orders with role-based filtering.",
  dataSource: "sql",
  symptoms: "Slow screen rendering, repeated data calls, and concern about delegation when records grow.",
  inputPayload: `Filter(\n  Orders,\n  CustomerId = selectedCustomer.Id &&\n  LookUp(Users, Id = User().Email, Role) = \"Manager\"\n)`,
  relatedFormulas: "Set(varManagerRole, LookUp(Users, Id = User().Email, Role))"
};

const analyzeModes: { value: AnalyzeMode; label: string }[] = [
  { value: "formula_analyzer", label: "Formula Analyzer" },
  { value: "screen_analyzer", label: "Screen Analyzer" },
  { value: "component_analyzer", label: "Component Analyzer" },
  { value: "performance_advisor", label: "Performance Advisor" }
];

const dataSourceOptions: { value: DataSourceType; label: string }[] = [
  { value: "dataverse", label: "Dataverse" },
  { value: "sql", label: "SQL" },
  { value: "sharepoint", label: "SharePoint" },
  { value: "api", label: "API" },
  { value: "mixed", label: "Mixed" },
  { value: "other", label: "Other" }
];

export default function AnalyzePage() {
  const [request, setRequest] = useState<AnalyzeRequest>(initialRequest);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFieldChange = <K extends keyof AnalyzeRequest>(field: K, value: AnalyzeRequest[K]) => {
    setRequest((current) => ({ ...current, [field]: value }));
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error("Analyze request failed.");
      }

      const payload = (await response.json()) as AnalyzeResponse;
      setResult(payload);
    } catch (error) {
      console.error(error);
      setErrorMessage("We couldn't complete the analysis right now. Please retry in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Analyze Studio"
        description="Inspect Power Fx formulas for delegation issues, repeated lookups, and data loading inefficiencies with a clearer input and findings workflow."
        actions={
          <Button onClick={handleAnalyze} disabled={isLoading}>
            {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {isLoading ? "Analyzing..." : "Run Analyze"}
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.95fr)_minmax(0,1.45fr)]">
        <SectionCard
          title="Analysis Input"
          description="Define the artifact context and formula payload. Results render separately so findings stay easy to review and share."
          className="h-fit"
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Analyzer mode</span>
                <select
                  value={request.mode}
                  onChange={(event) => handleFieldChange("mode", event.target.value as AnalyzeMode)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {analyzeModes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Data source</span>
                <select
                  value={request.dataSource}
                  onChange={(event) => handleFieldChange("dataSource", event.target.value as DataSourceType)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {dataSourceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <FormInputField
              label="Artifact name"
              value={request.artifactName}
              placeholder="Gallery Items formula"
              onChange={(value) => handleFieldChange("artifactName", value)}
            />
            <FormTextareaField
              label="Artifact purpose"
              value={request.artifactPurpose}
              rows={3}
              placeholder="Describe what this artifact is responsible for."
              onChange={(value) => handleFieldChange("artifactPurpose", value)}
            />
            <FormTextareaField
              label="Symptoms or concerns"
              value={request.symptoms}
              rows={3}
              placeholder="Slow loads, delegation warnings, duplicated logic..."
              onChange={(value) => handleFieldChange("symptoms", value)}
            />
            <FormTextareaField
              label="Analyze payload"
              value={request.inputPayload}
              rows={8}
              placeholder="Paste the primary formula, screen logic, or component definition."
              onChange={(value) => handleFieldChange("inputPayload", value)}
            />
            <FormTextareaField
              label="Related formulas"
              value={request.relatedFormulas ?? ""}
              rows={4}
              placeholder="Optional supporting formulas or helper variables."
              onChange={(value) => handleFieldChange("relatedFormulas", value)}
            />

            {errorMessage ? <StatusMessage message={errorMessage} tone="error" /> : null}
          </div>
        </SectionCard>

        <SectionCard
          title="Structured Findings"
          description="Analysis output is organized into findings, issues, risks, and recommendations for faster triage."
        >
          <AnalyzeResults result={result} />
        </SectionCard>
      </div>
    </PageContainer>
  );
}
