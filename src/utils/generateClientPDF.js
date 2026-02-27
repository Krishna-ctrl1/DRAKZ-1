import { jsPDF } from 'jspdf';

/**
 * Generates a professional financial report PDF for a single client.
 * @param {object} client - The selected client object from Redux
 * @param {object} report  - The clientReport object from Redux (financials, monthlyTrend, categoryBreakdown)
 * @param {string} advisorName - The advisor's name (from profile or localStorage)
 */
export const generateClientReportPDF = (client, report, advisorName = 'Your Advisor') => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210; // A4 width mm
    const margin = 18;
    const contentW = W - margin * 2;
    let y = 0;

    // ─── Helpers ──────────────────────────────────────────────────────────────
    const fmtCur = (val) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: 'INR', maximumFractionDigits: 0,
        }).format(val || 0);

    const fmtScore = (val) => (val ? String(val) : 'N/A');

    const hexToRGB = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    };

    const setColor = (hex) => doc.setTextColor(...hexToRGB(hex));
    const setFill = (hex) => doc.setFillColor(...hexToRGB(hex));
    const setDraw = (hex) => doc.setDrawColor(...hexToRGB(hex));

    // ─── HEADER BAND ──────────────────────────────────────────────────────────
    setFill('#1e1b4b');
    doc.rect(0, 0, W, 42, 'F');

    // Gradient-like accent bar
    setFill('#6366f1');
    doc.rect(0, 0, 6, 42, 'F');

    setColor('#ffffff');
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('DRAKZ', margin, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    setColor('#a5b4fc');
    doc.text('Financial Client Report', margin, 26);

    // Date top-right
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    doc.setFontSize(9);
    setColor('#c7d2fe');
    doc.text(`Generated: ${today}`, W - margin, 18, { align: 'right' });
    doc.text(`Advisor: ${advisorName}`, W - margin, 26, { align: 'right' });

    y = 52;

    // ─── CLIENT INFO SECTION ──────────────────────────────────────────────────
    setFill('#f8f7ff');
    doc.roundedRect(margin, y, contentW, 30, 3, 3, 'F');
    setDraw('#e0e7ff');
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentW, 30, 3, 3, 'S');

    // Avatar circle with initial
    setFill('#6366f1');
    doc.circle(margin + 14, y + 15, 10, 'F');
    setColor('#ffffff');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text((client.name?.[0] || 'U').toUpperCase(), margin + 14, y + 19, { align: 'center' });

    // Client details
    const infoX = margin + 30;
    setColor('#1e1b4b');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(client.name || 'Unknown Client', infoX, y + 12);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setColor('#6b7280');
    doc.text(`Email: ${client.email || 'N/A'}`, infoX, y + 20);
    doc.text(`Occupation: ${client.occupation || 'Unspecified'}  |  Phone: ${client.phone || 'N/A'}`, infoX, y + 27);

    // Risk badge top-right
    const riskColor = { Conservative: '#059669', Moderate: '#6366f1', Aggressive: '#dc2626' };
    const risk = client.riskProfile || 'Moderate';
    const rCol = riskColor[risk] || '#6366f1';
    setFill(rCol);
    doc.roundedRect(W - margin - 40, y + 7, 40, 12, 3, 3, 'F');
    setColor('#ffffff');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(risk, W - margin - 20, y + 14.5, { align: 'center' });

    y += 38;

    // ─── FINANCIAL SUMMARY ────────────────────────────────────────────────────
    setColor('#1e1b4b');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Financial Summary', margin, y);

    // Accent underline
    setFill('#6366f1');
    doc.rect(margin, y + 2, 38, 1, 'F');

    y += 8;

    const fin = report?.financials || {};
    const stats = [
        { label: 'Total Income', value: fmtCur(fin.totalIncome), color: '#059669', bg: '#f0fdf4', icon: '▲' },
        { label: 'Total Expenses', value: fmtCur(fin.totalExpense), color: '#dc2626', bg: '#fef2f2', icon: '▼' },
        { label: 'Net Balance', value: fmtCur(fin.balance), color: fin.balance >= 0 ? '#059669' : '#dc2626', bg: '#f5f3ff', icon: '◆' },
        { label: 'Credit Score', value: fmtScore(client.creditScore), color: (client.creditScore > 700 ? '#059669' : '#d97706'), bg: '#fffbeb', icon: '★' },
    ];

    const cardW = (contentW - 9) / 4;
    stats.forEach((stat, i) => {
        const cx = margin + i * (cardW + 3);
        setFill(stat.bg);
        doc.roundedRect(cx, y, cardW, 28, 2, 2, 'F');
        setDraw('#e5e7eb');
        doc.setLineWidth(0.2);
        doc.roundedRect(cx, y, cardW, 28, 2, 2, 'S');

        setColor(stat.color);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(stat.icon, cx + 4, y + 8);

        setColor('#6b7280');
        doc.setFontSize(7.5);
        doc.text(stat.label, cx + 4, y + 15);

        setColor(stat.color);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(stat.value, cx + cardW / 2, y + 24, { align: 'center' });
    });

    y += 36;

    // ─── SPENDING BY CATEGORY ─────────────────────────────────────────────────
    const categories = (report?.categoryBreakdown || [])
        .filter(c => c._id?.type === 'expense')
        .slice(0, 6)
        .map(c => ({ name: c._id?.category || 'Other', amount: c.total }));

    if (categories.length > 0) {
        setColor('#1e1b4b');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Spending by Category', margin, y);
        setFill('#6366f1');
        doc.rect(margin, y + 2, 50, 1, 'F');
        y += 8;

        const maxVal = Math.max(...categories.map(c => c.amount), 1);
        const barColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];
        const totalExp = categories.reduce((s, c) => s + c.amount, 0) || 1;
        const barMaxW = contentW - 65;

        categories.forEach((cat, i) => {
            const barW = Math.max((cat.amount / maxVal) * barMaxW, 2);
            const pct = Math.round((cat.amount / totalExp) * 100);

            setColor('#374151');
            doc.setFontSize(8.5);
            doc.setFont('helvetica', 'normal');
            // Category name (max 18 chars)
            const name = cat.name.length > 18 ? cat.name.slice(0, 17) + '…' : cat.name;
            doc.text(name, margin, y + 5);

            // Bar background
            setFill('#f3f4f6');
            doc.roundedRect(margin + 48, y, barMaxW, 7, 1.5, 1.5, 'F');

            // Bar fill
            setFill(barColors[i % barColors.length]);
            doc.roundedRect(margin + 48, y, barW, 7, 1.5, 1.5, 'F');

            // Amount + pct
            setColor('#374151');
            doc.setFontSize(7.5);
            doc.text(`${fmtCur(cat.amount)} (${pct}%)`, margin + 48 + barMaxW + 3, y + 5.5);

            y += 11;
        });
        y += 4;
    }

    // ─── MONTHLY TREND TABLE ──────────────────────────────────────────────────
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};
    (report?.monthlyTrend || []).forEach(({ _id, total }) => {
        const key = `${_id.year}-${String(_id.month).padStart(2, '0')}`;
        if (!monthlyMap[key]) monthlyMap[key] = { label: `${MONTHS[_id.month - 1]} ${_id.year}`, income: 0, expense: 0 };
        if (_id.type === 'income') monthlyMap[key].income = total;
        else monthlyMap[key].expense = total;
    });
    const monthly = Object.values(monthlyMap);

    if (monthly.length > 0) {
        // Check if we need a new page
        if (y > 220) { doc.addPage(); y = 20; }

        setColor('#1e1b4b');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Monthly Income vs Expense', margin, y);
        setFill('#6366f1');
        doc.rect(margin, y + 2, 58, 1, 'F');
        y += 10;

        // Table header
        setFill('#6366f1');
        doc.rect(margin, y, contentW, 8, 'F');
        setColor('#ffffff');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Month', margin + 3, y + 5.5);
        doc.text('Income', margin + 50, y + 5.5);
        doc.text('Expense', margin + 95, y + 5.5);
        doc.text('Balance', margin + 140, y + 5.5);
        y += 8;

        monthly.forEach((m, i) => {
            const balance = m.income - m.expense;
            setFill(i % 2 === 0 ? '#f9f9ff' : '#ffffff');
            doc.rect(margin, y, contentW, 7, 'F');
            setDraw('#e5e7eb');
            doc.setLineWidth(0.1);
            doc.rect(margin, y, contentW, 7, 'S');

            setColor('#374151');
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(m.label, margin + 3, y + 4.8);

            setColor('#059669');
            doc.text(fmtCur(m.income), margin + 50, y + 4.8);

            setColor('#dc2626');
            doc.text(fmtCur(m.expense), margin + 95, y + 4.8);

            setColor(balance >= 0 ? '#059669' : '#dc2626');
            doc.setFont('helvetica', 'bold');
            doc.text(fmtCur(balance), margin + 140, y + 4.8);

            y += 7;
        });
        y += 6;
    }

    // ─── FOOTER ───────────────────────────────────────────────────────────────
    const pageCount = doc.getNumberOfPages();
    for (let pg = 1; pg <= pageCount; pg++) {
        doc.setPage(pg);
        const pageH = doc.internal.pageSize.getHeight();

        setFill('#1e1b4b');
        doc.rect(0, pageH - 14, W, 14, 'F');

        setColor('#a5b4fc');
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.text('DRAKZ Financial Platform — Confidential Report', margin, pageH - 5.5);
        doc.text(`Page ${pg} of ${pageCount}`, W - margin, pageH - 5.5, { align: 'right' });
    }

    // ─── SAVE ────────────────────────────────────────────────────────────────
    const safeName = (client.name || 'Client').replace(/\s+/g, '_');
    doc.save(`DRAKZ_Report_${safeName}_${today.replace(/ /g, '-')}.pdf`);
};
