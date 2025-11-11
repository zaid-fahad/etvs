"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";

interface AddAttendeeModalProps {
  eventId: string;
  onClose: () => void;
  onRefresh?: () => void;
  existingAttendees?: { student_id?: string; guest_email?: string }[];
}

export default function AddAttendeeModal({ eventId, onClose, onRefresh, existingAttendees = [] }: AddAttendeeModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Name validation
    if (!name.trim()) {
      setMessage("❌ Name is required");
      setLoading(false);
      return;
    }

    // Student vs Guest validation
    if (isGuest) {
      if (!guestEmail.trim()) {
        setMessage("❌ Guest email is required");
        setLoading(false);
        return;
      }
      if (!validateEmail(guestEmail.trim())) {
        setMessage("❌ Invalid email format");
        setLoading(false);
        return;
      }
      // Duplicate check
      if (existingAttendees.some((att) => att.guest_email?.toLowerCase() === guestEmail.trim().toLowerCase())) {
        setMessage("❌ Guest already added");
        setLoading(false);
        return;
      }
    } else {
      if (!studentId.trim()) {
        setMessage("❌ Student ID is required");
        setLoading(false);
        return;
      }
      if (existingAttendees.some((att) => att.student_id === studentId.trim())) {
        setMessage("❌ Student already added");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch(`/api/event-attendance/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          student_id: isGuest ? null : studentId.trim(),
          guest_email: isGuest ? guestEmail.trim() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add attendee");

      setMessage("✅ Attendee added successfully!");
      setName("");
      setStudentId("");
      setGuestEmail("");
      onRefresh?.();
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6 space-y-4">
          <Dialog.Title className="text-lg font-semibold text-gray-800">Add Attendee</Dialog.Title>

          {/* Switcher */}
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isGuest}
                onChange={() => setIsGuest(!isGuest)}
                className="w-5 h-5 accent-indigo-600"
              />
              <span className="text-sm text-gray-700">Guest Attendee?</span>
            </label>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Enter full name"
              />
            </div>

            {!isGuest && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Enter student ID"
                />
              </div>
            )}

            {isGuest && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guest Email</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Enter guest email"
                />
              </div>
            )}

            {message && (
              <p className={`text-sm text-center ${message.startsWith("❌") ? "text-red-600" : "text-green-600"}`}>
                {message}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add"}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
