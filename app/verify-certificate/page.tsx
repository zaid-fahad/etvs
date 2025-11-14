"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyCertificatePage() {
  const [certificateId, setCertificateId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!certificateId) {
      setError("Please enter a certificate ID.");
      return;
    }

    router.push(`/verify-certificate/${certificateId}`);
  };

  return (
    <div className=" flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Verify Certificate</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter Certificate ID"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          {error && <p className="text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}
