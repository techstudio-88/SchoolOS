CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"detail" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "feature_settings" (
	"school_id" integer NOT NULL,
	"feature_key" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	CONSTRAINT "feature_settings_school_id_feature_key_pk" PRIMARY KEY("school_id","feature_key")
);

CREATE TABLE "platform_notices" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "records" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"module_id" text NOT NULL,
	"feature_key" text NOT NULL,
	"title" text NOT NULL,
	"person" text DEFAULT '' NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"due_date" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "schools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"owner_name" text DEFAULT 'School Owner' NOT NULL,
	"owner_email" text DEFAULT '' NOT NULL,
	"city" text DEFAULT '' NOT NULL,
	"plan" text DEFAULT 'trial' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"students_count" integer DEFAULT 0 NOT NULL,
	"is_demo" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "schools_slug_unique" UNIQUE("slug")
);

CREATE INDEX "records_school_feature_idx" ON "records" USING btree ("school_id","feature_key");
CREATE INDEX "records_school_module_idx" ON "records" USING btree ("school_id","module_id");

-- SECURITY: Supabase exposes the "public" schema through its REST API.
-- SchoolOS only talks to Postgres directly from the server (role "postgres" bypasses RLS),
-- so we enable RLS with NO policies => the public anon/authenticated API keys can read nothing.
ALTER TABLE "schools" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "feature_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "platform_notices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_log" ENABLE ROW LEVEL SECURITY;
