"use client";

import { useMemo, useSyncExternalStore } from "react";
import { notifyNyayStorageChanged, subscribeNyayStorage } from "./nyay-storage-events";

export const NYAY_DOCUMENTS_KEY = "nyay-documents-v1";

export type DocumentTag = "FIR" | "Agreement" | "Evidence";

export type DocumentVersion = {
  id: string;
  label: string;
  summary: string;
  editor: string;
  createdAt: string;
};

export type DocumentComment = {
  id: string;
  line: number;
  text: string;
  author: string;
  createdAt: string;
};

export type DocumentHighlight = {
  id: string;
  fromLine: number;
  toLine: number;
  note: string;
  color: "amber" | "blue" | "green";
  createdAt: string;
};

export type DocumentOperation = {
  id: string;
  kind: "upload" | "link" | "edit" | "comment" | "highlight" | "move";
  detail: string;
  createdAt: string;
};

export type ManagedDocument = {
  id: string;
  title: string;
  fileName: string;
  mimeType: string;
  sizeKb: number;
  link: string;
  caseId: string;
  clientId: string;
  tags: DocumentTag[];
  folderPath: string[];
  content: string;
  uploadedAt: string;
  updatedAt: string;
  versions: DocumentVersion[];
  comments: DocumentComment[];
  highlights: DocumentHighlight[];
  operations: DocumentOperation[];
};

function makeId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function isTag(v: unknown): v is DocumentTag {
  return v === "FIR" || v === "Agreement" || v === "Evidence";
}

function sanitize(raw: unknown): ManagedDocument[] {
  if (!Array.isArray(raw)) return [];
  const out: ManagedDocument[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    if (
      typeof r.id !== "string" ||
      typeof r.title !== "string" ||
      typeof r.fileName !== "string" ||
      typeof r.caseId !== "string" ||
      typeof r.clientId !== "string" ||
      typeof r.link !== "string"
    ) {
      continue;
    }
    const tags = Array.isArray(r.tags) ? r.tags.filter(isTag) : [];
    out.push({
      id: r.id,
      title: r.title,
      fileName: r.fileName,
      mimeType: typeof r.mimeType === "string" ? r.mimeType : "application/octet-stream",
      sizeKb: typeof r.sizeKb === "number" ? r.sizeKb : 0,
      link: r.link,
      caseId: r.caseId,
      clientId: r.clientId,
      tags,
      folderPath: Array.isArray(r.folderPath)
        ? r.folderPath.filter((x): x is string => typeof x === "string")
        : [],
      content: typeof r.content === "string" ? r.content : "",
      uploadedAt: typeof r.uploadedAt === "string" ? r.uploadedAt : new Date().toISOString(),
      updatedAt: typeof r.updatedAt === "string" ? r.updatedAt : new Date().toISOString(),
      versions: Array.isArray(r.versions)
        ? (r.versions.filter((x) => x && typeof x === "object") as DocumentVersion[])
        : [],
      comments: Array.isArray(r.comments)
        ? (r.comments.filter((x) => x && typeof x === "object") as DocumentComment[])
        : [],
      highlights: Array.isArray(r.highlights)
        ? (r.highlights.filter((x) => x && typeof x === "object") as DocumentHighlight[])
        : [],
      operations: Array.isArray(r.operations)
        ? (r.operations.filter((x) => x && typeof x === "object") as DocumentOperation[])
        : [],
    });
  }
  return out;
}

export function loadDocuments(): ManagedDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(NYAY_DOCUMENTS_KEY);
    return sanitize(raw ? (JSON.parse(raw) as unknown) : []);
  } catch {
    return [];
  }
}

function saveDocuments(docs: ManagedDocument[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NYAY_DOCUMENTS_KEY, JSON.stringify(docs));
  notifyNyayStorageChanged();
}

export function createDocument(input: {
  title: string;
  fileName: string;
  mimeType: string;
  sizeKb: number;
  caseId: string;
  clientId: string;
  link: string;
  tags: DocumentTag[];
  folderPath: string[];
}): ManagedDocument {
  const now = new Date().toISOString();
  const doc: ManagedDocument = {
    id: makeId("doc"),
    title: input.title.trim(),
    fileName: input.fileName.trim(),
    mimeType: input.mimeType,
    sizeKb: input.sizeKb,
    caseId: input.caseId.trim(),
    clientId: input.clientId.trim(),
    link: input.link.trim(),
    tags: input.tags,
    folderPath: input.folderPath.filter(Boolean),
    content: "",
    uploadedAt: now,
    updatedAt: now,
    versions: [
      {
        id: makeId("ver"),
        label: "v1",
        summary: "Document uploaded",
        editor: "Advocate",
        createdAt: now,
      },
    ],
    comments: [],
    highlights: [],
    operations: [
      { id: makeId("op"), kind: "upload", detail: "Uploaded document", createdAt: now },
      { id: makeId("op"), kind: "link", detail: "Linked to case and client", createdAt: now },
    ],
  };
  const all = loadDocuments();
  saveDocuments([doc, ...all]);
  return doc;
}

export function updateManagedDocument(doc: ManagedDocument): void {
  const all = loadDocuments();
  const next = all.map((d) => (d.id === doc.id ? doc : d));
  saveDocuments(next);
}

export function deleteManagedDocument(docId: string): void {
  const all = loadDocuments();
  const next = all.filter((d) => d.id !== docId);
  saveDocuments(next);
}

export function useManagedDocuments() {
  const snapshot = useSyncExternalStore(
    subscribeNyayStorage,
    () => (typeof window === "undefined" ? "[]" : window.localStorage.getItem(NYAY_DOCUMENTS_KEY) ?? "[]"),
    () => "[]",
  );
  const documents = useMemo(() => {
    try {
      return sanitize(JSON.parse(snapshot) as unknown);
    } catch {
      return [];
    }
  }, [snapshot]);
  return { documents };
}
