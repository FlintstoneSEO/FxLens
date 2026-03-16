import { CopyButton } from "@/components/ui/copy-button";

type CodePanelProps = {
  title: string;
  code: string;
  language?: string;
};

export function CodePanel({ title, code, language = "Power Fx" }: CodePanelProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-border/70 bg-card/80 shadow-sm">
      <header className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <div>
          <p className="text-sm font-medium tracking-tight">{title}</p>
          <p className="text-xs text-muted-foreground">{language}</p>
        </div>
        <CopyButton value={code} />
      </header>
      <pre className="overflow-x-auto bg-slate-950/95 p-4 text-xs leading-6 text-slate-50">
        <code>{code}</code>
      </pre>
    </section>
  );
}
