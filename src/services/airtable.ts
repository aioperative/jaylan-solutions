export interface InventoryItem {
  id: string;
  equipmentId: string;
  name: string;
  publicDescription: string;
  category: string;
  subcategory: string;
  status: string;
  condition: string;
  systemStatus: string;
  removalStatus: string;
  storageConditions: string;
  manufacturer: string;
  modelSeries: string;
  voltageCapacity: string;
  yearManufactured: string;
  serialNumbers: string;
  runtimeHours: string;
  quantity: string;
  location: string;
  askingPrice: string;
  nameplateData: string;
  technicalNotes: string;
  pairingNotes: string;
  attachmentSummary: string;
  image: string;
  images: string[];
  specSheetUrl: string;
  specSheetName: string;
  // legacy compat
  kw: string;
  mva: string;
  phase: string;
  frequency: string;
  coolingType: string;
  weight: string;
  dimensions: string;
  certifications: string;
}

export async function getAirtableInventory(): Promise<InventoryItem[] | null> {
  try {
    const res = await fetch("/api/inventory", {
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.reason === "no-credentials") return null;
    return data.items ?? null;
  } catch (e) {
    console.error("Failed to fetch inventory:", e);
    return null;
  }
}
