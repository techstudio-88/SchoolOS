import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/** Every school that uses the platform (tenant). Managed only from the hidden admin console. */
export const schools = pgTable("schools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ownerName: text("owner_name").notNull().default("School Owner"),
  ownerEmail: text("owner_email").notNull().default(""),
  city: text("city").notNull().default(""),
  plan: text("plan").notNull().default("trial"), // trial | starter | pro | enterprise
  status: text("status").notNull().default("active"), // active | suspended | trial
  studentsCount: integer("students_count").notNull().default(0),
  isDemo: boolean("is_demo").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Generic record store: every feature in the catalog persists rows here. */
export const records = pgTable(
  "records",
  {
    id: serial("id").primaryKey(),
    schoolId: integer("school_id").notNull(),
    moduleId: text("module_id").notNull(),
    featureKey: text("feature_key").notNull(),
    title: text("title").notNull(),
    person: text("person").notNull().default(""),
    amount: integer("amount").notNull().default(0),
    dueDate: text("due_date").notNull().default(""),
    status: text("status").notNull().default("open"), // open | in_progress | done | flagged
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("records_school_feature_idx").on(t.schoolId, t.featureKey),
    index("records_school_module_idx").on(t.schoolId, t.moduleId),
  ],
);

/** Per-school on/off switch for each feature. Missing row = enabled. */
export const featureSettings = pgTable(
  "feature_settings",
  {
    schoolId: integer("school_id").notNull(),
    featureKey: text("feature_key").notNull(),
    enabled: boolean("enabled").notNull().default(true),
  },
  (t) => [primaryKey({ columns: [t.schoolId, t.featureKey] })],
);

/** Broadcast notices from the platform owner to every school dashboard. */
export const platformNotices = pgTable("platform_notices", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Audit trail of everything done in the hidden admin console. */
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  detail: text("detail").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
