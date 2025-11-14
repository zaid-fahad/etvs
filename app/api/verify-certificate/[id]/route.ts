import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = await params;

  try {
    // Select all fields from event_attendance ('*')
    // AND select fields from the nested 'events' table, which in turn selects the 'name' 
    // from the linked 'clubs' table.
    // Structure: event_attendance -> events (name, club:clubs(name))
    const { data: attendanceData, error } = await supabase
      .from("event_attendance")
      .select("*, event:events(title, club:clubs(name))") 
      .eq("id", id)
      .single();

    if (error) {
      // If .single() fails (e.g., ID not found) or there's a database error
      console.error("Supabase Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    
    // Extract event and club names from the nested response structure
    const eventName = attendanceData.event?.title || "Unknown Event";
    // Nested extraction: attendanceData.event.club.name
    const clubName = attendanceData.event?.club?.name || "Unknown Club/Organization";
    
    // Create the final response object, copying all attendance fields and adding the 
    // flattened names. We remove the nested 'event' object before sending to the client.
    const attendance = {
      ...attendanceData,
      event_name: eventName,
      club_name: clubName, // <-- NEW FIELD ADDED
      event: undefined 
    };
    
    return NextResponse.json({ attendance });
  } catch (err: any) {
    console.error("Internal Server Error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to fetch attendance" }, { status: 500 });
  }
}