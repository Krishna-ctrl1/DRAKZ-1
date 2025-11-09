import React from "react";
import {
  UserTableContainer,
  StyledTable,
  ActionButton,
  AddUserButtonWrapper,
} from "../../../../styles/ziko/admin/UserTable.styles"; // Adjusted import path
import { Title, Button } from "../../../../styles/ziko/admin/SharedStyles"; // Adjusted import path

const usersData = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Editor", status: "Inactive" },
  { id: 3, name: "Peter Jones", email: "peter@example.com", role: "Viewer", status: "Active" },
  { id: 4, name: "Alice Brown", email: "alice@example.com", role: "Editor", status: "Active" },
  { id: 5, name: "Bob White", email: "bob@example.com", role: "Admin", status: "Inactive" },
];

const UserTable = () => {
  const handleEdit = (userId) => {
    console.log("Edit user:", userId);
    // Implement actual edit logic (e.g., open a modal, navigate to edit page)
  };

  const handleDelete = (userId) => {
    console.log("Delete user:", userId);
    // Implement actual delete logic (e.g., show confirmation dialog, API call)
  };

  const handleAddUser = () => {
    console.log("Add new user");
    // Implement actual add user logic
  };

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
          {usersData.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <span className={user.status === "Active" ? "status-active" : "status-inactive"}>
                  {user.status}
                </span>
              </td>
              <td>
                <ActionButton onClick={() => handleEdit(user.id)}>
                  Edit
                </ActionButton>
                <ActionButton secondary onClick={() => handleDelete(user.id)}>
                  Delete
                </ActionButton>
              </td>
            </tr>
          ))}
        </tbody>
      </StyledTable>
      <AddUserButtonWrapper>
        <Button onClick={handleAddUser}>Add New User</Button>
      </AddUserButtonWrapper>
    </UserTableContainer>
  );
};

export default UserTable;