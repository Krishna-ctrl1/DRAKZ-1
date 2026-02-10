import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { BACKEND_URL } from '../../../config/backend';
import { Title } from '../../../styles/ziko/admin/SharedStyles';
import { Section, FullWidthBox } from '../../../styles/ziko/admin/AdminLayout.styles';
import { StyledTable, UserTableContainer, ActionButton } from '../../../styles/ziko/admin/UserTable.styles';
import { MdSecurity, MdEdit, MdDelete } from 'react-icons/md';

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8); z-index: 1000;
  display: flex; justify-content: center; align-items: center;
`;

const ModalContent = styled.div`
  background: #1e1e2f; padding: 30px; border-radius: 12px;
  width: 90%; max-width: 500px;
  border: 1px solid #2b2b40; color: #fff;
`;

const CheckboxGroup = styled.div`
  display: flex; flex-direction: column; gap: 10px; margin: 20px 0;
`;

const CheckboxLabel = styled.label`
  display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none;
`;

const Input = styled.input`
  width: 100%; padding: 10px; margin-bottom: 10px;
  background: #141423; border: 1px solid #2e2e48; border-radius: 6px; color: #fff;
`;

const ALL_PERMISSIONS = [
    { key: 'manage_users', label: 'Manage Users (Edit, Suspend)' },
    { key: 'manage_content', label: 'Manage Content (Blogs, Verify)' },
    { key: 'manage_support', label: 'Support Ticketing' },
    { key: 'view_analytics', label: 'View Analytics' },
    { key: 'manage_admins', label: 'Manage Admins (Super Admin)' }
];

const AdminManagementPage = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAdmin, setSelectedAdmin] = useState(null); // For Edit
    const [isAdding, setIsAdding] = useState(false); // For New Admin

    // Form State
    const [formData, setFormData] = useState({ name: '', email: '', password: '', permissions: [] });

    // Fetch
    const fetchAdmins = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BACKEND_URL}/api/privilege/admin/users?role=admin`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setAdmins(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAdmins(); }, []);

    // Create / Update Logic
    const handleSubmit = async () => {
        const token = localStorage.getItem('token');
        const url = isAdding
            ? `${BACKEND_URL}/api/privilege/admin/create-admin`
            : `${BACKEND_URL}/api/privilege/admin/update-permissions/${selectedAdmin._id}`;

        const method = isAdding ? 'POST' : 'PATCH';
        const body = isAdding ? formData : { permissions: formData.permissions };

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                fetchAdmins();
                handleCloseModal();
            } else {
                alert("Failed to save admin.");
            }
        } catch (e) { console.error(e); }
    };

    const handleOpenEdit = (admin) => {
        setSelectedAdmin(admin);
        setFormData({
            name: admin.name,
            email: admin.email,
            permissions: admin.permissions || []
        });
        setIsAdding(false);
    };

    const handleOpenAdd = () => {
        setFormData({ name: '', email: '', password: '', permissions: [] });
        setIsAdding(true);
        setSelectedAdmin(true); // Just to open modal
    };

    const handlePermissionToggle = (key) => {
        setFormData(prev => {
            const newPerms = prev.permissions.includes(key)
                ? prev.permissions.filter(p => p !== key)
                : [...prev.permissions, key];
            return { ...prev, permissions: newPerms };
        });
    };

    const handleCloseModal = () => {
        setSelectedAdmin(null);
        setIsAdding(false);
    };

    if (loading) return <div style={{ color: '#fff', padding: '20px' }}>Loading admins...</div>;

    return (
        <>
            <Title>Admin Management (RBAC)</Title>
            <Section>
                <FullWidthBox>
                    <UserTableContainer>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '15px' }}>
                            <ActionButton onClick={handleOpenAdd} style={{ background: '#764ba2', color: '#fff' }}>
                                + Create New Admin
                            </ActionButton>
                        </div>
                        <StyledTable>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Permissions</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.map(admin => (
                                    <tr key={admin._id}>
                                        <td>{admin.name}</td>
                                        <td>{admin.email}</td>
                                        <td>
                                            {!admin.permissions || admin.permissions.length === 0
                                                ? <span style={{ color: '#f59e0b' }}>Full Access (Legacy)</span>
                                                : admin.permissions.includes('all') ? 'Full Access' : admin.permissions.join(', ')}
                                        </td>
                                        <td>
                                            <ActionButton onClick={() => handleOpenEdit(admin)}><MdEdit /> Edit Rights</ActionButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </StyledTable>
                    </UserTableContainer>
                </FullWidthBox>
            </Section>

            {/* MODAL */}
            {selectedAdmin && (
                <ModalOverlay onClick={handleCloseModal}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <h2>{isAdding ? 'Create New Admin' : `Edit Permissions: ${selectedAdmin.name}`}</h2>

                        {isAdding && (
                            <>
                                <Input
                                    placeholder="Name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                                <Input
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                                <Input
                                    placeholder="Password"
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </>
                        )}

                        <h4 style={{ margin: '15px 0 10px', color: '#a0a0b0' }}>Access Rights</h4>
                        <CheckboxGroup>
                            {ALL_PERMISSIONS.map(p => (
                                <CheckboxLabel key={p.key}>
                                    <input
                                        type="checkbox"
                                        checked={formData.permissions.includes(p.key)}
                                        onChange={() => handlePermissionToggle(p.key)}
                                    />
                                    {p.label}
                                </CheckboxLabel>
                            ))}
                        </CheckboxGroup>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button onClick={handleCloseModal} style={{ flex: 1, padding: '10px', background: '#2e2e48', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleSubmit} style={{ flex: 1, padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save Changes</button>
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}
        </>
    );
};

export default AdminManagementPage;
