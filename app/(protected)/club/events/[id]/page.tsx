// //club/events/[id]/page.tsx

// "use client";

// import { useState, useEffect } from "react";
// import { useParams } from "next/navigation";
// import AddAttendeeModal from "@/components/add-attendee-modal";
// import CertificateDesignerModal from "@/components/certificate-designer-modal"; // import the modal

// interface Attendee {
//   id: string;
//   name?: string;
//   student_id?: string;
//   guest_email?: string;
//   attended: boolean;
//   status: "Attended" | "Absent";
// }

// interface Event {
//   id: string;
//   title: string;
//   club_name: string;
//   description: string;
//   date: string;
//   status: "Pending" | "Approved" | "Rejected";
// }

// export default function EventDetailsPage() {
//   const { id } = useParams();
//   const [event, setEvent] = useState<Event | null>(null);
//   const [attendees, setAttendees] = useState<Attendee[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [filterStatus, setFilterStatus] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [processingId, setProcessingId] = useState<string | null>(null);
//   const [certificateTemplate, setCertificateTemplate] = useState<File | null>(null);
//   const [generating, setGenerating] = useState(false);

//   // New: certificate design modal state
//   const [showDesigner, setShowDesigner] = useState(false);
//   const [certificateSettings, setCertificateSettings] = useState<{ x: number; y: number; fontSize: number } | null>(null);

//   const fetchEvent = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/events/${id}`, { credentials: "include" });
//       const data = await res.json();
//       setEvent(data.event);
//     } catch (err) {
//       console.error("Failed to fetch event:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchAttendees = async () => {
//     try {
//       const res = await fetch(`/api/event-attendance/${id}`);
//       const data = await res.json();
//       const normalized = (data.attendees || []).map((att: Attendee) => ({
//         ...att,
//         attended: att.attended || false,
//       }));
//       setAttendees(normalized);
//     } catch (err) {
//       console.error("Failed to fetch attendees:", err);
//     }
//   };

//   useEffect(() => {
//     fetchEvent();
//     fetchAttendees();
//   }, [id]);

//   const getStatusBadge = (att: Attendee) => {
//     if (att.attended || att.status === "Attended") return "bg-green-100 text-green-700";
//     if (!att.attended || att.status === "Absent") return "bg-red-100 text-red-700";
//     return "";
//   };

//   const filteredAttendees = attendees.filter((att) => {
//     const status = att.attended ? "Attended" : att.status || "Absent";
//     const matchesStatus = filterStatus ? status === filterStatus : true;
//     const matchesSearch = searchQuery
//       ? (att.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
//         (att.student_id || "").includes(searchQuery) ||
//         (att.guest_email || "").toLowerCase().includes(searchQuery.toLowerCase())
//       : true;
//     return matchesStatus && matchesSearch;
//   });

//   const updateAttendance = async (attendeeId: string, attended: boolean) => {
//     setProcessingId(attendeeId);
//     try {
//       const res = await fetch(`/api/event-attendance/${id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ attendee_id: attendeeId, attended }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed to update attendance");
//       fetchAttendees();
//     } catch (err: any) {
//       console.error(err);
//     } finally {
//       setProcessingId(null);
//     }
//   };

//   const handleGenerateCertificates = async () => {
//     if (!certificateTemplate) {
//       alert("Please upload a certificate template first.");
//       return;
//     }
//     if (!certificateSettings) {
//       alert("Please set the certificate text position using the designer first.");
//       return;
//     }
//     setGenerating(true);
//     try {
//       const formData = new FormData();
//       formData.append("template", certificateTemplate);
//       formData.append("event_id", String(id));
//       formData.append("x", String(certificateSettings.x));
//       formData.append("y", String(certificateSettings.y));
//       formData.append("fontSize", String(certificateSettings.fontSize));

//       const res = await fetch(`/api/certificates/generate`, {
//         method: "POST",
//         body: formData,
//       });
//       const data = await res.blob();

//       // Download batch certificates
//       const url = window.URL.createObjectURL(data);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = `certificates_event_${id}.zip`;
//       link.click();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to generate certificates");
//     } finally {
//       setGenerating(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-[#F4EDE5]">
//         <p className="text-gray-700 text-lg">Loading event...</p>
//       </div>
//     );
//   }

//   if (!event) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-[#F4EDE5]">
//         <p className="text-gray-700 text-lg">Event not found.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="ml-0 min-h-screen bg-[#F4EDE5] p-6 space-y-6">
//       {showAddModal && (
//         <AddAttendeeModal
//           eventId={id as string}
//           onClose={() => setShowAddModal(false)}
//           onRefresh={fetchAttendees}
//         />
//       )}

