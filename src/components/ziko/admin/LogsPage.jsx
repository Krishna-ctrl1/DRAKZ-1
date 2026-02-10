import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { BACKEND_URL } from '../../../config/backend';
import { Title } from '../../../styles/ziko/admin/SharedStyles';
import { Section, FullWidthBox } from '../../../styles/ziko/admin/AdminLayout.styles';
import { StyledTable, UserTableContainer } from '../../../styles/ziko/admin/UserTable.styles';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BACKEND_URL}/api/privilege/admin/logs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setLogs(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div style={{ color: '#fff', padding: '20px' }}>Loading logs...</div>;

  return (
    <>
      <Title>Admin Activity Logs</Title>
      <Section>
        <FullWidthBox>
          <UserTableContainer>
            <StyledTable>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Details</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id}>
                    <td style={{ color: '#a0a0b0', fontSize: '0.85rem' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>{log.adminName || 'Unknown'}</td>
                    <td style={{ fontWeight: 'bold', color: '#3b82f6' }}>{log.action}</td>
                    <td>
                      {log.targetName ? (
                        <div>
                          <span style={{ fontWeight: '600', color: '#fff' }}>{log.targetName}</span>
                          {log.targetType && <span style={{ fontSize: '0.75rem', color: '#a0a0b0', marginLeft: '6px', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>{log.targetType}</span>}
                          <div style={{ fontSize: '0.7rem', color: '#ffffff40', fontFamily: 'monospace' }}>{log.targetId}</div>
                        </div>
                      ) : (
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#ffffff80' }}>{log.targetId || '-'}</span>
                      )}
                    </td>
                    <td>{log.details}</td>
                    <td style={{ color: '#a0a0b0', fontSize: '0.85rem' }}>{log.ipAddress}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No logs found.</td></tr>
                )}
              </tbody>
            </StyledTable>
          </UserTableContainer>
        </FullWidthBox>
      </Section>
    </>
  );
};

export default LogsPage;