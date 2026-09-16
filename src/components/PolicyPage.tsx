import { StoreLayout, PageHeader } from "@/components/layout/StoreLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/hooks/useStore";

export function PolicyPage({
  title,
  subtitle,
  policyKeys,
}: {
  title: string;
  subtitle?: string | undefined;
  policyKeys: { key: string; heading: string }[];
}) {
  const { data: settings, isLoading } = useSettings();
  const policies = (settings?.["policies"] ?? {}) as Record<string, string>;

  return (
    <StoreLayout>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-14">
        {isLoading && <Skeleton className="h-40 w-full" />}
        {!isLoading &&
          policyKeys.map(({ key, heading }) => (
            <section key={key} className="animate-fade-up">
              <h2 className="font-display text-2xl">{heading}</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {policies[key] ?? "This policy will be published shortly."}
              </p>
            </section>
          ))}
        <p className="border-t border-border pt-6 text-xs text-muted-foreground">
          These policies are maintained by the store and may be updated from time to time.
        </p>
      </div>
    </StoreLayout>
  );
}
