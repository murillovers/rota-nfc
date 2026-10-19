export const pageHead = (title: string, description: string) => () => ({
  meta: [
    { title: `${title} — Prospecta NFC` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} — Prospecta NFC` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ],
});
