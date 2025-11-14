"use client";

import { useState, useEffect, useCallback, use } from "react";
import { notFound } from "next/navigation";

interface Attendance {
  id: string;
  event_id: string;
  event_name?: string; 
  club_name?: string; 
  student_id?: string;
  guest_email?: string;
  attended: boolean;
  name?: string;
  certificate_url?: string;
}

/**
 * Client-side data fetching utility.
 * @param {string} id - The certificate ID.
 * @returns {Promise<Attendance | null>}
 */
async function fetchAttendance(id: string): Promise<Attendance | null> {
  // Using 'no-store' ensures fresh verification status every time the component loads.
  const res = await fetch(`/api/verify-certificate/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }
  
  if (!res.ok) {
    console.error(`Failed to fetch attendance: Status ${res.status}`);
    return null;
  }

  try {
    const data = await res.json();
    // The API now returns the flattened object containing event_name and club_name
    return data.attendance || null; 
  } catch (e) {
    console.error("Failed to parse attendance JSON:", e);
    return null;
  }
}

/**
 * Renders the certificate verification result page.
 * Refactored to use standard React hooks (useState, useEffect) to prevent infinite loops.
 * @param {{ params: { id: string } }} - The route parameters.
 */
export default function VerifyCertificateResult({ params }: { params: { id: string } }) {
  // Use undefined for initial state, null for fetch error/not found, and Attendance for data
  const [attendance, setAttendance] = useState<Attendance | null | undefined>(undefined); 
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the fetching function so it's stable across renders
  const loadAttendance = useCallback(async () => {
    setIsLoading(true);
    // Use params.id directly
    const data = await fetchAttendance(params.id); 
    setAttendance(data);
    setIsLoading(false);
  }, [params.id]); // Use params.id in dependency array

  useEffect(() => {
    // Run the fetch function only once when resolvedParams.id changes
    loadAttendance();
  }, [loadAttendance]); 

  // Handle Loading State
  if (isLoading || attendance === undefined) {
    return (
      <div className="min-h-10 flex items-center justify-center bg-slate-50 p-6">
        <div className="flex items-center space-x-3 bg-white rounded-2xl shadow-xl p-8">
          <svg className="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xl font-semibold text-gray-700">Verifying Certificate...</span>
        </div>
      </div>
    );
  }

  // Handle Not Found/Error State
  if (!attendance) {
    return (
      <div className="flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-lg text-center border-t-4 border-red-500">
          <h1 className="text-3xl font-extrabold text-red-600 mb-4">Verification Failed</h1>
          <p className="text-gray-600">The certificate ID does not exist, is invalid, or could not be found.</p>
        </div>
      </div>
    );
  }

  // Determine the display name
  const displayName = attendance.name || attendance.student_id || attendance.guest_email || "N/A";
  // Determine the event name
  const eventNameDisplay = attendance.event_name || attendance.event_id;
  // Determine the club name
  const clubNameDisplay = attendance.club_name || "N/A";

  const StatusDisplay = attendance.attended ? (
    <div className="p-4 rounded-xl shadow-lg bg-green-50 text-green-700 border border-green-200">
      <p className="font-extrabold text-2xl flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        VALID CERTIFICATE
      </p>
      <p className="text-sm mt-1">This certificate is verified and authorized by the organization.</p>
    </div>
  ) : (
    <div className="p-4 rounded-xl shadow-lg bg-red-50 text-red-700 border border-red-200">
      <p className="font-extrabold text-2xl flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        INVALID / ABSENT
      </p>
      <p className="text-sm mt-1">The recipient was marked as absent or the certificate identifier is invalid.</p>
    </div>
  );


  return (
    <div className="flex items-center justify-center bg-slate-50 p-6 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg text-center transition duration-300 hover:shadow-3xl">
        <div className="text-center mb-6">
            <h1 className="text-4xl font-extrabold text-gray-900">
                Official Verification
            </h1>
            <p className="text-gray-500 mt-2">Digital Certificate Authenticity Check</p>
        </div>
        
        {/* Data Container */}
        <div className="space-y-4 mb-6 p-6 border border-gray-100 rounded-xl bg-gray-50 shadow-inner text-left">
          
          {/* Recipient */}
          <div className="flex justify-between items-center border-b pb-2">
            <strong className="font-semibold text-gray-700">Recipient:</strong> 
            <span className="font-medium text-indigo-700 break-words ml-2 text-lg">{displayName}</span>
          </div>
          
          {/* Organization */}
          <div className="flex justify-between items-center border-b pb-2">
            <strong className="font-semibold text-gray-700">Organization:</strong> 
            <span className="font-medium text-gray-800 break-words ml-2">{clubNameDisplay}</span>
          </div>

          {/* Event Name */}
          <div className="flex justify-between items-center border-b pb-2">
            <strong className="font-semibold text-gray-700">Event Name:</strong> 
            <span className="font-medium text-gray-800 break-words ml-2">{eventNameDisplay}</span>
          </div>
          
          {/* Certificate ID */}
          <div className="flex justify-between items-center pt-2">
            <strong className="font-semibold text-gray-700">Certificate ID:</strong> 
            <span className="font-mono text-sm text-gray-600 break-all ml-2">{attendance.id}</span>
          </div>
          
        </div>

        {/* Status Block */}
        {StatusDisplay}

        {/* Certificate Download Link */}
        {attendance.certificate_url && attendance.attended && (
          <a
            href={attendance.certificate_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 w-full inline-flex items-center justify-center 
                       bg-indigo-600 text-white px-6 py-3 rounded-xl 
                       hover:bg-indigo-700 transition duration-300 shadow-lg 
                       transform hover:scale-[1.02] font-bold text-lg 
                       focus:ring-4 focus:ring-indigo-300 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H4a2 2 0 01-2-2v-8a2 2 0 012-2h4M7 9V5a2 2 0 012-2h6a2 2 0 012 2v4"></path>
            </svg>
            Download Verified Certificate
          </a>
        )}
      </div>
    </div>
  );
}