import type { AnalyzeRequest, DataSourceType, RecommendationRequest, ScopeRequest } from "@/lib/contracts/workspace";

export const STUDIO_TEMPLATE_STORAGE_KEY = "fxlens.studioTemplates";

export type StudioTemplateArea = "scope" | "build" | "analyze" | "recommendations";

export type BuildTemplatePayload = {
  workspaceTitle: string;
  buildIntent: string;
  artifactType: string;
  technicalNotes: string;
  successMetric: string;
  selectedConstraints: string[];
  selectedOutputs: string[];
};

export type StudioTemplate = {
  id: string;
  name: string;
  description: string;
  area: StudioTemplateArea;
  payload: Partial<ScopeRequest> | Partial<BuildTemplatePayload> | Partial<AnalyzeRequest> | Partial<RecommendationRequest>;
};

const defaultTemplates: StudioTemplate[] = [
  {
    id: "scope-vendor-onboarding",
    name: "Vendor onboarding",
    description: "Procurement intake, approvals, and finance handoff.",
    area: "scope",
    payload: {
      projectName: "Vendor onboarding portal",
      businessObjective: "Reduce cycle time for onboarding new vendors and standardize approvals.",
      targetUsersRoles: "Procurement coordinators, approvers, compliance reviewers, and finance analysts.",
      requirementsText:
        "Track intake, review, approvals, compliance checks, and handoff to finance with clear statuses and notifications.",
      meetingNotes:
        "Current process lives across email, spreadsheets, and Teams. Teams need a single operational workspace.",
      preferredDataSource: "dataverse",
      integrationNeeds: "ERP vendor master sync, Teams notifications, and document storage.",
      desiredOutputs: "Suggested screens, data entities, backend guidance, risks, and an MVP plan."
    }
  },
  {
    id: "build-inspection-workspace",
    name: "Inspection workspace",
    description: "Tablet-first build brief for field inspection teams.",
    area: "build",
    payload: {
      workspaceTitle: "Field inspection command center",
      buildIntent: "accelerate-delivery",
      artifactType: "screen-blueprint",
      technicalNotes:
        "Inspectors need a tablet-first experience to review assigned visits, capture findings, upload photos, and route escalations to supervisors.",
      successMetric: "Inspectors can complete and submit an inspection in under 5 minutes with fewer follow-up corrections.",
      selectedConstraints: ["Responsive tablet-first layout", "Accessibility review required", "Limit to standard connectors"],
      selectedOutputs: ["Step-by-step implementation checklist", "Suggested control hierarchy", "Test scenarios"]
    }
  },
  {
    id: "analyze-escalation-formula",
    name: "Escalation formula review",
    description: "Formula-focused analysis for slow approvals and duplicate logic.",
    area: "analyze",
    payload: {
      mode: "formula_analyzer",
      artifactName: "Escalation submit formula",
      artifactPurpose: "Submit approval requests, assign routing, and notify operations managers.",
      dataSource: "dataverse",
      symptoms: "Users report slow submissions, duplicate notifications, and inconsistent routing when records are edited quickly.",
      inputPayload:
        "SubmitForm(frmEscalation); Patch(Approvals, Defaults(Approvals), { RequestId: frmEscalation.LastSubmit.RequestId, Owner: cmbOwner.Selected }); Notify(\"Request submitted\", NotificationType.Success);",
      relatedFormulas: "OnVisible loads assignments with ClearCollect(colOwners, Owners); OnSuccess triggers another Patch for notifications."
    }
  },
  {
    id: "recommend-ops-modernization",
    name: "Ops modernization",
    description: "Architecture recommendations for intake, triage, and reporting.",
    area: "recommendations",
    payload: {
      scenario: "Modernize an operations intake and triage app used by regional managers to review requests, assign work, and monitor service delivery.",
      dataSourceMix: "mixed" satisfies DataSourceType,
      screenCount: 7,
      architectureNotes:
        "Dataverse stores operational records, SQL supports reporting, and Power Automate handles escalations and approval routing. Teams and Outlook notifications are required.",
      symptoms: "Slow startup, repeated lookup logic across screens, and uncertainty about which processing should stay in-app versus move to backend automation."
    }
  }
];

export function getDefaultStudioTemplates(): StudioTemplate[] {
  return defaultTemplates;
}

export function readStoredStudioTemplates(): StudioTemplate[] {
  if (typeof window === "undefined") {
    return defaultTemplates;
  }

  const savedValue = window.localStorage.getItem(STUDIO_TEMPLATE_STORAGE_KEY);

  if (!savedValue) {
    window.localStorage.setItem(STUDIO_TEMPLATE_STORAGE_KEY, JSON.stringify(defaultTemplates));
    return defaultTemplates;
  }

  try {
    const parsedValue = JSON.parse(savedValue);

    if (!Array.isArray(parsedValue)) {
      return defaultTemplates;
    }

    return parsedValue as StudioTemplate[];
  } catch {
    return defaultTemplates;
  }
}
