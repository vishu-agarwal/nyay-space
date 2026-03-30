/** Top-level practice app paths (not nested under a single /dashboard segment). */
export const routes = {
  home: "/",
  tasks: "/tasks",
  calendar: "/calendar",
  cases: "/cases",
  clients: "/clients",
  documents: "/documents",
  case: (id: string) => `/cases/${encodeURIComponent(id)}`,
  client: (id: string) => `/clients/${encodeURIComponent(id)}`,
  caseDocument: (caseId: string, docId: string) =>
    `${routes.case(caseId)}#document-${docId}`,
} as const;
