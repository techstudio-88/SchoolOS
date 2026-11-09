import { RAW_MODULES } from "./catalog-data";

export type Feature = {
  key: string; // globally unique: moduleId.slug
  name: string;
  moduleId: string;
  index: number;
  description: string;
};

export type Module = {
  id: string;
  title: string;
  icon: string;
  color: string;
  blurb: string;
  features: Feature[];
};

export type Panel = {
  id: string;
  title: string;
  tagline: string;
  icon: string;
  color: string;
  group: "Leadership" | "Academics" | "Operations" | "Support" | "Community";
  modules: string[];
};

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const VERBS = [
  "Configure",
  "Track",
  "Review",
  "Automate",
  "Approve",
  "Report on",
  "Monitor",
  "Organise",
];

export const MODULES: Module[] = RAW_MODULES.map((m) => ({
  id: m.id,
  title: m.title,
  icon: m.icon,
  color: m.color,
  blurb: m.blurb,
  features: m.f.split(";").map((name, index) => ({
    key: `${m.id}.${slug(name)}`,
    name,
    moduleId: m.id,
    index,
    description: `${VERBS[index % VERBS.length]} ${name.toLowerCase()} for your school — log entries, assign owners, set due dates and keep a clean audit trail.`,
  })),
}));

export const MODULE_MAP: Record<string, Module> = Object.fromEntries(
  MODULES.map((m) => [m.id, m]),
);

export const ALL_FEATURES: Feature[] = MODULES.flatMap((m) => m.features);
export const FEATURE_MAP: Record<string, Feature> = Object.fromEntries(
  ALL_FEATURES.map((f) => [f.key, f]),
);
export const TOTAL_FEATURES = ALL_FEATURES.length;

export const PANELS: Panel[] = [
  {
    id: "owner", title: "Owner", tagline: "Business, growth and the big picture", icon: "Crown", color: "#d946ef", group: "Leadership",
    modules: ["owner", "admissions", "students", "attendance", "timetable", "syllabus", "lessons", "homework", "exams", "grading", "fees", "finance", "payroll", "hr", "leave", "recruit", "uniform", "inventory", "library", "transport", "hostel", "canteen", "health", "counselling", "discipline", "comms", "events", "sports", "labs", "elearn", "safety", "frontdesk", "facilities", "compliance", "analytics", "marketing", "pd", "sen", "scholarships", "it", "docs", "governance", "ai"],
  },
  {
    id: "principal", title: "Principal", tagline: "Academic leadership and school culture", icon: "School", color: "#8b5cf6", group: "Leadership",
    modules: ["analytics", "syllabus", "exams", "grading", "hr", "discipline", "compliance", "comms", "events", "pd", "governance", "lessons"],
  },
  {
    id: "vice-principal", title: "Vice Principal", tagline: "Daily running of academics and discipline", icon: "ShieldHalf", color: "#6366f1", group: "Leadership",
    modules: ["timetable", "discipline", "attendance", "exams", "pd", "comms", "events", "homework", "lessons"],
  },
  {
    id: "manager", title: "School Manager", tagline: "Operations, assets and administration", icon: "Briefcase", color: "#f59e0b", group: "Operations",
    modules: ["inventory", "facilities", "uniform", "frontdesk", "transport", "hr", "docs", "comms", "safety"],
  },
  {
    id: "teacher", title: "Teacher", tagline: "Plan, teach, assess, inspire", icon: "PencilRuler", color: "#10b981", group: "Academics",
    modules: ["syllabus", "lessons", "homework", "attendance", "exams", "grading", "elearn", "labs", "sen", "counselling"],
  },
  {
    id: "exam-controller", title: "Exam Controller", tagline: "Schedules, papers and results", icon: "FileCheck2", color: "#f43f5e", group: "Academics",
    modules: ["exams", "grading", "timetable", "docs", "analytics"],
  },
  {
    id: "accountant", title: "Accountant", tagline: "Fees, books, payroll and aid", icon: "Calculator", color: "#38bdf8", group: "Operations",
    modules: ["fees", "finance", "payroll", "scholarships"],
  },
  {
    id: "hr", title: "HR Officer", tagline: "People, leave, hiring and growth", icon: "UsersRound", color: "#ec4899", group: "Operations",
    modules: ["hr", "leave", "recruit", "payroll", "pd"],
  },
  {
    id: "admissions", title: "Admissions Officer", tagline: "Enquiries to enrollments", icon: "UserPlus", color: "#22d3ee", group: "Operations",
    modules: ["admissions", "students", "docs", "marketing", "comms"],
  },
  {
    id: "receptionist", title: "Receptionist", tagline: "Front desk, visitors and calls", icon: "Bell", color: "#fb923c", group: "Support",
    modules: ["frontdesk", "comms", "events", "safety"],
  },
  {
    id: "librarian", title: "Librarian", tagline: "Books, members and reading", icon: "Library", color: "#a78bfa", group: "Support",
    modules: ["library", "comms", "students"],
  },
  {
    id: "transport", title: "Transport Head", tagline: "Fleet, routes and student safety", icon: "Bus", color: "#fbbf24", group: "Support",
    modules: ["transport", "safety", "facilities"],
  },
  {
    id: "warden", title: "Hostel Warden", tagline: "Boarding life, meals and safety", icon: "BedDouble", color: "#818cf8", group: "Support",
    modules: ["hostel", "canteen", "safety", "health"],
  },
  {
    id: "nurse", title: "Nurse & Counsellor", tagline: "Health, wellbeing and inclusion", icon: "HeartPulse", color: "#fb7185", group: "Support",
    modules: ["health", "counselling", "sen"],
  },
  {
    id: "storekeeper", title: "Uniform & Store", tagline: "Uniform sales, stock and supplies", icon: "Shirt", color: "#2dd4bf", group: "Operations",
    modules: ["uniform", "inventory", "canteen"],
  },
  {
    id: "it-admin", title: "IT Admin", tagline: "Accounts, security and integrations", icon: "Server", color: "#60a5fa", group: "Operations",
    modules: ["it", "safety", "ai", "elearn", "docs"],
  },
  {
    id: "student", title: "Student", tagline: "Your timetable, marks and goals", icon: "Backpack", color: "#34d399", group: "Community",
    modules: ["studentportal", "homework", "exams", "grading", "attendance", "library", "events", "sports"],
  },
  {
    id: "parent", title: "Parent", tagline: "Stay close to your child's journey", icon: "Home", color: "#f472b6", group: "Community",
    modules: ["parent", "fees", "attendance", "grading", "transport", "comms", "events"],
  },
];

export const PANEL_MAP: Record<string, Panel> = Object.fromEntries(
  PANELS.map((p) => [p.id, p]),
);

export function panelFeatureCount(p: Panel) {
  return p.modules.reduce((n, id) => n + (MODULE_MAP[id]?.features.length ?? 0), 0);
}

export const STATUSES = [
  { id: "open", label: "Open", color: "#38bdf8" },
  { id: "in_progress", label: "In progress", color: "#f59e0b" },
  { id: "done", label: "Done", color: "#10b981" },
  { id: "flagged", label: "Flagged", color: "#f43f5e" },
] as const;

export type StatusId = (typeof STATUSES)[number]["id"];

/** Realistic sample rows used by the "Load sample data" button. */
export const SAMPLE_PEOPLE = [
  "Aarav Sharma", "Diya Patel", "Mr. Khanna", "Ms. Fernandes", "Rohan Mehta",
  "Ananya Iyer", "Mrs. Banerjee", "Kabir Singh", "Ishita Nair", "Mr. D'Souza",
];
