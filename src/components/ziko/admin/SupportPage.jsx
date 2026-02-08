import React, { useEffect, useState } from 'react';
import { BACKEND_URL } from '../../../config/backend';
import { Title } from '../../../styles/ziko/admin/SharedStyles';
import { Section, FullWidthBox } from '../../../styles/ziko/admin/AdminLayout.styles';
import { StyledTable, UserTableContainer } from '../../../styles/ziko/admin/UserTable.styles';

const SupportPage = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BACKEND_URL}/api/privilege/admin/support`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setTickets(await res.json());
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: "20px", color: "#fff" }}>Loading...</div>;

    return (
        <>
            <Title>Support Inquiries</Title>

            <Section>
                <FullWidthBox>
                    <UserTableContainer>
                        {tickets.length === 0 ? (
                            <p style={{ padding: "20px", color: "#a0a0b0" }}>No support tickets found.</p>
                        ) : (
                            <StyledTable>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Subject</th>
                                        <th>Message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map(ticket => (
                                        <tr key={ticket._id}>
                                            <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                            <td>{ticket.name}</td>
                                            <td>{ticket.email}</td>
                                            <td style={{ fontWeight: 'bold', color: '#fff' }}>{ticket.subject}</td>
                                            <td style={{ maxWidth: '300px', whiteSpace: 'pre-wrap' }}>{ticket.message}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </StyledTable>
                        )}
                    </UserTableContainer>
                </FullWidthBox>
            </Section>
        </>
    );
};

export default SupportPage;
