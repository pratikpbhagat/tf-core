import { NextResponse } from "next/server";

import { runDeadlineReminders } from "@/lib/notifications/deadline-reminders";

// Vercel Cron sends GET requests by default. Configure the schedule in
// vercel.json and set CRON_SECRET so this route rejects anyone else calling
// it — Vercel automatically sends it as a bearer token on scheduled
// invocations.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runDeadlineReminders();
  return NextResponse.json(result);
}