//       {showDesigner && certificateTemplate && (
//   <CertificateDesignerModal
//     template={certificateTemplate}
//     initialSettings={certificateSettings}
//     onClose={() => setShowDesigner(false)}
//     onSave={async (settings) => {
//       try {
//         // Save to API
//         const formData = new FormData();
//         formData.append("x", String(settings.x));
//         formData.append("y", String(settings.y));
//         formData.append("fontSize", String(settings.fontSize));
//         formData.append("template", certificateTemplate); // include template file

//         const res = await fetch(`/api/events/${id}`, {
//           method: "PATCH",
//           body: formData,
//         });

//         if (!res.ok) throw new Error("Failed to save certificate template/settings");

//         const data = await res.json();
//         console.log("Certificate settings saved:", data.event);

//         // Update local state
//         setCertificateSettings(settings);
//         setShowDesigner(false);
//       } catch (err) {
//         console.error(err);
//         alert("Failed to save certificate settings. Please try again.");
//       }
//     }}
//   />
// )}

//       {/* Header */}
//       <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center rounded-xl">
//         <h1 className="text-2xl font-bold text-gray-800">{event.title}</h1>
//         <p className="text-gray-600">Event ID: {id}</p>
//       </header>

//       {/* Event Info + Certificate Section */}
//       <div className="flex flex-col md:flex-row gap-6">
//         {/* Event Info */}
//         <div className="bg-white rounded-xl shadow-md flex-1">
//           <div className="bg-indigo-700 px-6 py-4 text-white font-semibold flex items-center rounded-t-xl">
//             <i className="fas fa-calendar-check mr-2"></i> Event Information
//           </div>
//           <div className="p-6 space-y-2">
//             <p><strong>Title:</strong> {event.title}</p>
//             <p><strong>Date:</strong> {event.date}</p>
//             <p><strong>Details:</strong> {event.description}</p>
//           </div>
//         </div>

//         {/* Certificate Management */}
//         <div className="bg-white rounded-xl shadow-md flex-1">
//           <div className="bg-indigo-700 px-6 py-4 text-white font-semibold flex items-center rounded-t-xl">
//             <i className="fas fa-certificate mr-2"></i> Certificates
//           </div>
//           <div className="p-6 space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Upload Certificate Template</label>
//               <input
//                 type="file"
//                 accept=".pdf,.png,.jpg"
//                 onChange={(e) => setCertificateTemplate(e.target.files?.[0] || null)}
//                 className="w-full px-3 py-2 border rounded-md"
//               />
//             </div>

//             <div className="flex gap-2">
//               <button
//                 onClick={() => setShowDesigner(true)}
//                 disabled={!certificateTemplate}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//               >
//                 Design Certificate
//               </button>

//               <button
//                 onClick={handleGenerateCertificates}
//                 disabled={generating || !certificateTemplate || !certificateSettings}
//                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
//               >
//                 {generating ? "Generating..." : "Generate & Download Certificates"}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Attendees Table */}
//       <div className="bg-white rounded-xl shadow-md overflow-x-auto">
//         <div className="bg-indigo-700 px-6 py-4 text-white font-semibold flex items-center justify-between rounded-t-xl">
//           <div className="flex items-center gap-2">
//             <i className="fas fa-users mr-2"></i> Attendees
//           </div>
//           <button
//             onClick={() => setShowAddModal(true)}
//             className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//           >
//             <i className="fas fa-user-plus mr-1"></i> Add Attendee
//           </button>
//         </div>

//         {/* Filters */}
//         <div className="p-6 flex flex-col md:flex-row gap-4 items-center">
//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//             className="w-full md:w-1/4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
//           >
//             <option value="">All Status</option>
//             <option value="Attended">Attended</option>
//             <option value="Absent">Absent</option>
//           </select>
//           <input
//             type="text"
//             placeholder="Search by name, ID, or email..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
//           />
//         </div>

