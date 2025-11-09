// app/api/event-attendance/[id]/route.tsx
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET all attendees for an event
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from("event_attendance")
    .select("id, attended, certificate_url, user:profiles(id,name,email,student_id)")
    .eq("event_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const attendees = data.map((att: any) => ({
    id: att.id,
    name: att.user.name,
    email: att.user.email,
    studentId: att.user.student_id,
    attended: att.attended,
    certificate_url: att.certificate_url,
  }));

  return NextResponse.json({ attendees });
}
