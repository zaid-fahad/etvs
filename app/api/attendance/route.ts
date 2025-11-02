// app/api/attendance/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { user_id, event_id, status } = await req.json();
  const supabase = await createClient();

  const { data, error } = await supabase.from("attendance").upsert({ user_id, event_id, status }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ attendance: data });
}
