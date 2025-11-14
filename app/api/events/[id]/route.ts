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
// export async function PATCH(req: Request, { params }: { params: { id: string } }) {
//   const supabase = await createClient();
//   const { id } = await params;

//   try {
//     // parse multipart/form-data
//     const formData = await req.formData();
//     const textX = formData.get("textX") as string | null;
//     const textY = formData.get("textY") as string | null;
//     const fontSize = formData.get("fontSize") as string | null;
//     const fontColor = formData.get("fontColor") as string | null;
//     const qrX = formData.get("qrX") as string | null;
//     const qrY = formData.get("qrY") as string | null;
//     const qrSize = formData.get("qrSize") as string | null;
//     const qrTransparent = formData.get("qrTransparent") === "true";
//     const templateFile = formData.get("template") as File | null;

//     let certificate_template: any = {};

//     // If there's an existing template, preserve settings
//     const { data: existingEvent } = await supabase.from("events").select("certificate_template").eq("id", id).single();
//     if (existingEvent?.certificate_template) certificate_template = existingEvent.certificate_template;

//     if (templateFile) {
//       // Convert file to base64
//       const arrayBuffer = await templateFile.arrayBuffer();
//       const base64 = Buffer.from(arrayBuffer).toString("base64");
//       certificate_template.file = base64;
//       certificate_template.name = templateFile.name;
//     }

//     certificate_template.settings = {
//       textX: textX !== null ? Number(textX) : certificate_template.settings?.textX,
//       textY: textY !== null ? Number(textY) : certificate_template.settings?.textY,
//       fontSize: fontSize !== null ? Number(fontSize) : certificate_template.settings?.fontSize,
//       fontColor: fontColor !== null ? String(fontColor) : certificate_template.settings?.fontColor,
//       qrSize: qrSize !== null ? Number(qrSize) : certificate_template.settings?.qrSize,
//       qrX: qrX !== null ? Number(qrX) : certificate_template.settings?.qrX,
//       qrY: qrY !== null ? Number(qrY) : certificate_template.settings?.qrY,
//       qrTransparent: qrTransparent ?? certificate_template.settings?.qrTransparent ?? false,
//     };

//     const { data, error } = await supabase
//       .from("events")
//       .update({ certificate_template })
//       .eq("id", id)
//       .select()
//       .single();

//     if (error) return NextResponse.json({ error: error.message }, { status: 400 });
//     return NextResponse.json({ event: data });
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message || "Failed to update certificate template" }, { status: 500 });
//   }
// }

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  // Assuming createClient() works and returns a valid Supabase client
  const supabase = await createClient(); 
  const { id } = await params; // params is already destructured above, just use id

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
    // This correctly returns true if the value is "true", and false otherwise (including "false" or null)
    const isQrTransparent = formData.get("qrTransparent") === "true"; 
    const templateFile = formData.get("template") as File | null;

    let certificate_template: any = {};
    let existingSettings: any = {};

    // 1. Fetch existing template *without* .single() for safer initial check
    const { data: existingEvent, error: existingError } = await supabase
      .from("events")
      .select("certificate_template")
      .eq("id", id)
      .limit(1); // Use limit(1) instead of single() for safer existence check

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 404 });
    }

    if (existingEvent && existingEvent.length > 0 && existingEvent[0].certificate_template) {
        certificate_template = existingEvent[0].certificate_template;
        existingSettings = certificate_template.settings || {};
    }


    if (templateFile && templateFile.size > 0) { // Check size for an actual file
      // Convert file to base64
      const arrayBuffer = await templateFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      certificate_template.file = base64;
      certificate_template.name = templateFile.name;
    }

    // 2. Corrected settings update logic, especially for booleans and nulls
    certificate_template.settings = {
      textX: textX !== null ? Number(textX) : existingSettings.textX,
      textY: textY !== null ? Number(textY) : existingSettings.textY,
      fontSize: fontSize !== null ? Number(fontSize) : existingSettings.fontSize,
      fontColor: fontColor !== null ? String(fontColor) : existingSettings.fontColor,
      qrSize: qrSize !== null ? Number(qrSize) : existingSettings.qrSize,
      qrX: qrX !== null ? Number(qrX) : existingSettings.qrX,
      qrY: qrY !== null ? Number(qrY) : existingSettings.qrY,
      // For boolean, explicitly check if the key was present in the form data
      // For simplicity, we use the boolean from isQrTransparent if the field was in the request
      // (The original code determines isQrTransparent based on if "qrTransparent"==="true", which is a form of presence check)
      qrTransparent: formData.has("qrTransparent") ? isQrTransparent : existingSettings.qrTransparent ?? false,
    };

    // 3. Final update *with* .single() to ensure the single updated row is returned
    // console.log("id", id);
    const { data, error } = await supabase
      .from("events")
      .update({ certificate_template })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      // If the final update fails to find the row, the error is likely the .single() issue again
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ event: data });
  } catch (err: any) {
    console.error("Internal Server Error:", err);
    // Catch generic errors like file conversion failure
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
