import type { VercelRequest, VercelResponse } from "@vercel/node";

// Safely coerce any Airtable field value to a plain string.
// Airtable can return arrays (multi-select), objects (linked records),
// or numbers — all of which would crash React if rendered directly.
function str(v: any): string {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return v.map((x) => str(x)).join(", ");
  if (typeof v === "object") {
    // Airtable formula/rollup error — treat as empty
    if (v.state === "error" || v.errorType !== undefined) return "";
    return v.name ?? (typeof v.value === "string" ? v.value : "") ?? "";
  }
  return String(v);
}

function getAttachment(field: any): { url: string; filename: string } | null {
  if (Array.isArray(field) && field.length > 0) {
    return { url: field[0].url ?? "", filename: field[0].filename ?? "" };
  }
  return null;
}

function mapRecord(id: string, f: Record<string, any>) {
  const photos = (Array.isArray(f["Photos"]) ? f["Photos"] : [])
    .slice()
    .sort((a: any, b: any) =>
      (a.filename ?? "").localeCompare(b.filename ?? "", undefined, { numeric: true, sensitivity: "base" })
    );
  const images: string[] = photos
    .map((p: any) => p.url ?? p.thumbnails?.large?.url ?? "")
    .filter(Boolean);

  const specSheet =
    getAttachment(f["Spec Sheet / Flier PDF"]) ??
    getAttachment(f["Spec Sheet"]) ??
    getAttachment(f["Flier PDF"]) ??
    getAttachment(f["PDF"]);

  return {
    id,
    // Core identity
    equipmentId:       str(f["Equipment ID"] ?? f["Equip ID"]),
    name:              str(f["Name"] ?? f["Item Name"] ?? f["Equipment Name"] ?? f["Title"]) || "Unnamed Item",
    publicDescription: str(f["Public Description"] ?? f["Description (Public)"] ?? f["Public Notes"]),

    // Classification
    category:          str(f["Category"] ?? f["Equipment Type"]),
    subcategory:       str(f["Subcategory"] ?? f["Sub-Category"] ?? f["Sub Category"]),

    // Status / condition
    status:            (() => { const s = str(f["Status"] ?? f["Availability"]); return s.startsWith("Closed") ? "Sold" : s; })(),
    condition:         str(f["Condition"]),
    systemStatus:      str(f["System Status"] ?? f["System Configuration"]),
    removalStatus:     str(f["Removal Status"] ?? f["Removal"]),
    storageConditions: str(f["Storage Conditions"] ?? f["Storage"]),

    // Technical specs
    manufacturer:    str(f["Manufacturer"] ?? f["Make"] ?? f["Brand"]),
    modelSeries:     str(f["Model / Series"] ?? f["Model"] ?? f["Model Number"]),
    voltageCapacity: str(f["Voltage / Capacity"] ?? f["Voltage"] ?? f["Voltage Rating"]),
    yearManufactured: str(f["Year Manufactured"] ?? f["Year"]),
    serialNumbers:   str(f["Serial Number(s)"] ?? f["Serial Numbers"] ?? f["Serial Number"] ?? f["Serial #"]),
    runtimeHours:    str(f["Runtime / Hours"] ?? f["Runtime Hours"] ?? f["Run Hours"] ?? f["Hours"]),
    quantity:        str(f["Quantity"] ?? f["Qty"]),
    location:        str(f["Location"] ?? f["Site"]),
    askingPrice:     str(f["Asking Price"] ?? f["Price"] ?? f["List Price"]),

    // Technical detail fields
    nameplateData:     str(f["Nameplate Data"] ?? f["Nameplate"]),
    technicalNotes:    str(f["Technical Notes"] ?? f["Tech Notes"]),
    pairingNotes:      str(f["Pairing / Notes"] ?? f["Pairing Notes"] ?? f["Pairing"]),
    attachmentSummary: str(f["Attachment Summary"] ?? f["Attachments Summary"]),

    // Media
    image:  images[0] ?? "",
    images,
    specSheetUrl:  specSheet?.url ?? "",
    specSheetName: specSheet?.filename ?? "Spec Sheet",

    // Lot media
    morePhotosUrl:  str(f["More Photos"] ?? ""),
    sourceLot:      str(f["Source Lot"] ?? ""),

    // Legacy compat fields
    kw:             str(f["KW"] ?? f["Kilowatts"] ?? f["Rating (KW)"] ?? f["MW"]),
    mva:            str(f["MVA"] ?? f["Rating (MVA)"]),
    phase:          str(f["Phase"]),
    frequency:      str(f["Frequency"] ?? f["Hz"]),
    coolingType:    str(f["Cooling Type"] ?? f["Cooling"]),
    weight:         str(f["Weight"] ?? f["Weight (lbs)"]),
    dimensions:     str(f["Dimensions"] ?? f["Size"]),
    certifications: str(f["Certifications"] ?? f["Standards"]),
  };
}

async function fetchAllRecords(
  baseId: string,
  table: string,
  pat: string,
  view?: string
) {
  const all: ReturnType<typeof mapRecord>[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`
    );
    url.searchParams.set("pageSize", "100");
    if (view) url.searchParams.set("view", view);
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${pat}` },
    });

    if (!res.ok) {
      const text = await res.text();
      return { records: null, status: res.status, detail: text };
    }

    const data = await res.json();
    for (const record of data.records) {
      all.push(mapRecord(record.id, record.fields));
    }
    offset = data.offset;
  } while (offset);

  return { records: all, status: 200, detail: "" };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const PAT     = process.env.AIRTABLE_PAT;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  const TABLE   = process.env.AIRTABLE_TABLE || "INVENTORY MASTER";
  const VIEW    = "Available – Public Gallery";

  // Never cache — always serve fresh Airtable data
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");

  if (!PAT || !BASE_ID) {
    return res.status(200).json({ items: null, reason: "no-credentials" });
  }

  try {
    let result = await fetchAllRecords(BASE_ID, TABLE, PAT, VIEW);

    // Fall back to full table if view name doesn't match
    if (!result.records && (result.status === 422 || result.status === 404)) {
      console.warn(`View "${VIEW}" not found (${result.status}), falling back to full table.`);
      result = await fetchAllRecords(BASE_ID, TABLE, PAT);
    }

    if (!result.records) {
      console.error("Airtable error:", result.status, result.detail);
      return res.status(502).json({
        error: "Airtable fetch failed",
        status: result.status,
        detail: result.detail,
      });
    }

    return res.status(200).json({ items: result.records });
  } catch (e: any) {
    console.error("Inventory API error:", e);
    return res.status(500).json({ error: e.message ?? "Unknown error" });
  }
}