//         {/* Table */}
//         <div className="p-6 overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">#</th>
//                 <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Name</th>
//                 <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Student ID / Email</th>
//                 <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                 <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Action</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredAttendees.length === 0 ? (
//                 <tr>
//                   <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
//                     No attendees found.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredAttendees.map((att, idx) => (
//                   <tr key={att.id} className="hover:bg-gray-50">
//                     <td className="px-4 py-2">{idx + 1}</td>
//                     <td className="px-4 py-2">{att.name || "Guest"}</td>
//                     <td className="px-4 py-2">{att.student_id || att.guest_email || "-"}</td>
//                     <td className="px-4 py-2">
//                       <span className={`px-2 py-1 rounded ${getStatusBadge(att)}`}>
//                         {att.attended ? "Attended" : att.status || "Absent"}
//                       </span>
//                     </td>
//                     <td className="px-4 py-2 flex gap-2">
//                       {!att.attended ? (
//                         <button
//                           onClick={() => updateAttendance(att.id, true)}
//                           disabled={processingId === att.id}
//                           className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                         >
//                           {processingId === att.id ? "Processing..." : "Mark Attended"}
//                         </button>
//                       ) : (
//                         <button
//                           onClick={() => updateAttendance(att.id, false)}
//                           disabled={processingId === att.id}
//                           className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
//                         >
//                           {processingId === att.id ? "Processing..." : "Unmark"}
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import AddAttendeeModal from "@/components/add-attendee-modal";
import CertificateDesignerModal from "@/components/certificate-designer-modal";

interface Attendee {
  id: string;
  name?: string;
  student_id?: string;
  guest_email?: string;
  attended: boolean;
  status: "Attended" | "Absent";
}

interface Event {
  id: string;
  title: string;
  club_name: string;
  description: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
  certificate_template?: any; // include certificate_template from API
}

