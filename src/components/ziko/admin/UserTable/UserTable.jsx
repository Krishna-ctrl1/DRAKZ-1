import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  UserTableContainer,
  StyledTable,
  ActionButton,
  AddUserButtonWrapper,
} from "../../../../styles/ziko/admin/UserTable.styles";
import { Title, Button } from "../../../../styles/ziko/admin/SharedStyles";

// --- 1. DARK THEME MODAL STYLES ---
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7); /* Darker dim for better contrast */
  backdrop-filter: blur(5px);      /* Modern glassmorphism effect */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #1e1e2f; /* Matches your dashboard card background */
  color: #ffffff;
  padding: 30px;
  border-radius: 16px;
  width: 450px;
  max-width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid #2e2e48;
`;

const ModalHeader = styled.h2`
  margin-top: 0;
  margin-bottom: 25px;
  font-size: 24px;
  color: #fff;
  border-bottom: 1px solid #2e2e48;
  padding-bottom: 15px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  
  label {
    margin-bottom: 8px;
    font-size: 14px;
    color: #a0a0b0; /* Light grey text */
  }

  input, select {
    padding: 12px;
    background: #141423; /* Darker input background */
    border: 1px solid #2e2e48;
    border-radius: 8px;
    font-size: 15px;
    color: #ffffff;
    outline: none;
    transition: 0.3s;

    &:focus {
      border-color: #764ba2; /* Purple focus color */
      box-shadow: 0 0 0 2px rgba(118, 75, 162, 0.2);
    }
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  /* Primary (Save) - Purple Gradient to match your screenshot */
  ${props => props.primary && `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
    color: white;
  `}

  /* Secondary (Cancel) - Dark Grey */
  ${props => props.secondary && `
    background: #2e2e48;
    color: #a0a0b0;
    &:hover { background: #3e3e5e; color: white; }
  `}

  &:hover {
    opacity: 0.9;
  }
`;

// --- MAIN COMPONENT ---
const UserTable = ({ role }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: role || "Viewer",
    password: "",
  });

  const API_URL = "http://localhost:3001/api/privilege/admin/users"; // Updated to use Admin API

  // --- FETCH USERS ---
  useEffect(() => {
    fetchUsers();
  }, [role]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Build query string
      let query = "";
      if (role) query = `?role=${role}`;
      // Add status filter if needed, for now just role

      const response = await fetch(`${API_URL}${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- OPEN MODAL FOR ADD ---
  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: "", email: "", role: "Viewer", password: "" });
    setIsModalOpen(true);
  };

  // --- OPEN MODAL FOR EDIT (PRE-FILL DATA) ---
  const openEditModal = (user) => {
    setEditingId(user._id);
    // Pre-fill the form with the clicked user's data
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role, // Assuming role is lowercase in DB, standardizing display handled in Select
      password: "", // Always empty for security
    });
    setIsModalOpen(true);
  };

  // --- SUBMIT FORM ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      const token = localStorage.getItem('token');
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      if (editingId) {
        // Update Logic
        response = await fetch(`${API_URL}/${editingId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(formData),
        });
      } else {
        // Create Logic
        response = await fetch(API_URL, {
          method: "POST",
          headers,
          body: JSON.stringify(formData),
        });
      }

      const data = await response.json();

      if (response.ok) {
        if (editingId) {
          setUsers(users.map((u) => (u._id === editingId ? data : u)));
        } else {
          setUsers([...users, data]);
        }
        setIsModalOpen(false);
      } else {
        alert("Error: " + data.msg);
      }
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  // --- DELETE USER ---
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/${userId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setUsers(users.filter((u) => u._id !== userId));
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  if (loading) return <p style={{ padding: "24px", color: "white" }}>Loading users...</p>;

  return (
    <UserTableContainer>
      <Title style={{ padding: "24px 24px 0" }}>User Management</Title>

      <StyledTable>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <span className={user.status === "Active" ? "status-active" : "status-inactive"}>
                  {user.status || "Active"}
                </span>
              </td>
              <td>
                <ActionButton onClick={() => openEditModal(user)}>Edit</ActionButton>
                <ActionButton
                  secondary
                  onClick={async () => {
                    if (!window.confirm(`Are you sure you want to ${user.status === 'Active' ? 'suspend' : 'activate'} this user?`)) return;
                    try {
                      const token = localStorage.getItem('token');
                      const response = await fetch(`http://localhost:3001/api/privilege/admin/users/${user._id}/status`, {
                        method: 'PATCH',
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      if (response.ok) {
                        // Update local state
                        setUsers(users.map(u => u._id === user._id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
                      }
                    } catch (error) {
                      console.error("Error updating status:", error);
                    }
                  }}
                  style={{ color: user.status === 'Active' ? '#f87171' : '#4ade80' }}
                >
                  {user.status === 'Active' ? 'Suspend' : 'Activate'}
                </ActionButton>
                <ActionButton secondary onClick={() => handleDelete(user._id)}>Delete</ActionButton>
              </td>
            </tr>
          ))}
        </tbody>
      </StyledTable>

      <AddUserButtonWrapper>
        <Button onClick={openAddModal}>Add New User</Button>
      </AddUserButtonWrapper>

      {/* --- DARK THEME MODAL --- */}
      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>{editingId ? "Edit User Details" : "Add New User"}</ModalHeader>
            <form onSubmit={handleSubmit}>

              <FormGroup>
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <label>User Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Advisor</option>
                  <option value="user">User</option>
                </select>
              </FormGroup>

              <FormGroup>
                <label>
                  Password {editingId ? <span style={{ fontSize: '12px', opacity: 0.6 }}>(Leave blank to keep current)</span> : "*"}
                </label>
                <input
                  type="password"
                  placeholder={editingId ? "••••••" : "Enter secure password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingId} // Only required when creating
                />
              </FormGroup>

              <ModalActions>
                <ModalButton type="button" secondary onClick={() => setIsModalOpen(false)}>
                  Cancel
                </ModalButton>
                <ModalButton type="submit" primary>
                  {editingId ? "Save Changes" : "Create User"}
                </ModalButton>
              </ModalActions>

            </form>
          </ModalContent>
        </ModalOverlay>
      )}

    </UserTableContainer>
  );
};

export default UserTable;