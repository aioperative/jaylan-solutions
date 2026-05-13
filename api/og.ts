import type { VercelRequest, VercelResponse } from "@vercel/node";

const SITE_URL = "https://jaylan-solutions.vercel.app";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function str(v: any): string {
  if (!v) return "";
  if (Array.isArray(v)) return v.map(str).join(", ");
  if (typeof v === "object") return v.name ?? String(v.value ?? "") ?? "";
  return String(v);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = typeof req.query.id === "string" ? req.query.id.trim() : "";
  const PAT    = process.env.AIRTABLE_PAT;
  const BASE   = process.env.AIRTABLE_BASE_ID;
  const TABLE  = process.env.AIRTABLE_TABLE || "INVENTORY MASTER";

  const fallback = `${SITE_URL}/${id ? `?item=${encodeURIComponent(id)}` : ""}`;

  if (!id || !PAT || !BASE) {
    res.setHeader("Location", fallback);
    return res.status(302).end();
  }

  try {
    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(TABLE)}/${id}`,
      { headers: { Authorization: `Bearer ${PAT}` } }
    );

    if (!airtableRes.ok) {
      res.setHeader("Location", fallback);
      return res.status(302).end();
    }

    const data = await airtableRes.json();
    const f = data.fields ?? {};

    const name = str(f["Name"] ?? f["Item Name"] ?? f["Equipment Name"] ?? f["Title"]) || "Equipment Listing";
    const description =
      str(f["Public Description"] ?? f["Description (Public)"] ?? f["Public Notes"]) ||
      "Industrial power equipment available from Jaylan Solutions.";
    const photos = Array.isArray(f["Photos"]) ? f["Photos"] : [];
    const image: string = photos[0]?.url ?? photos[0]?.thumbnails?.large?.url ?? "";

    const spaUrl  = `${SITE_URL}/?item=${encodeURIComponent(id)}`;
    const selfUrl = `${SITE_URL}/api/og?id=${encodeURIComponent(id)}`;
    const title   = `${name} — Jaylan Solutions`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />

  <meta property="og:type"        content="website" />
  <meta property="og:site_name"   content="Jaylan Solutions" />
  <meta property="og:title"       content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url"         content="${escapeHtml(selfUrl)}" />
  ${image ? `<meta property="og:image"       content="${escapeHtml(image)}" />
  <meta property="og:image:width" content="1200" />` : ""}

  <meta name="twitter:card"        content="${image ? "summary_large_image" : "summary"}" />
  <meta name="twitter:title"       content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : ""}

  <script>window.location.replace(${JSON.stringify(spaUrl)});</script>
</head>
<body style="font-family:system-ui,sans-serif;padding:2rem;text-align:center;color:#52525b;">
  <p>Redirecting to <a href="${escapeHtml(spaUrl)}" style="color:#d97706;font-weight:700;">${escapeHtml(name)} — Jaylan Solutions</a>…</p>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
    return res.status(200).send(html);
  } catch {
    res.setHeader("Location", fallback);
    return res.status(302).end();
  }
}
