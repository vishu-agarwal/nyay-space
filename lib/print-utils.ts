/** Client-only helpers for print layouts and text export. */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function openPrintableHtml(title: string, bodyHtml: string): void {
  if (typeof window === "undefined") return;
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return;
  const doc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, Segoe UI, Roboto, sans-serif; line-height: 1.45; color: #111; max-width: 48rem; margin: 1.5rem auto; padding: 0 1rem; }
    h1 { font-size: 1.25rem; margin-bottom: 0.75rem; border-bottom: 1px solid #ccc; padding-bottom: 0.35rem; }
    dl { margin: 0; }
    dt { font-weight: 600; margin-top: 0.65rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.03em; color: #444; }
    dd { margin: 0.15rem 0 0 0; }
    pre { white-space: pre-wrap; word-break: break-word; font-size: 0.85rem; background: #f6f6f6; padding: 0.75rem; border-radius: 6px; }
    @media print { body { margin: 0; max-width: none; } }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
  w.document.write(doc);
  w.document.close();
  w.onload = () => {
    w.focus();
    w.print();
  };
}

export function downloadTextFile(filename: string, content: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.replace(/[^\w.\- ()[\]]+/g, "_");
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
