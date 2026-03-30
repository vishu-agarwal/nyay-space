"use client";

import { openPrintableHtml, downloadTextFile } from "@/lib/print-utils";

type Props = {
  caseId: string;
  title: string;
  court: string;
  stage: string;
  next: string;
  synopsis: string;
  nextHearing: string;
  filedOn: string;
  judge: string;
  opposingParty: string;
  opposingCounsel: string;
};

function buildExportText(p: Props): string {
  const lines = [
    `Matter summary — ${p.caseId}`,
    `Title: ${p.title}`,
    `Court / forum: ${p.court || "—"}`,
    `Stage: ${p.stage || "—"}`,
    `Next (diary): ${p.next || "—"}`,
    `Next hearing: ${p.nextHearing || "—"}`,
    `Filed: ${p.filedOn || "—"}`,
    `Bench / arbitrator: ${p.judge || "—"}`,
    `Opposing party: ${p.opposingParty || "—"}`,
    `Opposing counsel: ${p.opposingCounsel || "—"}`,
    "",
    "Synopsis:",
    p.synopsis || "—",
    "",
    `Generated from Nyay Space · ${new Date().toLocaleString("en-IN")}`,
  ];
  return lines.join("\n");
}

function buildPrintBody(p: Props): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const row = (label: string, value: string) =>
    `<dt>${esc(label)}</dt><dd>${esc(value || "—")}</dd>`;
  return `
    <h1>${esc(p.caseId)} — ${esc(p.title)}</h1>
    <dl>
      ${row("Court / forum", p.court)}
      ${row("Stage", p.stage)}
      ${row("Next in diary", p.next)}
      ${row("Next hearing", p.nextHearing)}
      ${row("Filed", p.filedOn)}
      ${row("Bench / arbitrator", p.judge)}
      ${row("Opposing party", p.opposingParty)}
      ${row("Opposing counsel", p.opposingCounsel)}
    </dl>
    <p><strong>Synopsis</strong></p>
    <pre>${esc(p.synopsis || "—")}</pre>
  `;
}

export function MatterPrintActions(props: Props) {
  const printSummary = () => {
    openPrintableHtml(`Matter ${props.caseId}`, buildPrintBody(props));
  };

  const exportTxt = () => {
    const safe = props.caseId.replace(/[^\w-]+/g, "_");
    downloadTextFile(`matter-${safe}-summary.txt`, buildExportText(props));
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={printSummary}
        className="rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
      >
        Print summary
      </button>
      <button
        type="button"
        onClick={exportTxt}
        className="rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
      >
        Download .txt
      </button>
    </div>
  );
}
