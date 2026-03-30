export type CaseStatus = "active" | "closed" | "urgent";

export type CaseType = "civil" | "criminal" | "family";

export type Matter = {
  id: string;
  title: string;
  clientId: string;
  caseType: CaseType;
  stage: string;
  next: string | null;
  court: string;
  status: CaseStatus;
};

export type TimelineKind =
  | "hearing"
  | "filing"
  | "order"
  | "mediation"
  | "note";

export type TimelineEvent = {
  id: string;
  date: string;
  time?: string;
  title: string;
  detail?: string;
  kind: TimelineKind;
};

export type CaseDocument = {
  id: string;
  name: string;
  kind: "pleading" | "order" | "evidence" | "correspondence";
  updated: string;
  pages?: number;
};

export type CaseDetailExtra = {
  judge?: string;
  opposingParty?: string;
  opposingCounsel?: string;
  filedOn?: string;
  nextHearing?: string;
  synopsis?: string;
  timeline: TimelineEvent[];
  documents: CaseDocument[];
};

export const matters: Matter[] = [
  {
    id: "CV-2025-02",
    title: "Contract dispute — supply agreement",
    clientId: "cl-nw",
    caseType: "civil",
    stage: "Written statements",
    next: "Apr 2",
    court: "District Court, Saket",
    status: "active",
  },
  {
    id: "CR-2024-881",
    title: "Bail & trial prep",
    clientId: "cl-khan",
    caseType: "criminal",
    stage: "Hearing cycle",
    next: "Mar 28",
    court: "Sessions Court",
    status: "active",
  },
  {
    id: "ARB-2023-44",
    title: "Construction arbitration",
    clientId: "cl-bw",
    caseType: "civil",
    stage: "Evidence",
    next: "Mar 31",
    court: "Arbitration Centre, Delhi",
    status: "active",
  },
  {
    id: "CV-2024-118",
    title: "Property injunction",
    clientId: "cl-reddy",
    caseType: "civil",
    stage: "Pleadings",
    next: "Mar 29",
    court: "District Court, Rohini",
    status: "active",
  },
  {
    id: "CV-2023-201",
    title: "Consumer compensation — defective goods",
    clientId: "cl-metro",
    caseType: "civil",
    stage: "Disposed",
    next: null,
    court: "District Consumer Forum",
    status: "closed",
  },
  {
    id: "FAM-2022-14",
    title: "Mutual consent divorce",
    clientId: "cl-kapoor",
    caseType: "family",
    stage: "Decree granted",
    next: null,
    court: "Family Court, Patiala House",
    status: "closed",
  },
  {
    id: "LAB-2024-07",
    title: "Wrongful termination — IT sector",
    clientId: "cl-pf",
    caseType: "civil",
    stage: "Settled",
    next: null,
    court: "Labour Court, Gurgaon",
    status: "closed",
  },
];

