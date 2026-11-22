import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AdminAuth } from "@/components/auth/AdminAuth";
import { AdminPanel } from "@/components/auth/AdminPanel";
import { isAdmin } from "@/lib/admin";
import { adminExists, cards, storedMaintenance } from "@/lib/admin-store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function Login({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!adminExists()) return <AdminAuth mode="register" />;
  if (!(await isAdmin())) return <AdminAuth mode="login" />;
  return <AdminPanel cards={cards()} maintenance={storedMaintenance() ?? process.env.MAN === "1"} />;
}
