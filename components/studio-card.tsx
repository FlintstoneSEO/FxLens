import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type StudioCardProps = {
  title: string;
  description: string;
  capabilities: readonly string[];
};

export function StudioCard({
  title,
  description,
  capabilities
}: StudioCardProps) {
  return (
    <article className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-4 space-y-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ul className="mb-5 space-y-2 text-sm">
        {capabilities.map((capability) => (
          <li key={capability} className="list-inside list-disc text-muted-foreground">
            {capability}
          </li>
        ))}
      </ul>
      <Button variant="secondary" className="w-full justify-between">
        Explore
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </article>
  );
}
