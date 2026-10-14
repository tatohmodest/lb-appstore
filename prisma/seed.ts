import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL }) });

const categories = [
  { slug: "finance", name: "Finance", icon: "wallet", colorFrom: "#10b981", colorTo: "#047857" },
  { slug: "productivity", name: "Productivity", icon: "briefcase", colorFrom: "#6366f1", colorTo: "#4338ca" },
  { slug: "social", name: "Social", icon: "chat", colorFrom: "#ec4899", colorTo: "#be185d" },
  { slug: "shopping", name: "Shopping", icon: "shopping", colorFrom: "#f59e0b", colorTo: "#c2410c" },
  { slug: "education", name: "Education", icon: "education", colorFrom: "#0ea5e9", colorTo: "#1d4ed8" },
  { slug: "health", name: "Health & Fitness", icon: "health", colorFrom: "#f43f5e", colorTo: "#9f1239" },
  { slug: "tools", name: "Utilities", icon: "tools", colorFrom: "#64748b", colorTo: "#1e293b" },
  { slug: "games", name: "Games", icon: "games", colorFrom: "#a855f7", colorTo: "#6d28d9" },
];

// DEMO listings so the store isn't empty. Replace them (or delete them) in /studio.
const apps = [
  {
    slug: "lb-pay", name: "LB Pay", category: "finance", accentColor: "#10b981",
    subtitle: "Send, receive and track money", headline: "Money that moves at the speed of a text",
    description: "DEMO LISTING. Replace with the real LB Pay details in Studio.\n\nPay friends, split bills and track every transaction from one beautiful wallet.",
    whatsNew: "• Instant transfers\n• Spending insights", permissions: ["Camera", "Notifications"], tags: ["payments", "wallet", "money"],
    featured: true, editorsChoice: true,
  },
  {
    slug: "lb-notes", name: "LB Notes", category: "productivity", accentColor: "#f59e0b",
    subtitle: "Thoughts, synced everywhere", headline: "Your second brain, minus the clutter",
    description: "DEMO LISTING. Fast, offline-first notes with tags, checklists and instant search.",
    whatsNew: "• Markdown shortcuts", permissions: [], tags: ["notes", "writing"], featured: true,
  },
  {
    slug: "lb-chat", name: "LB Chat", category: "social", accentColor: "#ec4899",
    subtitle: "Private messaging for teams", headline: "Conversations that stay yours",
    description: "DEMO LISTING. Lightweight, private messaging for teams and friends.",
    whatsNew: "", permissions: ["Notifications", "Camera", "Microphone"], tags: ["chat", "messaging"], editorsChoice: true,
  },
  {
    slug: "lb-shop", name: "LB Shop", category: "shopping", accentColor: "#f97316",
    subtitle: "Your storefront in your pocket", headline: null,
    description: "DEMO LISTING. Run your store, track orders and chat with customers.",
    whatsNew: "", permissions: ["Notifications"], tags: ["commerce", "store"],
  },
  {
    slug: "lb-learn", name: "LB Learn", category: "education", accentColor: "#0ea5e9",
    subtitle: "Bite-sized lessons, daily", headline: "Ten minutes a day. A new skill a month.",
    description: "DEMO LISTING. Micro-courses that fit in your commute.",
    whatsNew: "", permissions: ["Notifications"], tags: ["learning", "courses"], featured: true,
  },
  {
    slug: "lb-fit", name: "LB Fit", category: "health", accentColor: "#f43f5e",
    subtitle: "Workouts that adapt to you", headline: null,
    description: "DEMO LISTING. Adaptive workouts and habit tracking.",
    whatsNew: "", permissions: ["Notifications", "Location"], tags: ["fitness", "workout"], editorsChoice: true,
  },
  {
    slug: "lb-scan", name: "LB Scan", category: "tools", accentColor: "#64748b",
    subtitle: "Scan docs & QR codes", headline: null,
    description: "DEMO LISTING. Scan documents to PDF and read any QR code.",
    whatsNew: "", permissions: ["Camera"], tags: ["scanner", "qr", "pdf"],
  },
];

async function main() {
  for (const [i, c] of categories.entries()) {
    await db.category.upsert({ where: { slug: c.slug }, create: { ...c, order: i }, update: {} });
  }
  const bySlug = Object.fromEntries((await db.category.findMany()).map((c) => [c.slug, c.id]));

  for (const { category, ...a } of apps) {
    await db.app.upsert({
      where: { slug: a.slug },
      create: { ...a, url: `https://example.com/?demo=${a.slug}`, offline: true, categoryId: bySlug[category] },
      update: {},
    });
  }
  console.log(`Seeded ${categories.length} categories and ${apps.length} demo apps`);
}

main().finally(() => db.$disconnect());
