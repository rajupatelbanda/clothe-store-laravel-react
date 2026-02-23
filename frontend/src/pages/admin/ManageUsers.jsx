import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../utils/api";
import { toast } from "react-hot-toast";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/users?admin=1&page=${currentPage}`);
      if (response.data && response.data.data) {
        setUsers(response.data.data);
        setTotalPages(response.data.last_page);
      } else {
        setUsers(response.data);
        setTotalPages(1);
      }
    } catch (error) {
      toast.error("Error fetching users");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this user account?")) {
      try {
        await api.delete(`/admin/users/${id}`);
        toast.success("User deleted!");
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    }
  };

  const handleRoleUpdate = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      toast.success("User role updated!");
      fetchUsers();
    } catch (error) {
      toast.error("Role update failed");
    }
  };

  return (
    <AdminLayout title="User Control Center">
      <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white overflow-hidden animate-fade-in">
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="text-muted border-bottom">
              <tr>
                <th className="py-3">IDENTITY</th>
                <th className="py-3">EMAIL</th>
                <th className="py-3">ROLE</th>
                <th className="py-3">JOINED</th>
                <th className="py-3 text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-bottom">
                  <td className="py-4 fw-black">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${user.name}&background=FF5E78&color=fff`}
                        className="rounded-circle"
                        width="40"
                      />
                      {user.name}
                    </div>
                  </td>
                  <td className="py-4 text-muted fw-bold">{user.email}</td>
                  <td className="py-4">
                    <select
                      className="form-select form-select-sm rounded-pill fw-black border-0 bg-light shadow-sm w-auto"
                      value={user.role}
                      onChange={(e) =>
                        handleRoleUpdate(user.id, e.target.value)
                      }
                    >
                      <option value="user">USER</option>
                      <option value="admin">ADMIN</option>
                    </select>
                  </td>
                  <td className="py-4 small fw-bold text-muted">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 text-end">
                    <button
                      className="btn btn-light rounded-circle p-2 text-danger shadow-sm"
                      onClick={() => handleDelete(user.id)}
                      disabled={user.role === "admin"}
                    >
                      <i className="bi bi-person-x-fill"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4 gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`btn rounded-circle fw-black ${currentPage === i + 1 ? "btn-primary shadow-primary" : "btn-light"}`}
                style={{ width: "45px", height: "45px" }}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageUsers;
