import {
  notifyNyayStorageChanged,
  NYAY_CLIENTS_EXTRA_KEY,
} from "./nyay-storage-events";

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  /** If set, used for WhatsApp; otherwise `phone` is used for wa.me. */
  whatsappPhone?: string;
  organization?: string;
  notes?: string;
};

export const CLIENTS_SEED: Client[] = [
  {
    id: "cl-nw",
    name: "Northwind Traders",
    email: "legal@northwind.example",
    phone: "+91 98100 10001",
    organization: "Northwind Traders Pvt Ltd",
  },
  {
    id: "cl-khan",
    name: "A. Khan",
    email: "contact@example.invalid",
    phone: "+91 98765 43210",
  },
  {
    id: "cl-bw",
    name: "BuildWell LLP",
    email: "secretarial@buildwell.example",
    phone: "+91 11 4000 2200",
    organization: "BuildWell LLP",
  },
  {
    id: "cl-reddy",
    name: "S. Reddy",
    email: "s.reddy@example.invalid",
    phone: "+91 99887 76655",
  },
  {
    id: "cl-metro",
    name: "Metro Retail Pvt Ltd",
    email: "compliance@metroretail.example",
    phone: "+91 11 4500 9000",
    organization: "Metro Retail Pvt Ltd",
  },
  {
    id: "cl-kapoor",
    name: "J. & M. Kapoor",
    email: "kapoor.jm@example.invalid",
    phone: "+91 98111 22333",
  },
  {
    id: "cl-pf",
    name: "PixelForge Inc.",
    email: "hr@pixelforge.example",
    phone: "+91 124 400 5500",
    organization: "PixelForge Inc.",
  },
];

const STORAGE_KEY = NYAY_CLIENTS_EXTRA_KEY;

export function parseStoredExtraClients(raw: string): Client[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isClientShape);
  } catch {
    return [];
  }
}

export function loadExtraClients(): Client[] {
  if (typeof window === "undefined") return [];
  return parseStoredExtraClients(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
}

export function saveExtraClients(clients: Client[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  notifyNyayStorageChanged();
}

/** Add or replace a client in browser storage (covers edits to seed clients by id). */
export function upsertExtraClient(client: Client): void {
  const extra = loadExtraClients();
  const i = extra.findIndex((c) => c.id === client.id);
  if (i >= 0) extra[i] = client;
  else extra.push(client);
  saveExtraClients(extra);
}

function isClientShape(x: unknown): x is Client {
  if (x === null || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  const base =
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.email === "string" &&
    typeof o.phone === "string";
  if (!base) return false;
  if (o.whatsappPhone !== undefined && typeof o.whatsappPhone !== "string")
    return false;
  return true;
}

export function mergeClients(extra: Client[]): Client[] {
  const byId = new Map<string, Client>();
  for (const c of CLIENTS_SEED) byId.set(c.id, c);
  for (const c of extra) byId.set(c.id, c);
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getClientById(id: string, all: Client[]): Client | undefined {
  return all.find((c) => c.id === id);
}

export function clientDisplayName(id: string, all: Client[]): string {
  return getClientById(id, all)?.name ?? id;
}
