export type Category = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
};

export const categories: Category[] = [
  {
    slug: "saas-in-the-real-world",
    name: "SaaS in the Real World",
    tagline: "Subscriptions that earn their seat",
    description:
      "SaaS products judged by the work they actually change — not their pricing page or feature list.",
  },
  {
    slug: "developer-tools",
    name: "Developer Tools",
    tagline: "The tools under the tools",
    description:
      "IDEs, CLIs, CI, and infrastructure — how they save real time for the people who ship.",
  },
  {
    slug: "ai-at-work",
    name: "AI at Work",
    tagline: "Beyond the demo",
    description:
      "AI products measured by operational value: what they do once the novelty wears off.",
  },
  {
    slug: "startup-reality",
    name: "Startup Reality",
    tagline: "Problems, not pitch decks",
    description:
      "Startups solving real problems for real users — instead of building more software for software people.",
  },
  {
    slug: "workflow-impact",
    name: "Workflow Impact",
    tagline: "How the work gets done",
    description:
      "The quiet ways software reshapes teams, processes, and the daily shape of a job.",
  },
  {
    slug: "internet-culture",
    name: "Internet Culture",
    tagline: "The web, off the clock",
    description:
      "How internet products change the way we talk, learn, buy, and spend our attention.",
  },
];

const bySlug = new Map(categories.map((c) => [c.slug, c]));
const byName = new Map(categories.map((c) => [c.name, c]));

export function getCategoryBySlug(slug: string): Category | undefined {
  return bySlug.get(slug);
}

export function getCategoryByName(name: string): Category | undefined {
  return byName.get(name);
}
