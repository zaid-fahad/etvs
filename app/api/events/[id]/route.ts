// app/api/events/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ event: data });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;
  const updates = await req.json();

  const { data, error } = await supabase.from("events").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ event: data });
}

// NEW: PATCH method to update certificate template/settings
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = await params;

  try {
    // parse multipart/form-data
    const formData = await req.formData();
    const textX = formData.get("textX") as string | null;
    const textY = formData.get("textY") as string | null;
    const fontSize = formData.get("fontSize") as string | null;
    const fontColor = formData.get("fontColor") as string | null;
    const qrX = formData.get("qrX") as string | null;
    const qrY = formData.get("qrY") as string | null;
    const qrSize = formData.get("qrSize") as string | null;
    const qrTransparent = formData.get("qrTransparent") === "true";
    const templateFile = formData.get("template") as File | null;

    let certificate_template: any = {};

    // If there's an existing template, preserve settings
    const { data: existingEvent } = await supabase.from("events").select("certificate_template").eq("id", id).single();
    if (existingEvent?.certificate_template) certificate_template = existingEvent.certificate_template;

    if (templateFile) {
      // Convert file to base64
      const arrayBuffer = await templateFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      certificate_template.file = base64;
      certificate_template.name = templateFile.name;
    }

    certificate_template.settings = {
      textX: textX !== null ? Number(textX) : certificate_template.settings?.textX,
      textY: textY !== null ? Number(textY) : certificate_template.settings?.textY,
      fontSize: fontSize !== null ? Number(fontSize) : certificate_template.settings?.fontSize,
      fontColor: fontColor !== null ? String(fontColor) : certificate_template.settings?.fontColor,
      qrSize: qrSize !== null ? Number(qrSize) : certificate_template.settings?.qrSize,
      qrX: qrX !== null ? Number(qrX) : certificate_template.settings?.qrX,
      qrY: qrY !== null ? Number(qrY) : certificate_template.settings?.qrY,
      qrTransparent: qrTransparent ?? certificate_template.settings?.qrTransparent ?? false,
    };

    const { data, error } = await supabase
      .from("events")
      .update({ certificate_template })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ event: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update certificate template" }, { status: 500 });
  }
}


export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = await params;

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
