import React from 'react';
import styled from 'styled-components';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Section, FullWidthBox } from '../../../styles/ziko/admin/AdminLayout.styles';
import { Title } from '../../../styles/ziko/admin/SharedStyles';

const ChartContainer = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const ChartTitle = styled.h3`
  color: #fff;
  margin-bottom: 20px;
  font-size: 1.1rem;
  display: flex; justify-content: space-between; align-items: center;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-top: 24px;
`;

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: '#1e1e2f', padding: '10px', border: '1px solid #2b2b40', borderRadius: '8px' }}>
                <p style={{ color: '#fff', margin: 0 }}>{label}</p>
                <p style={{ color: payload[0].color, margin: 0 }}>
                    {payload[0].name}: {payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

const AdvancedAnalytics = ({ data }) => {
    if (!data) return null;

    return (
        <Section>
            <Title>Advanced Analytics</Title>

            <Grid>
                {/* USER GROWTH CHART */}
                <ChartContainer>
                    <ChartTitle>User Growth (Last 6 Months)</ChartTitle>
                    <div style={{ height: 300, width: '100%' }}>
                        <ResponsiveContainer>
                            <AreaChart data={data.userGrowth}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="#a0a0b0" />
                                <YAxis stroke="#a0a0b0" />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </ChartContainer>

                {/* TRANSACTION VOLUME CHART */}
                <ChartContainer>
                    <ChartTitle>Transaction Volume (₹)</ChartTitle>
                    <div style={{ height: 300, width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart data={data.transactionVolume}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="#a0a0b0" />
                                <YAxis stroke="#a0a0b0" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="volume" fill="#8884d8" name="Volume (₹)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartContainer>
                {/* COHORT ANALYSIS (RETENTION) */}
                <ChartContainer>
                    <ChartTitle>User Retention (Cohort Analysis)</ChartTitle>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {data.cohorts && data.cohorts.length > 0 ? (
                            data.cohorts.map((cohort, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '80px', color: '#a0a0b0', fontSize: '0.9rem' }}>{cohort.month}</div>
                                    <div style={{ width: '100px', color: '#fff', fontWeight: 'bold' }}>{cohort.newUsers} Users</div>
                                    <div style={{ flex: 1, display: 'flex', gap: '5px' }}>
                                        {cohort.retention.map((r, i) => (
                                            <div key={i} style={{
                                                flex: 1,
                                                background: `rgba(59, 130, 246, ${r.value / cohort.newUsers})`,
                                                padding: '8px',
                                                borderRadius: '4px',
                                                textAlign: 'center',
                                                color: '#fff',
                                                fontSize: '0.8rem'
                                            }} title={`${r.value} users in ${r.month}`}>
                                                {Math.round((r.value / cohort.newUsers) * 100)}%
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ color: '#a0a0b0', padding: '20px', textAlign: 'center' }}>No cohort data available yet.</div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '5px', fontSize: '0.75rem', color: '#a0a0b0', marginTop: '5px' }}>
                            <div style={{ flex: 1 }}>Month 1</div>
                            <div style={{ flex: 1 }}>Month 2</div>
                        </div>
                    </div>
                </ChartContainer>
            </Grid>
        </Section>
    );
};

export default AdvancedAnalytics;
