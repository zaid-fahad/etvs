// app/api/event-attendance/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ✅ GET: Fetch all attendees for a specific event
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from("event_attendance")
    .select("*")
    .eq("event_id", id)
    .order("created_at", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ attendees: data });
}

// ✅ POST: Add new attendee (student or guest)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;
  const { name, student_id, guest_email } = await req.json();

  if ((!student_id && !guest_email) || (student_id && guest_email)) {
    return NextResponse.json(
      { error: "Provide either student_id OR guest_email (not both)" },
      { status: 400 }
    );
  }

  // Check if attendee already exists
  const { data: existing, error: checkError } = await supabase
    .from("event_attendance")
    .select("*")
    .eq("event_id", id)
    .or(
      student_id
        ? `student_id.eq.${student_id}`
        : `guest_email.eq.${guest_email}`
    )
    .limit(1)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    return NextResponse.json({ error: checkError.message }, { status: 400 });
  }

  if (existing) {
    return NextResponse.json(
      { error: "Attendee already registered for this event" },
      { status: 409 }
    );
  }

  // Insert new attendee
  const { data, error } = await supabase
    .from("event_attendance")
    .insert({
      event_id: id,
      name,
      student_id: student_id || null,
      guest_email: guest_email || null,
      attended: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ attendee: data });
}


// ✅ PATCH: Update attendance status
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;
  const { attendee_id, attended } = await req.json();

  if (!attendee_id)
    return NextResponse.json({ error: "attendee_id is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("event_attendance")
    .update({ attended })
    .eq("id", attendee_id)
    .eq("event_id", id)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ attendee: data });
}

// ✅ DELETE: Remove attendee
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;
  const { attendee_id } = await req.json();

  if (!attendee_id)
    return NextResponse.json({ error: "attendee_id is required" }, { status: 400 });

  const { error } = await supabase
    .from("event_attendance")
    .delete()
    .eq("id", attendee_id)
    .eq("event_id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ message: "Attendee removed successfully" });
}
