import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchClients, fetchClientReport, removeClient,
    selectClient, clearMessages
} from '../../redux/slices/advisorSlice';
import Header from '../global/Header';
import Sidebar from '../global/Sidebar';
import { generateClientReportPDF } from '../../utils/generateClientPDF';
import '../../styles/gupta/AdvisorClients.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AdvisorClients = () => {
    const dispatch = useDispatch();
    const { clients, loading, selectedClient, clientReport, reportLoading, error, successMessage } = useSelector(s => s.advisor);
    const [collapsed, setCollapsed] = useState(false);
    const [search, setSearch] = useState('');
    const [confirmRemove, setConfirmRemove] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);

    // Get advisor name for PDF header
    const getAdvisorName = () => {
        try {
            const u = JSON.parse(localStorage.getItem('user') || '{}');
            return u.name || 'Advisor';
        } catch { return 'Advisor'; }
    };

    useEffect(() => {
        dispatch(fetchClients());
    }, [dispatch]);

    useEffect(() => {
        if (selectedClient) dispatch(fetchClientReport(selectedClient._id));
    }, [selectedClient, dispatch]);

    useEffect(() => {
        if (successMessage || error) {
            const t = setTimeout(() => dispatch(clearMessages()), 3500);
            return () => clearTimeout(t);
        }
    }, [successMessage, error, dispatch]);

    const filtered = clients.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.occupation?.toLowerCase().includes(search.toLowerCase())
    );

    const fmtCur = val => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

    const handleRemove = (clientId) => {
        dispatch(removeClient(clientId));
        setConfirmRemove(null);
    };

    const handleExportPDF = async () => {
        if (!selectedClient || !clientReport) return;
        setPdfLoading(true);
        try {
            await generateClientReportPDF(selectedClient, clientReport, getAdvisorName());
        } catch (err) {
            console.error('PDF generation failed:', err);
        } finally {
            setPdfLoading(false);
        }
    };

    // Build monthly chart data
    const getMonthlyChart = () => {
        if (!clientReport?.monthlyTrend) return [];
        const map = {};
        clientReport.monthlyTrend.forEach(({ _id, total }) => {
            const key = `${_id.year}-${_id.month}`;
            if (!map[key]) map[key] = { label: `${MONTHS[_id.month - 1]} ${_id.year}`, income: 0, expense: 0 };
            if (_id.type === 'income') map[key].income = total;
            else map[key].expense = total;
        });
        return Object.values(map);
    };

    const monthlyChart = getMonthlyChart();
    const maxMonthly = Math.max(...monthlyChart.flatMap(m => [m.income, m.expense]), 1);

    const getCategoryBreakdown = () => {
        if (!clientReport?.categoryBreakdown) return [];
        const expenseItems = clientReport.categoryBreakdown.filter(c => c._id?.type === 'expense');
        const total = expenseItems.reduce((s, c) => s + c.total, 0) || 1;
        return expenseItems.slice(0, 6).map(c => ({
            name: c._id?.category || 'Other',
            amount: c.total,
            pct: Math.round((c.total / total) * 100)
        }));
    };

    const categories = getCategoryBreakdown();

    const categoryColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

    return (
        <div className="clients-hub-page">
            <Header />
            <div className="app advisor-app">
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
                <div className={collapsed ? 'main-content-collapsed' : 'main-content'}>
                    <div className="clients-hub-content">

                        {/* Toast */}
                        {successMessage && <div className="hub-toast success"><i className="fa-solid fa-circle-check"></i> {successMessage}</div>}
                        {error && <div className="hub-toast error"><i className="fa-solid fa-triangle-exclamation"></i> {error}</div>}

                        {/* Header */}
                        <div className="hub-page-header">
                            <div>
                                <h1><i className="fa-solid fa-users"></i> Clients Hub</h1>
                                <p>Manage and view detailed financial reports for all your clients</p>
                            </div>
                            <div className="hub-summary-pills">
                                <span className="hub-pill">{clients.length} Total Clients</span>
                            </div>
                        </div>

                        <div className="hub-main-layout">
                            {/* Left Panel: Client List */}
                            <div className="hub-clients-panel">
                                <div className="hub-search-bar">
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                    <input
                                        type="text"
                                        placeholder="Search clients..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>

                                <div className="hub-clients-list">
                                    {loading ? (
                                        <div className="hub-loading"><div className="spinner"></div><p>Loading...</p></div>
                                    ) : filtered.length === 0 ? (
                                        <div className="hub-empty">
                                            <i className="fa-solid fa-users-slash"></i>
                                            <p>{search ? 'No clients match your search' : 'No clients yet'}</p>
                                        </div>
                                    ) : (
                                        filtered.map(client => (
                                            <div
                                                key={client._id}
                                                className={`hub-client-card ${selectedClient?._id === client._id ? 'active' : ''}`}
                                                onClick={() => dispatch(selectClient(client))}
                                            >
                                                <div className="hub-client-avatar">
                                                    {client.name?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div className="hub-client-info">
                                                    <p className="hub-client-name">{client.name}</p>
                                                    <p className="hub-client-sub">{client.occupation || 'No occupation'}</p>
                                                    <span className={`hub-risk-badge ${(client.riskProfile || 'moderate').toLowerCase()}`}>
                                                        {client.riskProfile || 'Moderate'}
                                                    </span>
                                                </div>
                                                <div className="hub-client-income">
                                                    <span className="income-val">{fmtCur(client.monthlyIncome)}</span>
                                                    <span className="income-label">income</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Right Panel: Client Report */}
                            <div className="hub-report-panel">
                                {!selectedClient ? (
                                    <div className="hub-empty-report">
                                        <i className="fa-solid fa-chart-pie"></i>
                                        <h3>Select a Client</h3>
                                        <p>Click a client on the left to view their full financial report</p>
                                    </div>
                                ) : (
                                    <div className="hub-report-view">

                                        {/* Report Header */}
                                        <div className="report-header">
                                            <div className="report-client-info">
                                                <div className="report-avatar">{selectedClient.name?.[0]?.toUpperCase() || 'U'}</div>
                                                <div>
                                                    <h2>{selectedClient.name}</h2>
                                                    <p>{selectedClient.email}</p>
                                                    <p className="report-meta">
                                                        <i className="fa-solid fa-briefcase"></i> {selectedClient.occupation || 'Unspecified'}
                                                        &nbsp;&nbsp;
                                                        <i className="fa-solid fa-phone"></i> {selectedClient.phone || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="report-header-actions">
                                                {/* PDF Export */}
                                                <button
                                                    className="btn-export-pdf"
                                                    onClick={handleExportPDF}
                                                    disabled={pdfLoading || reportLoading || !clientReport}
                                                    title="Export client report as PDF"
                                                >
                                                    {pdfLoading
                                                        ? <><i className="fa-solid fa-spinner fa-spin"></i> Generating...</>
                                                        : <><i className="fa-solid fa-file-pdf"></i> Export PDF</>}
                                                </button>

                                                {confirmRemove === selectedClient._id ? (
                                                    <div className="confirm-remove">
                                                        <span>Remove this client?</span>
                                                        <button className="btn-confirm-yes" onClick={() => handleRemove(selectedClient._id)}>Yes, Remove</button>
                                                        <button className="btn-confirm-no" onClick={() => setConfirmRemove(null)}>Cancel</button>
                                                    </div>
                                                ) : (
                                                    <button className="btn-remove-client" onClick={() => setConfirmRemove(selectedClient._id)}>
                                                        <i className="fa-solid fa-user-minus"></i> Remove Client
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {reportLoading ? (
                                            <div className="hub-loading"><div className="spinner"></div><p>Loading financial report...</p></div>
                                        ) : clientReport ? (
                                            <>
                                                {/* Key Financial Stats */}
                                                <div className="report-stats-row">
                                                    <div className="report-stat income">
                                                        <i className="fa-solid fa-arrow-trend-up"></i>
                                                        <div>
                                                            <span className="stat-val">{fmtCur(clientReport.financials.totalIncome)}</span>
                                                            <span className="stat-lbl">Total Income</span>
                                                        </div>
                                                    </div>
                                                    <div className="report-stat expense">
                                                        <i className="fa-solid fa-arrow-trend-down"></i>
                                                        <div>
                                                            <span className="stat-val">{fmtCur(clientReport.financials.totalExpense)}</span>
                                                            <span className="stat-lbl">Total Expenses</span>
                                                        </div>
                                                    </div>
                                                    <div className="report-stat balance">
                                                        <i className="fa-solid fa-wallet"></i>
                                                        <div>
                                                            <span className="stat-val" style={{ color: clientReport.financials.balance >= 0 ? '#10b981' : '#ef4444' }}>
                                                                {fmtCur(clientReport.financials.balance)}
                                                            </span>
                                                            <span className="stat-lbl">Net Balance</span>
                                                        </div>
                                                    </div>
                                                    <div className="report-stat credit">
                                                        <i className="fa-solid fa-chart-line"></i>
                                                        <div>
                                                            <span className="stat-val" style={{ color: selectedClient.creditScore > 700 ? '#10b981' : '#f59e0b' }}>
                                                                {selectedClient.creditScore || 'N/A'}
                                                            </span>
                                                            <span className="stat-lbl">Credit Score</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Monthly Trend Chart */}
                                                {monthlyChart.length > 0 && (
                                                    <div className="report-chart-card">
                                                        <h4><i className="fa-solid fa-chart-bar"></i> Monthly Trend (Last 6 Months)</h4>
                                                        <div className="bar-chart">
                                                            {monthlyChart.map((m, i) => (
                                                                <div key={i} className="bar-group">
                                                                    <div className="bars">
                                                                        <div className="bar income-bar" style={{ height: `${(m.income / maxMonthly) * 120}px` }} title={`Income: ${fmtCur(m.income)}`}></div>
                                                                        <div className="bar expense-bar" style={{ height: `${(m.expense / maxMonthly) * 120}px` }} title={`Expense: ${fmtCur(m.expense)}`}></div>
                                                                    </div>
                                                                    <span className="bar-label">{m.label}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="chart-legend">
                                                            <span className="legend-dot income"></span> Income
                                                            <span className="legend-dot expense" style={{ marginLeft: '16px' }}></span> Expense
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Category Breakdown */}
                                                {categories.length > 0 && (
                                                    <div className="report-chart-card">
                                                        <h4><i className="fa-solid fa-layer-group"></i> Spending by Category</h4>
                                                        <div className="category-bars">
                                                            {categories.map((cat, i) => (
                                                                <div key={i} className="category-row">
                                                                    <span className="cat-name">{cat.name || 'Uncategorized'}</span>
                                                                    <div className="cat-bar-track">
                                                                        <div className="cat-bar-fill" style={{ width: `${cat.pct}%`, background: categoryColors[i % categoryColors.length] }}></div>
                                                                    </div>
                                                                    <span className="cat-amount">{fmtCur(cat.amount)} <span className="cat-pct">({cat.pct}%)</span></span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvisorClients;