const detailById: Record<string, CaseDetailExtra> = {
  "CV-2025-02": {
    judge: "Shri Justice Mehta (Commercial)",
    opposingParty: "Metro Developers Pvt Ltd",
    opposingCounsel: "Adv. R. Khanna",
    filedOn: "Jan 12, 2025",
    nextHearing: "Apr 2, 2026 · 11:00 AM",
    synopsis:
      "Breach of long-term supply contract; interim relief declined; pleadings and discovery underway.",
    timeline: [
      {
        id: "t1",
        date: "2025-01-12",
        title: "Suit instituted",
        detail: "Plaint filed; court fee and summons issued.",
        kind: "filing",
      },
      {
        id: "t2",
        date: "2025-02-03",
        time: "10:30 AM",
        title: "First hearing — directions",
        detail: "Issues framed; timeline for written statement fixed.",
        kind: "hearing",
      },
      {
        id: "t3",
        date: "2025-02-18",
        title: "Written statement filed (defendant)",
        detail: "Denial of material terms; counter-claim reserved.",
        kind: "filing",
      },
      {
        id: "t4",
        date: "2025-03-01",
        title: "Interim application (injunction)",
        detail: "Court declined interim relief; liberty to renew after pleadings close.",
        kind: "order",
      },
      {
        id: "t5",
        date: "2025-03-14",
        time: "2:00 PM",
        title: "Mediation referral",
        detail: "Parties to appear before court-linked mediation centre.",
        kind: "mediation",
      },
      {
        id: "t6",
        date: "2025-03-22",
        title: "Internal note — client call",
        detail: "Discussed settlement band and evidence gaps for affidavit of documents.",
        kind: "note",
      },
      {
        id: "t7",
        date: "2026-04-10",
        time: "2:00 PM",
        title: "Court-linked mediation — second session",
        detail: "Parties to revisit settlement band after written statements.",
        kind: "mediation",
      },
    ],
    documents: [
      {
        id: "d1",
        name: "Plaint & annexures.pdf",
        kind: "pleading",
        updated: "Jan 12, 2025",
        pages: 42,
      },
      {
        id: "d2",
        name: "Written statement (defendant).pdf",
        kind: "pleading",
        updated: "Feb 18, 2025",
        pages: 28,
      },
      {
        id: "d3",
        name: "Order — interim application.pdf",
        kind: "order",
        updated: "Mar 1, 2025",
        pages: 6,
      },
      {
        id: "d4",
        name: "List of documents (draft).docx",
        kind: "evidence",
        updated: "Mar 20, 2025",
      },
      {
        id: "d5",
        name: "Email chain — delivery schedules.eml",
        kind: "correspondence",
        updated: "Mar 21, 2025",
      },
    ],
  },
  "CR-2024-881": {
    judge: "Sessions Judge (Fast Track)",
    opposingParty: "State",
    filedOn: "Aug 3, 2024",
    nextHearing: "Mar 28, 2026 · 10:00 AM",
    synopsis: "Bail granted; trial dates being staggered with witness examination.",
    timeline: [
      {
        id: "t1",
        date: "2024-08-03",
        title: "FIR & arrest",
        kind: "note",
      },
      {
        id: "t2",
        date: "2024-09-10",
        title: "Bail order",
        detail: "Regular bail on conditions.",
        kind: "order",
      },
      {
        id: "t3",
        date: "2025-01-20",
        time: "11:00 AM",
        title: "Charge framed",
        kind: "hearing",
      },
    ],
    documents: [
      {
        id: "d1",
        name: "Bail order.pdf",
        kind: "order",
        updated: "Sep 10, 2024",
        pages: 5,
      },
      {
        id: "d2",
        name: "Witness list (prosecution).pdf",
        kind: "evidence",
        updated: "Jan 15, 2025",
      },
    ],
  },
  "ARB-2023-44": {
    judge: "Sole Arbitrator — Retd. Justice K. Rao",
    opposingParty: "Skyline Infra Ltd",
    filedOn: "Jun 2, 2023",
    nextHearing: "Mar 31, 2026",
    synopsis: "Delay claims and counter-claims; evidence phase.",
    timeline: [
      {
        id: "t1",
        date: "2023-06-02",
        title: "Notice of arbitration",
        kind: "filing",
      },
      {
        id: "t2",
        date: "2024-11-08",
        title: "Statement of claim (amended)",
        kind: "filing",
      },
      {
        id: "t3",
        date: "2025-02-01",
        title: "Document production order",
        kind: "order",
      },
    ],
    documents: [
      {
        id: "d1",
        name: "Statement of claim.pdf",
        kind: "pleading",
        updated: "Nov 8, 2024",
        pages: 64,
      },
      {
        id: "d2",
        name: "Expert report — structural.pdf",
        kind: "evidence",
        updated: "Jan 10, 2025",
        pages: 31,
      },
    ],
  },
  "CV-2024-118": {
    judge: "Civil Judge (Senior Division)",
    opposingParty: "M. Builders & Ors",
    filedOn: "Oct 5, 2024",
    nextHearing: "Mar 29, 2026",
    synopsis: "Injunction over disputed plot; written statement due.",
    timeline: [
      {
        id: "t1",
        date: "2024-10-05",
        title: "Suit & interim application",
        kind: "filing",
      },
      {
        id: "t2",
        date: "2024-10-12",
        title: "Status quo order",
        kind: "order",
      },
    ],
    documents: [
      {
        id: "d1",
        name: "Plaint with maps.pdf",
        kind: "pleading",
        updated: "Oct 5, 2024",
        pages: 38,
      },
    ],
  },
  "CV-2023-201": {
    filedOn: "Apr 18, 2023",
    synopsis: "Disposed in favour of complainant; decree copy on file.",
    timeline: [
      {
        id: "t1",
        date: "2023-04-18",
        title: "Complaint filed",
        kind: "filing",
      },
      {
        id: "t2",
        date: "2024-01-22",
        title: "Final order & decree",
        kind: "order",
      },
    ],
    documents: [
      {
        id: "d1",
        name: "Decree.pdf",
        kind: "order",
        updated: "Jan 22, 2024",
        pages: 12,
      },
    ],
  },
  "FAM-2022-14": {
    filedOn: "Mar 2, 2022",
    synopsis: "Mutual consent; decree granted.",
    timeline: [
      {
        id: "t1",
        date: "2022-03-02",
        title: "Petition filed",
        kind: "filing",
      },
      {
        id: "t2",
        date: "2023-09-14",
        title: "Decree granted",
        kind: "order",
      },
    ],
    documents: [
      {
        id: "d1",
        name: "Consent terms.pdf",
        kind: "pleading",
        updated: "Sep 1, 2023",
        pages: 4,
      },
    ],
  },
  "LAB-2024-07": {
    filedOn: "Feb 10, 2024",
    synopsis: "Settled with full and final payment; closure memo filed.",
    timeline: [
      {
        id: "t1",
        date: "2024-02-10",
        title: "Claim petition",
        kind: "filing",
      },
      {
        id: "t2",
        date: "2024-12-02",
        title: "Settlement recorded",
        kind: "order",
      },
    ],
    documents: [
      {
        id: "d1",
        name: "Settlement deed.pdf",
        kind: "correspondence",
        updated: "Dec 2, 2024",
        pages: 8,
      },
    ],
  },
};

function defaultDetail(): CaseDetailExtra {
  return {
    timeline: [],
    documents: [],
  };
}

export function getMatterById(id: string): Matter | undefined {
  return matters.find((m) => m.id === id);
}

export function mattersForClientId(clientId: string): Matter[] {
  return matters.filter((m) => m.clientId === clientId);
}

export function getCaseDetailForId(id: string): {
  matter: Matter;
  extra: CaseDetailExtra;
} | null {
  const matter = getMatterById(id);
  if (!matter) return null;
  const extra = detailById[id] ?? defaultDetail();
  return { matter, extra };
}
