import Link from "next/link";

import { StudioCard } from "@/components/studio-card";
import { Button } from "@/components/ui/button";

const studios = [
  {
    title: "Scope Studio",
    href: "/scope",
    description:
      "Turn discovery notes into a practical Power Apps architecture with clear data and automation boundaries.",
    capabilities: [
      "Map requirements to screens, roles, and entities",
      "Recommend SQL views, stored procedures, and flows",
      "Create implementation-ready architecture briefs"
    ]
  },
  {
    title: "Build Studio",
    href: "/build",
    description:
      "Generate reusable app building blocks so teams can move from architecture to implementation quickly.",
    capabilities: [
      "Generate screen blueprints",
      "Create reusable components",
      "Produce starter Power Fx formulas"
    ]
  },
  {
    title: "Analyze Studio",
    href: "/analyze",
    description:
      "Review formulas and screen logic to detect delegation risks and performance bottlenecks before release.",
    capabilities: [
      "Detect repeated LookUps and data loading issues",
      "Flag delegation issues and anti-patterns",
      "Recommend optimized formula alternatives"
    ]
  }
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-12">
      <header className="mb-10 space-y-4">
        <p className="inline-flex rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Phase 1 · Product Foundation
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight">
          FxLens helps Power Apps teams scope, build, and optimize enterprise apps.
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          This first phase establishes a clear product shell for core studios before we
          implement data models, authentication, and generation workflows.
        </p>

        <div className="flex gap-3">
          <Link href="/scope">
            <Button>Start with Scope Studio</Button>
          </Link>

          <Link href="/dashboard">
            <Button variant="ghost">View product roadmap</Button>
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {studios.map((studio) => (
          <StudioCard
            key={studio.title}
            title={studio.title}
            href={studio.href}
            description={studio.description}
            capabilities={studio.capabilities}
          />
        ))}
      </section>
    </main>
  );
}
