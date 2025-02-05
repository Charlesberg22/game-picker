import { format } from "date-fns";
import { enAU } from "date-fns/locale";
import { NextApiRequest } from "next";

export function formatDate(dateStr: string): string | undefined {
  if (dateStr === "") {
    return;
  }

  const date = new Date(dateStr);
  return format(date, "do MMM yyyy", { locale: enAU });
}

export const getBaseUrl = (req?: NextApiRequest) => {
  if (typeof window !== "undefined") {
    // Client-side
    return `${window.location.protocol}//${window.location.host}`;
  }

  // Server-side
  if (req) {
    return `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}`;
  }

  // Fallback for server-side without `req` (e.g., for build time only, as otherwise will error APPARENTLY)
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
};

const keywords = [
  "retro",
  "modern",
  "handheld",
  "desktop",
  "tried",
  "tbc",
  "avoided",
  "finished",
  "abandoned",
  "timeline",
  "playable",
  "prequel",
];

export function removeKeywords(word: string) {
  return !keywords.includes(word);
}

export function removePunctuation(name: string): string {
  return name.replace(/[^\w\s\-]|_/g, "").replace(/\s/g, "-");
}
