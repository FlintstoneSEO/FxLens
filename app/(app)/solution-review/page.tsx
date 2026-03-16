"use client";

import { useMemo, useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { PerformanceRecommendationCard } from "@/components/workspace/result-cards";
import { FormInputField } from "@/components/workspace/form-input-field";
import { OutputBlock } from "@/components/workspace/output-block";
import { StatusMessage } from "@/components/workspace/status-message";
import type {
  SolutionArtifact,
  SolutionReviewRequest,
  SolutionReviewResponse,
  SolutionUploadMetadata,
  UploadFileFormat
} from "@/lib/contracts/workspace";

type DomainArtifactType = SolutionArtifact["artifactType"];

type UploadFormState = {
  solutionName: string;
  environmentName: string;
  version: string;
  uploadedBy: string;
  fileFormat: UploadFileFormat;
  artifactType: DomainArtifactType;
  artifactName: string;
};

const initialFormState: UploadFormState = {
  solutionName: "Field Operations Accelerator",
  environmentName: "UAT - North America",
  version: "1.7.0",
  uploadedBy: "alex.rivera@fxlens.dev",
  fileFormat: "zip",
  artifactType: "other",
  artifactName: "field-operations-accelerator.zip"
};

export default function SolutionReviewPage() {
  const [formState, setFormState] = useState<UploadFormState>(initialFormState);
  const [artifacts, setArtifacts] = useState<SolutionArtifact[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string>("No artifacts uploaded yet.");
  const [response, setResponse] = useState<SolutionReviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canRunReview = artifacts.length > 0;

  const metadata: SolutionUploadMetadata = useMemo(
    () => ({
      solutionName: formState.solutionName,
      environmentName: formState.environmentName,
      version: formState.version,
      uploadedBy: formState.uploadedBy,
      uploadedAt: new Date().toISOString()
    }),
    [formState.environmentName, formState.solutionName, formState.uploadedBy, formState.version]
  );

  const handleFieldChange = <K extends keyof UploadFormState>(key: K, value: UploadFormState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleMockUpload = async (): Promise<void> => {
    setIsUploading(true);
    setError(null);

    await new Promise((resolve) => setTimeout(resolve, 450));

    const artifactId = `artifact-${artifacts.length + 1}`;
    const nextArtifact: SolutionArtifact = {
      id: artifactId,
      artifactType: formState.artifactType,
      fileFormat: formState.fileFormat,
      name: formState.artifactName,
      summary: `${formState.fileFormat.toUpperCase()} file uploaded for ${formState.solutionName}.`,
      sourcePath: `/mock/${formState.artifactName}`
    };

    setArtifacts((prev) => [...prev, nextArtifact]);
    setUploadMessage(`Uploaded ${formState.artifactName} successfully.`);
    setIsUploading(false);
  };

  const handleRunReview = async (): Promise<void> => {
    setIsReviewing(true);
    setError(null);

    const payload: SolutionReviewRequest = {
      metadata,
      artifacts,
      context: {
        workspaceId: "workspace-demo",
        correlationId: crypto.randomUUID()
      }
    };

    try {
      const result = await fetch("/api/solution-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!result.ok) {
        throw new Error("Unable to run solution review.");
      }

      const data = (await result.json()) as SolutionReviewResponse;
      setResponse(data);
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "Unexpected error while reviewing solution.");
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Solution Review Workspace"
        description="Upload solution artifacts to inventory architecture patterns, detect risk areas, and receive structured refactor recommendations."
        actions={
          <Button onClick={handleRunReview} disabled={!canRunReview || isReviewing}>
            {isReviewing ? "Reviewing..." : "Run Review"}
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.18fr]">
        <SectionCard
          title="Artifact Intake"
          description="Mock upload experience for Phase validation. File parsing and backend processing will be integrated in future phases."
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-dashed border-border/80 bg-background/70 p-5">
              <p className="text-sm font-medium">Upload Zone</p>
              <p className="mt-1 text-xs text-muted-foreground">Accepted file formats: zip, yaml, txt, json</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <label className="space-y-1.5">
                  <span className="text-sm font-medium">File Format</span>
                  <select
                    value={formState.fileFormat}
                    onChange={(event) => handleFieldChange("fileFormat", event.target.value as UploadFileFormat)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="zip">zip</option>
                    <option value="yaml">yaml</option>
                    <option value="txt">txt</option>
                    <option value="json">json</option>
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium">Domain Artifact Type</span>
                  <select
                    value={formState.artifactType}
                    onChange={(event) =>
                      handleFieldChange("artifactType", event.target.value as SolutionArtifact["artifactType"])
                    }
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="screen">screen</option>
                    <option value="component">component</option>
                    <option value="formula">formula</option>
                    <option value="flow">flow</option>
                    <option value="table">table</option>
                    <option value="other">other</option>
                  </select>
                </label>

                <FormInputField
                  label="Artifact File Name"
                  value={formState.artifactName}
                  onChange={(value) => handleFieldChange("artifactName", value)}
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">{uploadMessage}</p>
                <Button type="button" variant="secondary" onClick={handleMockUpload} disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Mock Upload"}
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <FormInputField
                label="Solution Name"
                value={formState.solutionName}
                onChange={(value) => handleFieldChange("solutionName", value)}
              />
              <FormInputField
                label="Environment Name"
                value={formState.environmentName}
                onChange={(value) => handleFieldChange("environmentName", value)}
              />
              <FormInputField
                label="Version"
                value={formState.version}
                onChange={(value) => handleFieldChange("version", value)}
              />
              <FormInputField
                label="Uploaded By"
                value={formState.uploadedBy}
                onChange={(value) => handleFieldChange("uploadedBy", value)}
              />
            </div>

            <section className="rounded-xl border border-border/70 bg-background/60 p-4">
              <h3 className="mb-2 text-sm font-semibold tracking-tight">Mock Artifact List</h3>
              {artifacts.length === 0 ? (
                <StatusMessage tone="info" message="No artifacts in review queue." />
              ) : (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {artifacts.map((artifact) => (
                    <li key={artifact.id} className="rounded-lg border border-border/60 bg-card/70 px-3 py-2">
                      <p className="font-medium text-foreground">{artifact.name}</p>
                      <p className="text-xs uppercase tracking-wide">
                        Type: {artifact.artifactType} · Format: {artifact.fileFormat ?? "n/a"}
                      </p>
                      <p className="text-xs">{artifact.summary}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </SectionCard>

        <SectionCard
          title="Structured Review Output"
          description="Response rendered from /api/solution-review using shared contracts."
        >
          {error ? <StatusMessage tone="error" message={error} /> : null}

          {!response && !error ? (
            <StatusMessage tone="info" message="Run review to generate inventory and recommendation output." />
          ) : null}

          {response ? (
            <div className="space-y-4">
              <OutputBlock title="Inventory Summary" items={[response.inventorySummary]} />
              <OutputBlock title="Architectural Findings" items={response.architecturalFindings} />

              <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-sm font-semibold tracking-tight">Risk Level</h3>
                  <SeverityBadge severity={response.riskLevel} />
                </div>
                <p className="text-sm text-muted-foreground">
                  Risk is based on architecture consistency, formula maintainability, and performance signal overlap.
                </p>
              </div>

              <OutputBlock title="Recommended Refactors" items={response.recommendedRefactors} />

              <section className="space-y-3">
                <h3 className="text-sm font-semibold tracking-tight">Performance Recommendations</h3>
                {response.performanceRecommendations.map((recommendation) => (
                  <PerformanceRecommendationCard key={recommendation.id} recommendation={recommendation} />
                ))}
              </section>
            </div>
          ) : null}
        </SectionCard>
      </div>
    </PageContainer>
  );
}
