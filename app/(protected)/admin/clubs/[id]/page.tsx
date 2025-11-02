// (protected)/admin/clubs/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface LoginUser {
  id?: string;
  email: string;
  active: boolean;
}

export default function ClubEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [clubData, setClubData] = useState({
    name: "",
    description: "",
    department: "",
    logo: null as File | null,
  });

  const [loginUsers, setLoginUsers] = useState<LoginUser[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  // Fetch club + managers
  useEffect(() => {
    async function fetchClub() {
      const res = await fetch(`/api/clubs/${id}`);
      const data = await res.json();
      if (data.club) {
        setClubData({
          name: data.club.name,
          description: data.club.description,
          department: data.club.department,
          logo: null,
        });
      }

      // Fetch assigned managers
      const usersRes = await fetch(`/api/clubs/user?club_id=${id}`);
      const usersData = await usersRes.json();
      if (usersData.users) setLoginUsers(usersData.users);
    }
    fetchClub();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setClubData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/clubs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clubData),
    });
    const data = await res.json();
    if (data.club) {
      alert("Club updated successfully");
    } else {
      alert(data.error || "Failed to update club");
    }
  };

  // Add new manager
  const confirmAddLoginUser = async () => {
    if (!newEmail) return;
    const res = await fetch("/api/clubs/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail, name: newEmail.split("@")[0], club_id: id }),
    });
    const data = await res.json();
    if (data.user) {
      setLoginUsers((prev) => [...prev, data.user]);
      setShowModal(false);
      setNewEmail("");
    } else {
      alert(data.error || "Failed to add manager");
    }
  };

  const removeLoginUser = async (userId?: string) => {
    if (!userId) return;
    if (!confirm("Are you sure you want to remove this manager?")) return;

    const res = await fetch("/api/clubs/user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId }),
    });
    const data = await res.json();
    if (data.success) {
      setLoginUsers((prev) => prev.filter((u) => u.id !== userId));
    } else {
      alert(data.error || "Failed to remove manager");
    }
  };

  return (
    <div className="ml-0 min-h-screen bg-[#F4EDE5] p-6 space-y-8">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center rounded-xl">
        <h1 className="text-2xl font-bold text-gray-800">Edit Club</h1>
        <p className="text-gray-600">Club ID: {id}</p>
      </header>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-indigo-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <i className="fas fa-users mr-2"></i> Club Information
          </h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Club details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label>Club Name</label>
                <input name="name" value={clubData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label>Department</label>
                <select name="department" value={clubData.department} onChange={handleChange} className="w-full px-3 py-2 border rounded">
                  <option value="">Select Department</option>
                  <option value="CSE">CSE</option>
                  <option value="EEE">EEE</option>
                  <option value="BBA">BBA</option>
                  <option value="ENG">ENG</option>
                </select>
              </div>
            </div>
            <div>
              <label>Description</label>
              <textarea name="description" value={clubData.description} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
            </div>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded">Save Changes</button>
          </form>

          {/* Assigned managers */}
          <div className="mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Assigned Managers</h3>
              <button onClick={() => setShowModal(true)} className="px-4 py-1 bg-green-600 text-white rounded">+ Add Manager</button>
            </div>
            <div className="mt-3 space-y-2">
              {loginUsers.map((user) => (
                <div key={user.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                  <span>{user.email}</span>
                  <button onClick={() => removeLoginUser(user.id)} className="px-3 py-1 bg-red-600 text-white rounded">Remove</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Manager</h3>
            <input type="email" placeholder="Enter email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full px-4 py-2 border rounded mb-4" />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
              <button onClick={confirmAddLoginUser} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
