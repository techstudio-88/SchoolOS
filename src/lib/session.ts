import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { db, schools } from "@/db";
import { PANEL_MAP } from "./catalog";

export const SESSION_COOKIE = "schoolos_session";
export const ADMIN_COOKIE = "schoolos_sa";

export type Session = { role: string; schoolId: number; demo: boolean; name: string };

/** Make sure the demo school exists (used by the "Skip login" flow). */
export async function ensureDemoSchool(): Promise<number> {
  const existing = await db.select().from(schools).where(eq(schools.slug, "greenfield-demo")).limit(1);
  if (existing[0]) return existing[0].id;
  const [row] = await db
    .insert(schools)
    .values({
      name: "Greenfield International School",
      slug: "greenfield-demo",
      ownerName: "Demo Owner",
      ownerEmail: "demo@schoolos.app",
      city: "Bengaluru",
      plan: "pro",
      status: "active",
      studentsCount: 1240,
      isDemo: true,
    })
    .onConflictDoNothing()
    .returning();
  if (row) return row.id;
  const again = await db.select().from(schools).where(eq(schools.slug, "greenfield-demo")).limit(1);
  return again[0].id;
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const s = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as Session;
    if (!PANEL_MAP[s.role] || typeof s.schoolId !== "number") return null;
    return s;
  } catch {
    return null;
  }
}

export function encodeSession(s: Session) {
  return Buffer.from(JSON.stringify(s), "utf8").toString("base64url");
}

/* ---------- Hidden super-admin (platform owner only) ---------- */

function adminKey() {
  return process.env.SUPER_ADMIN_KEY ?? "";
}

export function adminToken() {
  const key = adminKey();
  if (!key) return "";
  return createHash("sha256").update(`schoolos-sa:${key}`).digest("hex");
}

export function checkAdminKey(input: string) {
  const key = adminKey();
  if (!key || !input) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(key).digest();
  return timingSafeEqual(a, b);
}

export async function isSuperAdmin(): Promise<boolean> {
  const token = adminToken();
  if (!token) return false;
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === token;
}
