import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/audit")({
  component: AdminAudit,
});

function AdminAudit() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Audit Log</h1>
      {isLoading && <Skeleton className="h-64 w-full" />}
      <div className="space-y-2">
        {(data ?? []).length === 0 && !isLoading && <p className="text-sm text-muted-foreground">No admin activity recorded yet.</p>}
        {(data ?? []).map((l) => (
          <div key={l.id} className="border border-border bg-background p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{l.action.replace(/_/g, " ")}</p>
              <p className="text-xs text-muted-foreground">{formatDate(l.created_at)}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {l.entity} {l.entity_id ? `· ${l.entity_id}` : ""}
            </p>
            {(l.old_value || l.new_value) && (
              <pre className="mt-2 overflow-x-auto bg-secondary/60 p-2 text-[0.65rem]">
                {JSON.stringify({ before: l.old_value, after: l.new_value }, null, 1)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
