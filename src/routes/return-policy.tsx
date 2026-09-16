import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/return-policy")({
  head: () => ({
    meta: [
      { title: "Return, Cancellation & Refund Policy — Royal Street Mini Mall" },
      { name: "description", content: "Return and exchange window, cancellation rules and refund timelines for Royal Street Mini Mall orders." },
      { property: "og:title", content: "Return & Refund Policy — Royal Street Mini Mall" },
      { property: "og:description", content: "Return window, cancellations and refund timelines." },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Return & Refund Policy"
      subtitle="Returns, exchanges, cancellations and refunds"
      policyKeys={[
        { key: "returns", heading: "Returns & Exchanges" },
        { key: "cancellation", heading: "Cancellations" },
        { key: "refunds", heading: "Refunds" },
      ]}
    />
  ),
});
