import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Royal Street Mini Mall" },
      { name: "description", content: "Terms of use for shopping with Royal Street Mini Mall, Sukhrali, Gurugram." },
      { property: "og:title", content: "Terms & Conditions — Royal Street Mini Mall" },
      { property: "og:description", content: "Terms of use for shopping with us." },
    ],
  }),
  component: () => (
    <PolicyPage title="Terms & Conditions" subtitle="The basics of shopping with us" policyKeys={[{ key: "terms", heading: "Terms of Use" }]} />
  ),
});
