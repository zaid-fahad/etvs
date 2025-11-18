import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import JSZip from "jszip";
import { generateCertificatePDF } from "@/lib/certificates/pdfGenerator";

export async function POST(req: Request) {
  try {
    const { event_id } = await req.json();

    if (!event_id)
      return NextResponse.json({ error: "event_id missing" }, { status: 400 });

    const supabase = await createClient();

    // Fetch template
    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("certificate_template, title")
      .eq("id", event_id)
      .single();

    if (eventErr || !event?.certificate_template)
      return NextResponse.json(
        { error: "Certificate template not found" },
        { status: 404 }
      );

    // Fetch attended users
    const { data: attendees, error: attErr } = await supabase
      .from("event_attendance")
      .select("*")
      .eq("event_id", event_id)
      .eq("attended", true);

    if (attErr) throw attErr;

    const zip = new JSZip();

    for (const at of attendees) {
      const pdf = await generateCertificatePDF({
        attendee: at,
        template: event.certificate_template,
      });

      const filename = `${at.name??"undefined"}_${at.student_id ?? at.guest_email}_${event?.title}_event_certificates.pdf`;
      zip.file(filename, pdf);
    }

    const buffer = await zip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=batch_certificates.zip",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Batch generation failed" },
      { status: 500 }
    );
  }
}
