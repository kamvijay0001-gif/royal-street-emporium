import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Royal Street Mini Mall" },
      { name: "description", content: "What information Royal Street Mini Mall collects, why it is collected and how your data is protected." },
      { property: "og:title", content: "Privacy Policy — Royal Street Mini Mall" },
      { property: "og:description", content: "How we collect, use and protect your data." },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Privacy Policy"
      subtitle="Your data, handled with care"
      policyKeys={[{ key: "privacy", heading: "Information We Collect" }]}
    />
  ),
});
