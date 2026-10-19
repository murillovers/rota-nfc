import { statusInfo } from "@/lib/crm";

export function StatusBadge({ status }: { status: string }) {
  const s = statusInfo(status);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold">
      <span className="size-2 rounded-full" style={{ backgroundColor: s.cor }} />
      {s.label}
    </span>
  );
}
