import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/thank-you")({
  head: () => ({
    meta: [
      { title: "Thank You | Slimofast" },
      { name: "description", content: "Thank you for placing your Slimofast order." },
      { property: "og:title", content: "Thank You | Slimofast" },
      { property: "og:description", content: "Thank you for placing your Slimofast order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ThankYou,
});

function ThankYou() {
  return <main className="thank-you-page"><h1>Thank You</h1></main>;
}