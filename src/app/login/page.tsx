import type { Metadata } from "next";
import { LoginView } from "./LoginView";

export const metadata: Metadata = { title: "Sign in — SchoolOS" };

export default function LoginPage() {
  return <LoginView />;
}
