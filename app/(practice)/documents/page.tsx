"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AppModal } from "@/components/ui/app-modal";
import { SearchFilterToolbar } from "@/components/practice/search-filter-toolbar";
import { FilterOptionsMenu } from "@/components/practice/filter-options-menu";
import { mergeClients, clientDisplayName } from "@/lib/clients";
import { matters } from "@/lib/cases";
import { useNyayStorage } from "@/lib/use-nyay-storage";
import {
  createDocument,
  deleteManagedDocument,
  updateManagedDocument,
  useManagedDocuments,
  type DocumentTag,
  type ManagedDocument,
} from "@/lib/document-management";

const TAGS: DocumentTag[] = ["FIR", "Agreement", "Evidence"];

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function DocumentsPage() {
  const { extraClients } = useNyayStorage();
  const { documents } = useManagedDocuments();
  const allClients = useMemo(() => mergeClients(extraClients), [extraClients]);

  const [title, setTitle] = useState("");
  const [caseId, setCaseId] = useState(matters[0]?.id ?? "");
  const [clientId, setClientId] = useState(matters[0]?.clientId ?? "");
  const [folderPath, setFolderPath] = useState("Case Files/Primary");
  const [source, setSource] = useState<"local" | "drive" | "onedrive">("local");
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [docLink, setDocLink] = useState("");
  const [tags, setTags] = useState<DocumentTag[]>(["FIR"]);
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<DocumentTag | "all">("all");
  const [caseFilter, setCaseFilter] = useState<string>("all");
  const [view, setView] = useState<"list" | "card">("list");
  const [selected, setSelected] = useState<ManagedDocument | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editorHtml, setEditorHtml] = useState("");
  const [versionSummary, setVersionSummary] = useState("");
  const [commentLine, setCommentLine] = useState("1");
  const [commentText, setCommentText] = useState("");
  const [hlFrom, setHlFrom] = useState("1");
  const [hlTo, setHlTo] = useState("1");
  const [hlNote, setHlNote] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matters.some((m) => m.id === caseId)) {
      const fallbackCase = matters[0];
      if (fallbackCase) {
        setCaseId(fallbackCase.id);
        setClientId(fallbackCase.clientId);
      } else {
        setCaseId("");
      }
    }
  }, [caseId]);

  useEffect(() => {
    if (!allClients.some((c) => c.id === clientId)) {
      setClientId(allClients[0]?.id ?? "");
    }
  }, [allClients, clientId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents.filter((d) => {
      if (tagFilter !== "all" && !d.tags.includes(tagFilter)) return false;
      if (caseFilter !== "all" && d.caseId !== caseFilter) return false;
      if (!q) return true;
      const blob = `${d.title} ${d.fileName} ${d.caseId} ${d.clientId} ${d.folderPath.join(" / ")}`.toLowerCase();
      return blob.includes(q);
    });
  }, [documents, query, tagFilter, caseFilter]);

  const grouped = useMemo(() => {
    const map: Record<string, ManagedDocument[]> = {};
    for (const doc of filtered) {
      const key = `${doc.caseId}__${doc.clientId}`;
      if (!map[key]) map[key] = [];
      map[key].push(doc);
    }
    return map;
  }, [filtered]);

  const openEditor = (doc: ManagedDocument) => {
    setSelected(doc);
    setEditorHtml(doc.content || "");
  };

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== editorHtml) editorRef.current.innerHTML = editorHtml;
  }, [editorHtml]);

  const runRichCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    setEditorHtml(editorRef.current.innerHTML);
  };

  const unattachDocument = (doc: ManagedDocument) => {
    const now = new Date().toISOString();
    const next: ManagedDocument = {
      ...doc,
      caseId: "",
      clientId: "",
      updatedAt: now,
      operations: [
        ...doc.operations,
        { id: `op-${now}`, kind: "move", detail: "Unattached from case and client", createdAt: now },
      ],
    };
    updateManagedDocument(next);
    if (selected?.id === doc.id) setSelected(next);
  };

  const removeDocument = (doc: ManagedDocument) => {
    const confirmed = window.confirm(`Remove "${doc.title}" from document registry?`);
    if (!confirmed) return;
    deleteManagedDocument(doc.id);
    if (selected?.id === doc.id) setSelected(null);
  };

  const handleUpload = (ev: FormEvent) => {
    ev.preventDefault();
    const resolvedLink = source === "local" ? (pickedFile ? `local://${pickedFile.name}` : "") : docLink.trim();
    if (!title.trim() || !caseId || !clientId || !resolvedLink) return;
    const inferredFileName = source === "local" && pickedFile ? pickedFile.name : `${title.trim().replace(/\s+/g, "_")}.pdf`;
    const inferredMime = source === "local" && pickedFile ? pickedFile.type || "application/octet-stream" : "application/pdf";
    const inferredSizeKb =
      source === "local" && pickedFile
        ? Math.max(1, Math.round(pickedFile.size / 1024))
        : Math.max(120, title.length * 14);
    createDocument({
      title,
      fileName: inferredFileName,
      mimeType: inferredMime,
      sizeKb: inferredSizeKb,
      caseId,
      clientId,
      link: resolvedLink,
      tags,
      folderPath: folderPath.split("/").map((p) => p.trim()).filter(Boolean),
    });
    setTitle("");
    setDocLink("");
    setPickedFile(null);
    setFolderPath("Case Files/Primary");
    setTags(["FIR"]);
  };

  const saveEditor = () => {
    if (!selected) return;
    const now = new Date().toISOString();
    const nextVersion = `v${selected.versions.length + 1}`;
    const next: ManagedDocument = {
      ...selected,
      content: editorHtml,
      updatedAt: now,
      versions: [
        ...selected.versions,
        {
          id: `ver-${now}`,
          label: nextVersion,
          summary: versionSummary.trim() || "Updated document body",
          editor: "Advocate",
          createdAt: now,
        },
      ],
      operations: [
        ...selected.operations,
        { id: `op-${now}`, kind: "edit", detail: "Edited document in rich editor", createdAt: now },
      ],
    };
    updateManagedDocument(next);
    setSelected(next);
    setVersionSummary("");
  };

  const addComment = () => {
    if (!selected || !commentText.trim()) return;
    const now = new Date().toISOString();
    const line = Math.max(1, Number.parseInt(commentLine, 10) || 1);
    const next: ManagedDocument = {
      ...selected,
      updatedAt: now,
      comments: [
        ...selected.comments,
        { id: `cm-${now}`, line, text: commentText.trim(), author: "Advocate", createdAt: now },
      ],
      operations: [
        ...selected.operations,
        { id: `op-${now}`, kind: "comment", detail: `Added comment on line ${line}`, createdAt: now },
      ],
    };
    updateManagedDocument(next);
    setSelected(next);
    setCommentText("");
  };

  const addHighlight = () => {
    if (!selected) return;
    const from = Math.max(1, Number.parseInt(hlFrom, 10) || 1);
    const to = Math.max(from, Number.parseInt(hlTo, 10) || from);
    const now = new Date().toISOString();
    const next: ManagedDocument = {
      ...selected,
      updatedAt: now,
      highlights: [
        ...selected.highlights,
        { id: `hl-${now}`, fromLine: from, toLine: to, note: hlNote.trim(), color: "amber", createdAt: now },
      ],
      operations: [
        ...selected.operations,
        { id: `op-${now}`, kind: "highlight", detail: `Highlighted lines ${from}-${to}`, createdAt: now },
      ],
    };
    updateManagedDocument(next);
    setSelected(next);
    setHlNote("");
  };

  return (
    <div className="min-h-full font-sans text-foreground">
      <header className="mb-5 border-b border-nyay-border pb-4">
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-nyay-trust sm:text-3xl dark:text-foreground">
          Document management
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-nyay-muted">
          Upload and organize documents by case and client, apply must-have legal tags (FIR, Agreement,
          Evidence), preview quickly, and keep version, comment, highlight, and operation records in one
          advocate workspace.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <form onSubmit={handleUpload} className="rounded-xl border border-nyay-border bg-nyay-surface p-4 nyay-card-shadow">
          <h2 className="text-lg font-semibold text-nyay-trust dark:text-foreground">Upload and link</h2>
          <div className="mt-3 grid gap-3">
            <label className="text-sm text-nyay-muted">
              Document title
              <input
                className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Bail order, sale agreement, FIR copy..."
              />
            </label>
            <label className="text-sm text-nyay-muted">
              Case
              <select
                className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust"
                value={caseId}
                onChange={(e) => {
                  const nextCaseId = e.target.value;
                  setCaseId(nextCaseId);
                  const matter = matters.find((m) => m.id === nextCaseId);
                  if (matter) setClientId(matter.clientId);
                }}
              >
                {matters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} - {m.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-nyay-muted">
              Client
              <select
                className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                {allClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-nyay-muted">
              Source
              <div className="mt-1 flex flex-wrap gap-2">
                <button type="button" onClick={() => setSource("local")} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${source === "local" ? "bg-nyay-authority-soft text-nyay-authority-fg" : "bg-nyay-canvas text-nyay-muted ring-1 ring-nyay-border"}`}>File manager</button>
                <button type="button" onClick={() => setSource("drive")} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${source === "drive" ? "bg-nyay-authority-soft text-nyay-authority-fg" : "bg-nyay-canvas text-nyay-muted ring-1 ring-nyay-border"}`}>Google Drive</button>
                <button type="button" onClick={() => setSource("onedrive")} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${source === "onedrive" ? "bg-nyay-authority-soft text-nyay-authority-fg" : "bg-nyay-canvas text-nyay-muted ring-1 ring-nyay-border"}`}>Microsoft OneDrive</button>
              </div>
            </label>
            {source === "local" ? (
              <label className="text-sm text-nyay-muted">
                Choose file from file manager
                <input
                  type="file"
                  className="mt-1 block w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust"
                  onChange={(e) => setPickedFile(e.target.files?.[0] ?? null)}
                />
                <p className="mt-1 text-xs text-nyay-muted">{pickedFile ? `Selected: ${pickedFile.name}` : "No file selected."}</p>
              </label>
            ) : (
              <label className="text-sm text-nyay-muted">
                {source === "drive" ? "Google Drive link" : "OneDrive link"}
                <input
                  className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust"
                  value={docLink}
                  onChange={(e) => setDocLink(e.target.value)}
                  placeholder={source === "drive" ? "https://drive.google.com/..." : "https://onedrive.live.com/..."}
                />
                <div className="mt-1">
                  <a
                    href={source === "drive" ? "https://drive.google.com" : "https://onedrive.live.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-nyay-authority hover:underline"
                  >
                    Open {source === "drive" ? "Drive" : "OneDrive"} picker
                  </a>
                </div>
              </label>
            )}
            <label className="text-sm text-nyay-muted">
              Folder hierarchy
              <input
                className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust"
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                placeholder="Case Files/2026/Evidence"
              />
            </label>
            <fieldset className="rounded-lg border border-nyay-border p-3">
              <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-nyay-muted">Tags</legend>
              <div className="mt-1 flex flex-wrap gap-2">
                {TAGS.map((tag) => {
                  const active = tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setTags((curr) => (curr.includes(tag) ? curr.filter((x) => x !== tag) : [...curr, tag]))
                      }
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        active
                          ? "bg-nyay-authority-soft text-nyay-authority-fg"
                          : "bg-nyay-canvas text-nyay-muted ring-1 ring-nyay-border"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <button
              type="submit"
              className="rounded-lg bg-nyay-trust px-4 py-2 text-sm font-semibold text-white hover:bg-nyay-trust-mid"
            >
              Upload and attach to case + client
            </button>
          </div>
        </form>

        <div className="rounded-xl border border-nyay-border bg-nyay-surface p-4 nyay-card-shadow">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-nyay-trust dark:text-foreground">Registry and hierarchy</h2>
            <button
              type="button"
              onClick={() => {
                if (selected) setPreviewOpen(true);
              }}
              className="rounded-lg border border-nyay-border px-3 py-1.5 text-xs font-semibold text-nyay-trust-mid disabled:opacity-50"
              disabled={!selected}
            >
              Quick preview
            </button>
          </div>
          <div className="mt-3">
            <SearchFilterToolbar
              searchLabel="Search documents"
              searchPlaceholder="Search file, case ID, client, folder..."
              query={query}
              onQueryChange={setQuery}
              view={view}
              onViewChange={setView}
            >
              <FilterOptionsMenu
                title="Tag"
                tone="authority"
                options={
                  [{ key: "all", label: "All tags" }, ...TAGS.map((tag) => ({ key: tag, label: tag }))] as const
                }
                value={tagFilter}
                onChange={setTagFilter}
                defaultValue="all"
              />
              <FilterOptionsMenu
                title="Case"
                tone="trust"
                options={
                  [
                    { key: "all", label: "All cases" },
                    ...matters.map((m) => ({ key: m.id, label: m.id })),
                  ] as const
                }
                value={caseFilter}
                onChange={setCaseFilter}
                defaultValue="all"
              />
            </SearchFilterToolbar>
          </div>

          <p className="mt-2 text-xs text-nyay-muted">{filtered.length} documents available</p>
          {filtered.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-nyay-border px-4 py-8 text-center text-sm text-nyay-muted">
              No documents match the current filters.
            </div>
          ) : view === "list" ? (
            <div className="mt-4 max-h-80 overflow-auto rounded-lg border border-nyay-border">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-nyay-border bg-nyay-canvas">
                    <th className="px-3 py-2 font-semibold text-nyay-trust">Document</th>
                    <th className="px-3 py-2 font-semibold text-nyay-trust">Case / Client</th>
                    <th className="px-3 py-2 font-semibold text-nyay-trust">Hierarchy</th>
                    <th className="px-3 py-2 font-semibold text-nyay-trust">Tags</th>
                    <th className="px-3 py-2 font-semibold text-nyay-trust">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => (
                    <tr key={doc.id} className="border-b border-nyay-border/60 last:border-0">
                      <td className="px-3 py-2">
                        <p className="font-medium text-nyay-trust">{doc.title}</p>
                        <p className="text-xs text-nyay-muted">{doc.fileName}</p>
                      </td>
                      <td className="px-3 py-2 text-xs text-nyay-muted">
                        {doc.caseId || "Unattached"} / {doc.clientId ? clientDisplayName(doc.clientId, allClients) : "Unattached"}
                      </td>
                      <td className="px-3 py-2 text-xs text-nyay-muted">{doc.folderPath.join(" / ") || "—"}</td>
                      <td className="px-3 py-2 text-xs text-nyay-muted">{doc.tags.join(", ")}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1.5">
                          <button type="button" onClick={() => openEditor(doc)} className="rounded border border-nyay-border px-2 py-1 text-xs font-semibold">
                            Edit
                          </button>
                          <button type="button" onClick={() => unattachDocument(doc)} className="rounded border border-nyay-border px-2 py-1 text-xs font-semibold">
                            Unattach
                          </button>
                          <button type="button" onClick={() => removeDocument(doc)} className="rounded border border-red-400/40 px-2 py-1 text-xs font-semibold text-red-700 dark:text-red-300">
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-4 grid max-h-80 gap-3 overflow-auto pr-1 sm:grid-cols-2">
              {Object.entries(grouped).map(([groupKey, docs]) => {
                const first = docs[0];
                return (
                  <div key={groupKey} className="rounded-lg border border-nyay-border bg-nyay-canvas/40 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-nyay-muted">
                      {first.caseId || "Unattached"} / {first.clientId ? clientDisplayName(first.clientId, allClients) : "Unattached"}
                    </p>
                    <ul className="mt-2 space-y-2">
                      {docs.map((doc) => (
                        <li key={doc.id} className="rounded border border-nyay-border/60 bg-nyay-surface p-2">
                          <p className="text-sm font-medium text-nyay-trust">{doc.title}</p>
                          <p className="text-xs text-nyay-muted">{doc.folderPath.join(" / ")}</p>
                          <div className="mt-2 flex gap-1.5">
                            <button type="button" onClick={() => openEditor(doc)} className="rounded border border-nyay-border px-2 py-1 text-xs font-semibold">
                              Edit
                            </button>
                            <button type="button" onClick={() => unattachDocument(doc)} className="rounded border border-nyay-border px-2 py-1 text-xs font-semibold">
                              Unattach
                            </button>
                            <button type="button" onClick={() => removeDocument(doc)} className="rounded border border-red-400/40 px-2 py-1 text-xs font-semibold text-red-700 dark:text-red-300">
                              Remove
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="mt-5 rounded-xl border border-nyay-border bg-nyay-surface p-4 nyay-card-shadow">
        <h2 className="text-lg font-semibold text-nyay-trust dark:text-foreground">Document records tracking</h2>
        {selected ? (
          <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="space-y-3">
              <div className="rounded-lg border border-nyay-border bg-nyay-canvas p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-nyay-muted">
                  {selected.fileName} · {selected.sizeKb} KB
                </p>
                <p className="mt-1 text-sm text-nyay-trust">
                  Case: {selected.caseId} · Client: {clientDisplayName(selected.clientId, allClients)}
                </p>
                <a href={selected.link} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-nyay-authority hover:underline">
                  Open attached link
                </a>
              </div>

              <label className="block text-sm text-nyay-muted">
                Rich editor
                <div className="mt-1 rounded-lg border border-nyay-border">
                  <div className="flex flex-wrap gap-1 border-b border-nyay-border bg-nyay-canvas p-2">
                    <button type="button" onClick={() => runRichCommand("bold")} className="rounded border border-nyay-border px-2 py-1 text-xs font-semibold">Bold</button>
                    <button type="button" onClick={() => runRichCommand("italic")} className="rounded border border-nyay-border px-2 py-1 text-xs font-semibold">Italic</button>
                    <button type="button" onClick={() => runRichCommand("underline")} className="rounded border border-nyay-border px-2 py-1 text-xs font-semibold">Underline</button>
                    <button type="button" onClick={() => runRichCommand("insertUnorderedList")} className="rounded border border-nyay-border px-2 py-1 text-xs font-semibold">Bullets</button>
                    <button type="button" onClick={() => runRichCommand("insertOrderedList")} className="rounded border border-nyay-border px-2 py-1 text-xs font-semibold">Numbering</button>
                    <button type="button" onClick={() => runRichCommand("formatBlock", "h3")} className="rounded border border-nyay-border px-2 py-1 text-xs font-semibold">Heading</button>
                  </div>
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => setEditorHtml((e.currentTarget as HTMLDivElement).innerHTML)}
                    className="h-56 overflow-y-auto bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:outline-none"
                    data-placeholder="Draft notes, extracted text, or argument outline..."
                  />
                </div>
              </label>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust"
                  value={versionSummary}
                  onChange={(e) => setVersionSummary(e.target.value)}
                  placeholder="Modification summary"
                />
                <button
                  type="button"
                  onClick={saveEditor}
                  className="rounded-lg bg-nyay-trust px-3 py-2 text-sm font-semibold text-white hover:bg-nyay-trust-mid"
                >
                  Save version
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-nyay-border bg-nyay-canvas p-3">
                <p className="text-sm font-semibold text-nyay-trust dark:text-foreground">Line comments</p>
                <div className="mt-2 flex gap-2">
                  <input
                    className="w-20 rounded-lg border border-nyay-border bg-nyay-surface px-2 py-1.5 text-sm"
                    value={commentLine}
                    onChange={(e) => setCommentLine(e.target.value)}
                  />
                  <input
                    className="flex-1 rounded-lg border border-nyay-border bg-nyay-surface px-2 py-1.5 text-sm"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Comment on selected line"
                  />
                  <button type="button" onClick={addComment} className="rounded-lg border border-nyay-border px-2 py-1.5 text-xs font-semibold">
                    Add
                  </button>
                </div>
              </div>
              <div className="rounded-lg border border-nyay-border bg-nyay-canvas p-3">
                <p className="text-sm font-semibold text-nyay-trust dark:text-foreground">Highlights</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <input className="w-16 rounded-lg border border-nyay-border bg-nyay-surface px-2 py-1.5 text-sm" value={hlFrom} onChange={(e) => setHlFrom(e.target.value)} />
                  <input className="w-16 rounded-lg border border-nyay-border bg-nyay-surface px-2 py-1.5 text-sm" value={hlTo} onChange={(e) => setHlTo(e.target.value)} />
                  <input
                    className="min-w-40 flex-1 rounded-lg border border-nyay-border bg-nyay-surface px-2 py-1.5 text-sm"
                    value={hlNote}
                    onChange={(e) => setHlNote(e.target.value)}
                    placeholder="Highlight note"
                  />
                  <button type="button" onClick={addHighlight} className="rounded-lg border border-nyay-border px-2 py-1.5 text-xs font-semibold">
                    Add
                  </button>
                </div>
              </div>
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-nyay-border bg-nyay-canvas p-3">
                <p className="text-sm font-semibold text-nyay-trust dark:text-foreground">Operations log</p>
                {selected.operations.length === 0 ? (
                  <p className="text-xs text-nyay-muted">No operations yet.</p>
                ) : (
                  selected.operations.slice().reverse().map((op) => (
                    <p key={op.id} className="text-xs text-nyay-muted">
                      {formatTime(op.createdAt)} - {op.detail}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-nyay-muted">
            Select a document from registry to open editor, comments, highlights, and records.
          </p>
        )}
      </section>

      <AppModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={selected?.title ?? "Quick preview"}
        description={selected ? `${selected.caseId} · ${clientDisplayName(selected.clientId, allClients)}` : undefined}
      >
        {selected ? (
          <div className="space-y-3">
            <p className="text-xs text-nyay-muted">Tags: {selected.tags.join(", ")}</p>
            <p className="text-xs text-nyay-muted">Hierarchy: {selected.folderPath.join(" / ")}</p>
            <div className="rounded-lg border border-dashed border-nyay-border bg-nyay-canvas/40 p-3">
              <p className="text-sm font-medium text-nyay-trust">Preview snippet</p>
              <p className="mt-1 whitespace-pre-wrap text-xs text-nyay-muted">
                {(selected.content || "No extracted text available yet. Use editor to maintain draft text.").slice(0, 400)}
              </p>
            </div>
          </div>
        ) : null}
      </AppModal>
    </div>
  );
}
