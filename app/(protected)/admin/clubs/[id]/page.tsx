"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

interface LoginUser {
  email: string;
  password: string;
  active: boolean;
}

export default function ClubEditPage() {
  const { id } = useParams();

  const [clubData, setClubData] = useState({
    name: "",
    description: "",
    department: "",
    logo: null as File | null,
  });

  const [loginUsers, setLoginUsers] = useState<LoginUser[]>([
    { email: "", password: "", active: true },
  ]);

  useEffect(() => {
    async function fetchClub() {
      const data = {
        name: "Tech Club",
        description: "Focused on AI, Robotics, Coding",
        department: "CSE",
        logo: null,
      };
      setClubData(data);

      setLoginUsers([
        { email: "manager1@club.edu", password: "", active: true },
        { email: "manager2@club.edu", password: "", active: false },
      ]);
    }
    fetchClub();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setClubData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files)
      setClubData((prev) => ({ ...prev, logo: e.target.files![0] }));
  };

  const handleLoginChange = (
    index: number,
    field: "email" | "password" | "active",
    value: string | boolean
  ) => {
    const updated = [...loginUsers];
    if (field === "active") {
      updated[index][field] = value as boolean;
    } else {
      updated[index][field] = value as string;
    }
    setLoginUsers(updated);
  };

  const addLoginUser = () => {
    setLoginUsers([...loginUsers, { email: "", password: "", active: true }]);
  };

  const removeLoginUser = (index: number) => {
    const updated = loginUsers.filter((_, i) => i !== index);
    setLoginUsers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Club Data:", clubData);
    console.log("Assigned Logins:", loginUsers);
  };

  return (
    <div className="ml-0 min-h-screen bg-[#F4EDE5] p-6 space-y-8">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center rounded-xl">
        <h1 className="text-2xl font-bold text-gray-800">Edit Club</h1>
        <p className="text-gray-600">Club ID: {id}</p>
      </header>

      {/* Club Form */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-indigo-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <i className="fas fa-users mr-2"></i> Club Information
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Club Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-1">Club Name</label>
                <input
                  type="text"
                  name="name"
                  value={clubData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Department</label>
                <select
                  name="department"
                  value={clubData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Department</option>
                  <option value="CSE">CSE</option>
                  <option value="EEE">EEE</option>
                  <option value="BBA">BBA</option>
                  <option value="ENG">ENG</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={clubData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Club Logo</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full"
              />
            </div>

            {/* Assign Logins */}
            <div className="border-t pt-6">
              
              <div className="m-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold mb-4">Assign Logins</h3>
                <button
                  type="button"
                  onClick={addLoginUser}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Login
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Password
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Active
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {loginUsers.map((user, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <input
                            type="email"
                            value={user.email}
                            onChange={(e) =>
                              handleLoginChange(index, "email", e.target.value)
                            }
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter email"
                          />
                        </td>

                        <td className="px-4 py-2">
                          <input
                            type="password"
                            value={user.password}
                            onChange={(e) =>
                              handleLoginChange(
                                index,
                                "password",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter password"
                          />
                        </td>

                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={user.active}
                            onChange={(e) =>
                              handleLoginChange(
                                index,
                                "active",
                                e.target.checked
                              )
                            }
                            className="w-5 h-5 mx-auto"
                          />
                        </td>

                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeLoginUser(index)}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