export default function EventDetailsPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [certificateTemplate, setCertificateTemplate] = useState<File | null>(
    null
  );
  const [generating, setGenerating] = useState(false);

  // Certificate designer state
  const [showDesigner, setShowDesigner] = useState(false);
  const [certificateSettings, setCertificateSettings] = useState<{
    textX: number;
    textY: number;
    fontSize: number;
    fontColor: string;
    qrX: number;
    qrY: number;
    qrSize: number;
    qrTransparent: boolean;
  } | null>(null);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${id}`, { credentials: "include" });
      const data = await res.json();
      setEvent(data.event);

      // If certificate_template exists, set template/settings
      if (data.event.certificate_template) {
        const { file, settings } = data.event.certificate_template;
        if (file) {
          const blob = b64toBlob(file);
          const templateFile = new File(
            [blob],
            data.event.certificate_template.name || "template.png"
          );
          setCertificateTemplate(templateFile);
        }
        if (settings) setCertificateSettings(settings);
      }
    } catch (err) {
      console.error("Failed to fetch event:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendees = async () => {
    try {
      const res = await fetch(`/api/event-attendance/${id}`);
      const data = await res.json();
      const normalized = (data.attendees || []).map((att: Attendee) => ({
        ...att,
        attended: att.attended || false,
      }));
      setAttendees(normalized);
    } catch (err) {
      console.error("Failed to fetch attendees:", err);
    }
  };

  useEffect(() => {
    fetchEvent();
    fetchAttendees();
  }, [id]);

  const getStatusBadge = (att: Attendee) => {
    if (att.attended || att.status === "Attended")
      return "bg-green-100 text-green-700";
    if (!att.attended || att.status === "Absent")
      return "bg-red-100 text-red-700";
    return "";
  };

  const filteredAttendees = attendees.filter((att) => {
    const status = att.attended ? "Attended" : att.status || "Absent";
    const matchesStatus = filterStatus ? status === filterStatus : true;
    const matchesSearch = searchQuery
      ? (att.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (att.student_id || "").includes(searchQuery) ||
        (att.guest_email || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      : true;
    return matchesStatus && matchesSearch;
  });

  const updateAttendance = async (attendeeId: string, attended: boolean) => {
    setProcessingId(attendeeId);
    try {
      const res = await fetch(`/api/event-attendance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendee_id: attendeeId, attended }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update attendance");
      fetchAttendees();
    } catch (err: any) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleGenerateCertificates = async () => {
    if (!certificateTemplate) {
      alert("Please upload a certificate template first.");
      return;
    }
    if (!certificateSettings) {
      alert(
        "Please set the certificate text position using the designer first."
      );
      return;
    }
    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append("template", certificateTemplate);
      formData.append("event_id", String(id));
      formData.append("x", String(certificateSettings.textX));
      formData.append("y", String(certificateSettings.textY));
      formData.append("fontColor", certificateSettings.fontColor);
      formData.append("fontSize", String(certificateSettings.fontSize));
      formData.append("qrSize", String(certificateSettings.qrSize));
      if (certificateSettings.qrX)
        formData.append("qrX", String(certificateSettings.qrX));
      if (certificateSettings.qrY)
        formData.append("qrY", String(certificateSettings.qrY));
      formData.append(
        "qrTransparent",
        certificateSettings.qrTransparent ? "true" : "false"
      );

      const res = await fetch(`/api/certificates/generate`, {
        method: "POST",
        body: formData,
      });
      const data = await res.blob();

      const url = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificates_event_${id}.zip`;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Failed to generate certificates");
    } finally {
      setGenerating(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F4EDE5]">
        Loading...
      </div>
    );
  if (!event)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F4EDE5]">
        Event not found
      </div>
    );

  return (
    <div className="ml-0 min-h-screen bg-[#F4EDE5] p-6 space-y-6">
      {showAddModal && (
        <AddAttendeeModal
          eventId={id as string}
          onClose={() => setShowAddModal(false)}
          onRefresh={fetchAttendees}
        />
      )}
      {showDesigner && certificateTemplate && (
        <CertificateDesignerModal
          template={certificateTemplate}
          initialSettings={certificateSettings ?? undefined}
          onClose={() => setShowDesigner(false)}
          onSave={async (settings) => {
            try {
              const formData = new FormData();
              formData.append("textX", String(settings.textX));
              formData.append("textY", String(settings.textY));
              formData.append("fontSize", String(settings.fontSize));
              formData.append("fontColor", settings.fontColor);
              formData.append("qrSize", String(settings.qrSize));
              formData.append("qrX", String(settings.qrX ?? 0));
              formData.append("qrY", String(settings.qrY ?? 0));
              formData.append(
                "qrTransparent",
                settings.qrTransparent ? "true" : "false"
              );
              formData.append("template", certificateTemplate);

              const res = await fetch(`/api/events/${id}`, {
                method: "PATCH",
                body: formData,
              });
              if (!res.ok)
                throw new Error("Failed to save certificate settings");
              const data = await res.json();

              console.log("Saved certificate settings:", data.event);
              setCertificateSettings(settings);
              setShowDesigner(false);
            } catch (err) {
              console.error(err);
              alert("Failed to save certificate settings");
            }
          }}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center rounded-xl">
        <h1 className="text-2xl font-bold text-gray-800">{event.title}</h1>
        <p className="text-gray-600">Event ID: {id}</p>
      </header>

      {/* Event Info + Certificate */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Event Info */}
        <div className="bg-white rounded-xl shadow-md flex-1">
          <div className="bg-indigo-700 px-6 py-4 text-white font-semibold flex items-center rounded-t-xl">
            Event Information
          </div>
          <div className="p-6 space-y-2">
            <p>
              <strong>Title:</strong> {event.title}
            </p>
            <p>
              <strong>Date:</strong> {event.date}
            </p>
            <p>
              <strong>Details:</strong> {event.description}
            </p>
          </div>
        </div>

        {/* Certificate Management */}
        <div className="bg-white rounded-xl shadow-md flex-1">
          <div className="bg-indigo-700 px-6 py-4 text-white font-semibold flex items-center rounded-t-xl">
            Certificates
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Certificate Template
              </label>
              <input
                type="file"
                accept=".pdf,.png,.jpg"
                onChange={(e) =>
                  setCertificateTemplate(e.target.files?.[0] || null)
                }
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowDesigner(true)}
                disabled={!certificateTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Design Certificate
              </button>
              <button
                onClick={handleGenerateCertificates}
                disabled={
                  generating || !certificateTemplate || !certificateSettings
                }
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {generating
                  ? "Generating..."
                  : "Generate & Download Certificates"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Attendees Table */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <div className="bg-indigo-700 px-6 py-4 text-white font-semibold flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-2">
            <i className="fas fa-users mr-2"></i> Attendees
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <i className="fas fa-user-plus mr-1"></i> Add Attendee
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 flex flex-col md:flex-row gap-4 items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-1/4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="Attended">Attended</option>
            <option value="Absent">Absent</option>
          </select>
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Table */}
        <div className="p-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Student ID / Email
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendees.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    No attendees found.
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((att, idx) => (
                  <tr key={att.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2">{att.name || "Guest"}</td>
                    <td className="px-4 py-2">
                      {att.student_id || att.guest_email || "-"}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded ${getStatusBadge(att)}`}
                      >
                        {att.attended ? "Attended" : att.status || "Absent"}
                      </span>
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      {!att.attended ? (
                        <button
                          onClick={() => updateAttendance(att.id, true)}
                          disabled={processingId === att.id}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {processingId === att.id
                            ? "Processing..."
                            : "Mark Attended"}
                        </button>
                      ) : (
                        <button
                          onClick={() => updateAttendance(att.id, false)}
                          disabled={processingId === att.id}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          {processingId === att.id ? "Processing..." : "Unmark"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Utility to convert base64 to blob
function b64toBlob(b64Data: string, contentType = "image/png") {
  const sliceSize = 512;
  const byteCharacters = atob(b64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: contentType });
}
