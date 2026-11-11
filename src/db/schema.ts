import { boolean, index, integer, jsonb, pgTable, primaryKey, serial, text, timestamp } from "drizzle-orm/pg-core";

export const schools = pgTable("schools", {
  id: serial("id").primaryKey(), name: text("name").notNull(), slug: text("slug").notNull().unique(),
  ownerName: text("owner_name").notNull().default("School Owner"), ownerEmail: text("owner_email").notNull().default(""),
  city: text("city").notNull().default(""), plan: text("plan").notNull().default("trial"),
  status: text("status").notNull().default("active"), studentsCount: integer("students_count").notNull().default(0),
  isDemo: boolean("is_demo").notNull().default(false), createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Tenant-scoped operational entries. payload stores module-specific typed fields. */
export const records = pgTable("records", {
  id: serial("id").primaryKey(), schoolId: integer("school_id").notNull(), moduleId: text("module_id").notNull(),
  featureKey: text("feature_key").notNull(), title: text("title").notNull(), person: text("person").notNull().default(""),
  amount: integer("amount").notNull().default(0), dueDate: text("due_date").notNull().default(""),
  status: text("status").notNull().default("open"), notes: text("notes").notNull().default(""),
  payload: jsonb("payload").$type<Record<string, string | number | boolean | null>>().notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("records_school_feature_idx").on(t.schoolId, t.featureKey),
  index("records_school_module_idx").on(t.schoolId, t.moduleId),
  index("records_school_module_created_idx").on(t.schoolId, t.moduleId, t.createdAt),
]);

export const featureSettings = pgTable("feature_settings", {
  schoolId: integer("school_id").notNull(), featureKey: text("feature_key").notNull(),
  enabled: boolean("enabled").notNull().default(true),
}, (t) => [primaryKey({ columns: [t.schoolId, t.featureKey] })]);

export const automationRules = pgTable("automation_rules", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull(),
  name: text("name").notNull(),
  trigger: text("trigger").notNull(),
  action: text("action").notNull().default("in_app_alert"),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("automation_rules_school_enabled_idx").on(t.schoolId, t.enabled, t.createdAt)]);

export const platformNotices = pgTable("platform_notices", {
  id: serial("id").primaryKey(), title: text("title").notNull(), body: text("body").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(), action: text("action").notNull(), detail: text("detail").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
