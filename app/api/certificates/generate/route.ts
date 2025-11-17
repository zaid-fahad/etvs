import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import JSZip from "jszip";
import { generateCertificatePDF } from "@/lib/certificates/pdfGenerator";

export async function POST(req: Request) {
  try {
    const { event_id, attendees } = await req.json();

    if (!event_id)
      return NextResponse.json({ error: "event_id missing" }, { status: 400 });

    const supabase = await createClient();

    // Fetch event template
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("certificate_template")
      .eq("id", event_id)
      .single();

    if (eventError || !event?.certificate_template)
      return NextResponse.json(
        { error: "Certificate template not found" },
        { status: 404 }
      );

    // Fetch attendees
    let query = supabase
      .from("event_attendance")
      .select("*")
      .eq("event_id", event_id);

    if (attendees?.length) query = query.in("id", attendees);

    const { data: list, error: attErr } = await query;
    if (attErr) throw attErr;

    const zip = new JSZip();

    for (const at of list) {
      const pdf = await generateCertificatePDF({
        attendee: at,
        template: event.certificate_template,
      });

      const filename = `${at.name ?? at.student_id ?? at.guest_email}.pdf`;
      zip.file(filename, pdf);
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=certificates.zip",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to generate certificates" },
      { status: 500 }
    );
  }
}
