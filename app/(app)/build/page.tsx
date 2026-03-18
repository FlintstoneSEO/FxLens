import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { BuildOutput, BuildRequestSummary } from "@/components/workspace/build-output";
import type { BuildRequest } from "@/lib/contracts/workspace";
import { createBuildMockResponse } from "@/lib/mocks/api";

const sampleBuildRequest: BuildRequest = {
  mode: "screen_builder",
  promptTitle: "Field Service work order experience",
  contextSummary:
    "Translate the approved Scope package into an implementation-ready Build output for dispatchers and field technicians.",
  inputPayload: {
    app_area: "Work order intake, scheduling, and completion",
    primary_users: "Dispatch coordinators, field technicians",
    integrations: "Dataverse, Outlook, Teams notifications",
    design_goal: "Clear status visibility with reusable status and task patterns"
  }
};

const sampleBuildResponse = createBuildMockResponse(sampleBuildRequest);

export default function BuildPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Build Studio"
        description="Generate implementation-ready screen blueprints, reusable components, and starter Power Fx output."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
        <SectionCard
          title="Blueprint Request"
          description="Input context stays separate from generated output so builders can compare what was requested with what Build Studio produced."
        >
          <BuildRequestSummary request={sampleBuildRequest} />
        </SectionCard>

        <SectionCard
          title="Generated Build Output"
          description="Structured sections make it easier to review screens, reusable components, formulas, and implementation notes."
        >
          <BuildOutput request={sampleBuildRequest} response={sampleBuildResponse} />
        </SectionCard>
      </div>
    </PageContainer>
  );
}
