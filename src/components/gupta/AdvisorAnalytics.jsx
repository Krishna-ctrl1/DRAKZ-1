import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdvisorAnalytics } from '../../redux/slices/advisorSlice';
import { useState } from 'react';
import Header from '../global/Header';
import Sidebar from '../global/Sidebar';
import '../../styles/gupta/AdvisorAnalytics.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const RISK_COLORS = { Conservative: '#10b981', Moderate: '#6366f1', Aggressive: '#ef4444', 'Very Aggressive': '#f59e0b' };
const CAT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

const fmtCur = val => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

const AdvisorAnalytics = () => {
    const dispatch = useDispatch();
    const { analytics, analyticsLoading } = useSelector(s => s.advisor);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        dispatch(fetchAdvisorAnalytics());
    }, [dispatch]);

    // Build monthly chart
    const getMonthly = () => {
        if (!analytics?.monthlyData) return [];
        const map = {};
        analytics.monthlyData.forEach(({ _id, total }) => {
            const key = `${_id.year}-${_id.month}`;
            if (!map[key]) map[key] = { label: `${MONTHS[_id.month - 1]} ${String(_id.year).slice(2)}`, income: 0, expense: 0 };
            if (_id.type === 'income') map[key].income = total;
            else map[key].expense = total;
        });
        return Object.values(map);
    };

    const monthly = getMonthly();
    const maxMonthly = Math.max(...monthly.flatMap(m => [m.income, m.expense]), 1);

    // Risk donut segments
    const getRiskSegments = () => {
        if (!analytics?.riskDistribution) return [];
        const total = Object.values(analytics.riskDistribution).reduce((s, v) => s + v, 0) || 1;
        let cumulative = 0;
        return Object.entries(analytics.riskDistribution).map(([risk, count]) => {
            const pct = (count / total) * 100;
            const segment = { risk, count, pct: Math.round(pct), offset: cumulative, color: RISK_COLORS[risk] || '#94a3b8' };
            cumulative += pct;
            return segment;
        });
    };

    const riskSegments = getRiskSegments();
    const totalClients = analytics?.totalClients || 0;

    // CSS conic donut
    const donutGradient = riskSegments.length > 0
        ? `conic-gradient(${riskSegments.map(s => `${s.color} ${s.offset}% ${s.offset + s.pct}%`).join(', ')})`
        : 'conic-gradient(#334155 0% 100%)';

    return (
        <div className="analytics-page">
            <Header />
            <div className="app advisor-app">
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
                <div className={collapsed ? 'main-content-collapsed' : 'main-content'}>
                    <div className="analytics-content">

                        {/* Header */}
                        <div className="analytics-page-header">
                            <div>
                                <h1><i className="fa-solid fa-chart-line"></i> Analytics</h1>
                                <p>Aggregated insights across all your clients</p>
                            </div>
                        </div>

                        {analyticsLoading ? (
                            <div className="analytics-loading">
                                <div className="spinner-large"></div>
                                <p>Crunching your data...</p>
                            </div>
                        ) : !analytics ? null : (
                            <>
                                {/* Top KPI Cards */}
                                <div className="analytics-kpi-row">
                                    <div className="kpi-card clients">
                                        <div className="kpi-icon"><i className="fa-solid fa-users"></i></div>
                                        <div className="kpi-info">
                                            <span className="kpi-value">{analytics.totalClients}</span>
                                            <span className="kpi-label">Total Clients</span>
                                        </div>
                                    </div>
                                    <div className="kpi-card income">
                                        <div className="kpi-icon"><i className="fa-solid fa-arrow-trend-up"></i></div>
                                        <div className="kpi-info">
                                            <span className="kpi-value">{fmtCur(analytics.totalIncome)}</span>
                                            <span className="kpi-label">Client Total Income</span>
                                        </div>
                                    </div>
                                    <div className="kpi-card expense">
                                        <div className="kpi-icon"><i className="fa-solid fa-arrow-trend-down"></i></div>
                                        <div className="kpi-info">
                                            <span className="kpi-value">{fmtCur(analytics.totalExpense)}</span>
                                            <span className="kpi-label">Client Total Expense</span>
                                        </div>
                                    </div>
                                    <div className="kpi-card balance">
                                        <div className="kpi-icon"><i className="fa-solid fa-wallet"></i></div>
                                        <div className="kpi-info">
                                            <span className="kpi-value" style={{ color: analytics.netBalance >= 0 ? '#10b981' : '#ef4444' }}>
                                                {fmtCur(analytics.netBalance)}
                                            </span>
                                            <span className="kpi-label">Net Balance</span>
                                        </div>
                                    </div>
                                    <div className="kpi-card credit">
                                        <div className="kpi-icon"><i className="fa-solid fa-star"></i></div>
                                        <div className="kpi-info">
                                            <span className="kpi-value">{analytics.avgCreditScore}</span>
                                            <span className="kpi-label">Avg Credit Score</span>
                                        </div>
                                    </div>
                                    <div className="kpi-card pending">
                                        <div className="kpi-icon"><i className="fa-solid fa-user-plus"></i></div>
                                        <div className="kpi-info">
                                            <span className="kpi-value">{analytics.pendingRequests}</span>
                                            <span className="kpi-label">Pending Requests</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Charts Row */}
                                <div className="analytics-charts-row">

                                    {/* Monthly Trend */}
                                    <div className="analytics-chart-card wide">
                                        <h3><i className="fa-solid fa-chart-bar"></i> Monthly Income vs Expense (All Clients)</h3>
                                        {monthly.length === 0 ? (
                                            <div className="chart-empty"><i className="fa-solid fa-chart-bar"></i><p>No transaction data yet</p></div>
                                        ) : (
                                            <div className="analytics-bar-chart">
                                                {monthly.map((m, i) => (
                                                    <div key={i} className="analytics-bar-group">
                                                        <div className="analytics-bars">
                                                            <div className="a-bar income" style={{ height: `${(m.income / maxMonthly) * 140}px` }} title={fmtCur(m.income)}></div>
                                                            <div className="a-bar expense" style={{ height: `${(m.expense / maxMonthly) * 140}px` }} title={fmtCur(m.expense)}></div>
                                                        </div>
                                                        <span className="a-bar-label">{m.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="chart-legend">
                                            <span className="legend-dot income"></span> Income
                                            <span className="legend-dot expense" style={{ marginLeft: '16px' }}></span> Expense
                                        </div>
                                    </div>

                                    {/* Risk Distribution Donut */}
                                    <div className="analytics-chart-card">
                                        <h3><i className="fa-solid fa-circle-half-stroke"></i> Client Risk Profiles</h3>
                                        {totalClients === 0 ? (
                                            <div className="chart-empty"><i className="fa-solid fa-circle-half-stroke"></i><p>No clients yet</p></div>
                                        ) : (
                                            <>
                                                <div className="donut-wrapper">
                                                    <div className="donut" style={{ background: donutGradient }}>
                                                        <div className="donut-hole">
                                                            <span className="donut-center-val">{totalClients}</span>
                                                            <span className="donut-center-lbl">Clients</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="donut-legend">
                                                    {riskSegments.map((s, i) => (
                                                        <div key={i} className="donut-legend-item">
                                                            <span className="donut-dot" style={{ background: s.color }}></span>
                                                            <span>{s.risk}</span>
                                                            <span className="donut-count">{s.count} ({s.pct}%)</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom Row: Category Breakdown + Client Table */}
                                <div className="analytics-bottom-row">

                                    {/* Top Expense Categories */}
                                    <div className="analytics-chart-card">
                                        <h3><i className="fa-solid fa-layer-group"></i> Top Expense Categories</h3>
                                        {analytics.categoryData.length === 0 ? (
                                            <div className="chart-empty"><p>No expense data</p></div>
                                        ) : (() => {
                                            const maxCat = Math.max(...analytics.categoryData.map(c => c.total), 1);
                                            return (
                                                <div className="analytics-categories">
                                                    {analytics.categoryData.map((cat, i) => (
                                                        <div key={i} className="analytics-cat-row">
                                                            <span className="a-cat-name">{cat._id || 'Uncategorized'}</span>
                                                            <div className="a-cat-track">
                                                                <div className="a-cat-fill" style={{ width: `${(cat.total / maxCat) * 100}%`, background: CAT_COLORS[i % CAT_COLORS.length] }}></div>
                                                            </div>
                                                            <span className="a-cat-val">{fmtCur(cat.total)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Client Overview Table */}
                                    <div className="analytics-chart-card">
                                        <h3><i className="fa-solid fa-table-list"></i> Client Overview</h3>
                                        {analytics.clients.length === 0 ? (
                                            <div className="chart-empty"><p>No clients yet</p></div>
                                        ) : (
                                            <div className="analytics-client-table">
                                                <div className="table-header-row">
                                                    <span>Client</span>
                                                    <span>Risk</span>
                                                    <span>Score</span>
                                                    <span>Since</span>
                                                </div>
                                                {analytics.clients.map((c, i) => (
                                                    <div key={i} className="table-data-row">
                                                        <div className="table-client-name">
                                                            <div className="table-avatar">{c.name?.[0]?.toUpperCase() || 'U'}</div>
                                                            <span>{c.name}</span>
                                                        </div>
                                                        <span className={`table-risk ${(c.riskProfile || 'moderate').toLowerCase().replace(' ', '-')}`}>{c.riskProfile || 'Moderate'}</span>
                                                        <span className="table-score" style={{ color: c.creditScore > 700 ? '#10b981' : '#f59e0b' }}>{c.creditScore || 'N/A'}</span>
                                                        <span className="table-date">{new Date(c.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvisorAnalytics;
