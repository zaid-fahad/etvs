"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";

interface Attendee {
  id: string;
  name: string;
  student_id?: string;
  guest_email?: string;
  attended: boolean;
}

interface AttendanceTableModalProps {
  eventId: string;
  onClose: () => void;
}

export default function AttendanceTableModal({ eventId, onClose }: AttendanceTableModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const fetchAttendees = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/event-attendance/${eventId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAttendees(data.attendees);
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = async (attendeeId: string, current: boolean) => {
    try {
      const res = await fetch(`/api/event-attendance/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendee_id: attendeeId, attended: !current }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAttendees((prev) =>
        prev.map((a) => (a.id === attendeeId ? { ...a, attended: !current } : a))
      );
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, []);

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-3xl rounded-2xl bg-white shadow-xl p-6 space-y-4">
          <Dialog.Title className="text-lg font-semibold text-gray-800">
            Event Attendance
          </Dialog.Title>

          {loading ? (
            <p className="text-center text-gray-600">Loading attendees...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">#</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Student ID / Email</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Attended</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((a, i) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{i + 1}</td>
                      <td className="px-4 py-2">{a.name || "Guest"}</td>
                      <td className="px-4 py-2">{a.student_id || a.guest_email || "-"}</td>
                      <td className="px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={a.attended}
                          onChange={() => toggleAttendance(a.id, a.attended)}
                          className="w-5 h-5 accent-indigo-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {message && <p className="text-sm text-center text-red-600">{message}</p>}

          <div className="flex justify-end pt-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
