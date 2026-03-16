import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";

export default function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Track active studio work, review workload health, and monitor where your team should focus next."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Projects" value="12" helperText="+2 this week" trend="up" />
        <StatCard label="Formula Warnings" value="37" helperText="-8 resolved" trend="up" />
        <StatCard label="Pending Reviews" value="5" helperText="2 high priority" trend="neutral" />
        <StatCard label="Avg. Screen Load" value="1.9s" helperText="Within target" trend="up" />
      </section>

      <section className="mt-6">
        <SectionCard
          title="Recent Workspace Activity"
          description="Your latest generated assets and analysis runs will appear here as the data layer is added in upcoming phases."
        >
          <EmptyState
            title="No activity yet"
            description="Start by opening Scope Studio to generate your first architecture draft for a Power Apps solution."
            actionLabel="Open Scope Studio"
          />
        </SectionCard>
      </section>
    </PageContainer>
  );
}
