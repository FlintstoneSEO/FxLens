type OutputBlockProps = {
  title: string;
  items: readonly string[];
};

export function OutputBlock({ title, items }: OutputBlockProps) {
  return (
    <section className="rounded-xl border border-border/70 bg-background/60 p-4">
      <h3 className="mb-2 text-sm font-semibold tracking-tight">{title}</h3>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="list-inside list-disc">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
