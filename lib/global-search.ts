import type { Client } from "./clients";
import { clientDisplayName } from "./clients";
import {
  getCaseDetailForId,
  matters,
  type CaseDocument,
} from "./cases";
import { effectiveClientId } from "./matter-client-overrides";
import type { MatterClientOverrides } from "./matter-client-overrides";
import { routes } from "./routes";

export type GlobalSearchKind = "case" | "client" | "document";

export type GlobalSearchHit = {
  kind: GlobalSearchKind;
  title: string;
  subtitle: string;
  href: string;
};

const MAX_PER_KIND = 8;

const DOC_KIND_WORDS: Record<CaseDocument["kind"], string> = {
  pleading: "pleading",
  order: "order",
  evidence: "evidence",
  correspondence: "correspondence",
};

function clientSearchBlob(c: Client): string {
  return [
    c.id,
    c.name,
    c.email,
    c.phone,
    c.whatsappPhone ?? "",
    c.organization ?? "",
    c.notes ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

function documentBlob(
  doc: CaseDocument,
  matterId: string,
  matterTitle: string,
  clientName: string,
): string {
  return [
    doc.id,
    doc.name,
    DOC_KIND_WORDS[doc.kind],
    matterId,
    matterTitle,
    clientName,
  ]
    .join(" ")
    .toLowerCase();
}

export function runGlobalSearch(
  rawQuery: string,
  allClients: Client[],
  overrides: MatterClientOverrides,
): GlobalSearchHit[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];

  const caseHits: GlobalSearchHit[] = [];
  for (const m of matters) {
    const cid = effectiveClientId(m, overrides);
    const clientName = clientDisplayName(cid, allClients);
    const blob = `${m.id} ${m.title} ${clientName} ${m.stage} ${m.court}`
      .toLowerCase();
    if (!blob.includes(q)) continue;
    caseHits.push({
      kind: "case",
      title: m.title,
      subtitle: `${m.id} · ${clientName}`,
      href: routes.case(m.id),
    });
    if (caseHits.length >= MAX_PER_KIND) break;
  }

  const clientHits: GlobalSearchHit[] = [];
  for (const c of allClients) {
    if (!clientSearchBlob(c).includes(q)) continue;
    const org = c.organization ? ` · ${c.organization}` : "";
    clientHits.push({
      kind: "client",
      title: c.name,
      subtitle: `${c.email}${org}`,
      href: routes.client(c.id),
    });
    if (clientHits.length >= MAX_PER_KIND) break;
  }

  const documentHits: GlobalSearchHit[] = [];
  for (const m of matters) {
    const row = getCaseDetailForId(m.id);
    if (!row) continue;
    const cid = effectiveClientId(m, overrides);
    const clientName = clientDisplayName(cid, allClients);
    for (const doc of row.extra.documents) {
      if (!documentBlob(doc, m.id, m.title, clientName).includes(q)) continue;
      documentHits.push({
        kind: "document",
        title: doc.name,
        subtitle: `${m.id} · ${DOC_KIND_WORDS[doc.kind]}`,
        href: routes.caseDocument(m.id, doc.id),
      });
      if (documentHits.length >= MAX_PER_KIND) break;
    }
    if (documentHits.length >= MAX_PER_KIND) break;
  }

  return [...caseHits, ...clientHits, ...documentHits];
}
