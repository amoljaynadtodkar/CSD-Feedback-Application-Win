import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
    Upload, FileText, AlertTriangle, TrendingUp, Users, DollarSign,
    Search, ShieldAlert, Clock, CheckCircle, XCircle,
    ChevronDown, ChevronRight, Printer
} from 'lucide-react';
import { api } from '@/lib/api';

const TransactionsAnalysis = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [isRapidExpanded, setIsRapidExpanded] = useState(false);
    const [isHighValueExpanded, setIsHighValueExpanded] = useState(false);
    const [isFrequentExpanded, setIsFrequentExpanded] = useState(false);
    const [isIssuesExpanded, setIsIssuesExpanded] = useState(false);
    const [expandedUserInfo, setExpandedUserInfo] = useState({});
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [isFiltering, setIsFiltering] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        // Parse YYYY-MM-DD manually to avoid timezone shifts
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const year = parts[0];
            const monthIdx = parseInt(parts[1]) - 1;
            const day = parts[2];
            const date = new Date(year, monthIdx, day);
            const d = String(date.getDate()).padStart(2, '0');
            const m = date.toLocaleString('default', { month: 'short' });
            const y = String(date.getFullYear()).slice(-2);
            return `${d} ${m} ${y}`;
        }
        // Fallback for other formats
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' });
        const year = String(date.getFullYear()).slice(-2);
        return `${day} ${month} ${year}`;
    };

    const formatCurrency = (amount) => {
        const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num || 0);
    };

    const FORENSIC_COLORS = {
        'DEBIT': '#3b82f6',  // Blue
        'CREDIT': '#ef4444', // Red
        'UPI': '#10b981'    // Emerald
    };

    const handleFileUpload = async (event, customFrom = null, customTo = null) => {
        const selectedFile = event?.target?.files?.[0] || file;
        if (!selectedFile) return;

        if (event?.target?.files?.[0]) {
            setFile(selectedFile);
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', selectedFile);
        if (customFrom || dateRange.from) formData.append('date_from', customFrom || dateRange.from);
        if (customTo || dateRange.to) formData.append('date_to', customTo || dateRange.to);

        try {
            const token = localStorage.getItem("authToken");
            const result = await api.postFile('/analyze-transactions', formData, token);
            setData(result);
            // Initialize filter dates from server's full range if not set
            if (!dateRange.from && result.available_range) {
                setDateRange({
                    from: result.available_range.min,
                    to: result.available_range.max
                });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setIsFiltering(false);
        }
    };

    const applyFilters = () => {
        setIsFiltering(true);
        handleFileUpload(null);
    };

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-8">
                <div className="max-w-xl w-full text-center space-y-8 bg-white p-12 rounded-[2.5rem] shadow-2xl border border-slate-100">
                    <div className="bg-emerald-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Upload size={48} className="text-emerald-600" />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Upload Transaction Data</h2>
                        <p className="text-slate-500 text-lg">Select your <span className="font-bold text-emerald-600">Transaction Report .csv file</span> to generate forensic insights</p>
                    </div>

                    <label className="relative group block">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <div className="flex items-center justify-center gap-4 bg-slate-900 text-white px-8 py-6 rounded-2xl cursor-pointer hover:bg-slate-800 transition-all shadow-xl hover:shadow-slate-200 group-hover:scale-[1.02] active:scale-95 duration-200">
                            <FileText size={24} />
                            <span className="text-xl font-bold">{loading ? 'Processing Analysis...' : 'Browse Local Files'}</span>
                        </div>
                    </label>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3">
                            <AlertTriangle size={20} />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    const pieData = data?.stats ? Object.keys(data.stats).map(key => ({
        name: key,
        value: data.stats[key].amount
    })) : [];

    return (
        <div className="p-8 space-y-8 bg-[#f8fafc] min-h-screen">
            {/* Top Bar & Filters */}
            <div className="flex flex-col items-center gap-6">
                <div className="text-center">
                    <h1 className="text-5xl font-black text-slate-900 leading-tight">Transaction Forensic Audit</h1>
                    <p className="text-slate-500 font-medium">Viewing Data: <span className="text-slate-900 font-bold">{formatDate(data.date_range.start)}</span> {data.date_range.start === data.date_range.end ? "" : <span className="text-slate-900 font-bold">to {formatDate(data.date_range.end)}</span>} </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 px-3">
                        <Clock size={16} className="text-slate-400" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Analysis Period:</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={dateRange.from}
                            min={data.available_range?.min}
                            max={data.available_range?.max}
                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                            className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                        />
                        <span className="text-slate-300 font-bold">to</span>
                        <input
                            type="date"
                            value={dateRange.to}
                            min={data.available_range?.min}
                            max={data.available_range?.max}
                            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                            className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                        />
                    </div>
                    <button
                        onClick={applyFilters}
                        disabled={loading || isFiltering}
                        className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isFiltering ? 'Filtering...' : 'Apply Filter'}
                    </button>
                    <div className="w-px h-8 bg-slate-100 mx-2" />
                    <button
                        onClick={() => { setData(null); setFile(null); setDateRange({ from: '', to: '' }); }}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        title="New Upload"
                    >
                        <Upload size={20} />
                    </button>
                    <button
                        onClick={handlePrint}
                        className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100"
                        title="Export to PDF / Print Report"
                    >
                        <Printer size={20} />
                    </button>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 20mm; size: A4; }
                    aside, button, .no-print, [title="New Upload"], [title*="Export"] { display: none !important; }
                    main { padding: 0 !important; margin: 0 !important; background: white !important; }
                    .p-8 { padding: 0 !important; }
                    .bg-[#f8fafc] { background: white !important; }
                    .shadow-sm, .shadow-2xl { shadow: none !important; border: 1px solid #e2e8f0 !important; }
                    .rounded-[2.5rem], .rounded-[2rem], .rounded-3xl { border-radius: 8px !important; }
                    .max-h-0 { max-height: none !important; opacity: 1 !important; visibility: visible !important; display: block !important; }
                    .overflow-x-auto { overflow: visible !important; }
                    .animate-in { animation: none !important; }
                    tr { page-break-inside: avoid; }
                    .bg-white { background: white !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .bg-slate-50\\/50 { background-color: #f8fafc !important; }
                }
            `}} />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', value: `₹${formatCurrency(data?.total_revenue)}`, icon: DollarSign, color: 'emerald' },
                    { label: 'Transactions', value: data?.total_transactions || 0, icon: Users, color: 'blue' },
                    { label: 'Avg. Transaction', value: `₹${formatCurrency(data?.total_transactions > 0 ? (data.total_revenue / data.total_transactions) : 0)}`, icon: TrendingUp, color: 'indigo' },
                    { label: 'Success Rate', value: `${data?.total_transactions > 0 ? (((data.total_transactions - data.expired_cancelled.length) / data.total_transactions) * 100).toFixed(1) : 0}%`, icon: CheckCircle, color: 'emerald' },
                    { label: 'High Value Profiles', value: data?.high_value_analysis?.length || 0, icon: ShieldAlert, color: 'rose' },
                    { label: 'Frequent Profiles', value: data?.frequent_analysis?.length || 0, icon: Users, color: 'cyan' },
                    { label: 'Rapid Activity', value: data?.rapid_use?.length || 0, icon: Clock, color: 'amber' },
                    { label: 'Session Issues', value: data?.expired_cancelled?.length || 0, icon: AlertTriangle, color: 'rose' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-4`}>
                            <stat.icon size={24} />
                        </div>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.15em]">{stat.label}</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Revenue Breakdown - Full Width */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-8">Revenue Split</h3>
                <div className="flex flex-col md:flex-row items-center gap-12 flex-1">
                    <div className="h-64 w-full md:w-1/2">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={FORENSIC_COLORS[entry.name] || '#94a3b8'} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full md:w-1/2 space-y-3">
                        {Object.entries(data.stats).map(([key, val], i) => (
                            <div key={key} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: FORENSIC_COLORS[key] || '#94a3b8' }}></div>
                                    <div>
                                        <p className="font-bold text-slate-800 leading-none">{key}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-tighter">{val.count} Transactions</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-900 text-lg">₹{formatCurrency(val.amount)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Analysis I: High Value Users - Expandable */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
                <button
                    onClick={() => setIsHighValueExpanded(!isHighValueExpanded)}
                    className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-50 rounded-2xl text-rose-500">
                            <DollarSign size={28} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl font-bold text-slate-900">High Value Transactions</h3>
                            <p className="text-slate-500 text-sm font-medium">Individual transactions above ₹15,000</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="bg-rose-100 text-rose-700 px-4 py-1 rounded-full font-black text-sm">
                            {data?.high_value_analysis?.length || 0} Users Detected
                        </span>
                        <div className={`transition-transform duration-300 ${isHighValueExpanded ? 'rotate-180' : ''}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                    </div>
                </button>

                <div className={`transition-all duration-700 ease-in-out ${isHighValueExpanded ? 'max-h-[50000px] opacity-100 p-8 pt-0' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                                    <th className="pb-4">Name</th>
                                    <th className="pb-4">Card Number/ UPI ID</th>
                                    <th className="pb-4">Type</th>
                                    <th className="pb-4">No of Txns</th>
                                    <th className="pb-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {data?.high_value_analysis?.filter(u =>
                                    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    u.payment_mode_id.toLowerCase().includes(searchTerm.toLowerCase())
                                ).sort((a, b) => b.high_value_count - a.high_value_count).map((user, i) => {
                                    const isUserExpanded = expandedUserInfo[`high_${user.payment_mode_id}`];
                                    return (
                                        <React.Fragment key={i}>
                                            <tr className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-5 font-bold text-slate-900">{user.name}</td>
                                                <td className="py-5 text-slate-500 font-mono text-xs">{user.payment_mode_id}</td>
                                                <td className="py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${user.card_type === 'DEBIT' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                        user.card_type === 'CREDIT' ? 'bg-red-50 text-red-600 border-red-100' :
                                                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                        }`}>
                                                        {user.card_type}
                                                    </span>
                                                </td>
                                                <td className="py-5">
                                                    <span className="bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                        {user.high_value_count}
                                                    </span>
                                                </td>
                                                <td className="py-5 text-right">
                                                    <button
                                                        onClick={() => setExpandedUserInfo(prev => ({
                                                            ...prev,
                                                            [`high_${user.payment_mode_id}`]: !prev[`high_${user.payment_mode_id}`]
                                                        }))}
                                                        className={`p-2 rounded-xl transition-all ${isUserExpanded ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                                    >
                                                        {isUserExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr className={`${isUserExpanded ? 'table-row' : 'hidden'} print:table-row`}>
                                                <td colSpan="5" className="py-4 px-2">
                                                    <div className="bg-slate-50/50 rounded-[2rem] p-6 space-y-4 border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Records</h5>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {user.high_value_transactions.map((txn, j) => (
                                                                <div key={j} className="flex items-center justify-between text-sm bg-white p-4 rounded-3xl shadow-sm border border-slate-50 hover:border-rose-100 transition-all">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600">
                                                                            <DollarSign size={16} />
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-black text-slate-900 leading-none mb-1">₹{formatCurrency(txn["Transaction Amount"])}</p>
                                                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{txn["Transaction Date"]}</p>
                                                                        </div>
                                                                    </div>
                                                                    {txn["Transaction Status"] === 'Success' ? (
                                                                        <CheckCircle size={14} className="text-emerald-500" />
                                                                    ) : (
                                                                        <XCircle size={14} className="text-rose-500" />
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Analysis II: Frequent Users - Expandable */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
                <button
                    onClick={() => setIsFrequentExpanded(!isFrequentExpanded)}
                    className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-500">
                            <TrendingUp size={28} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl font-bold text-slate-900">Frequent User Activity</h3>
                            <p className="text-slate-500 text-sm font-medium">Profiles with 2 or more transactions</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full font-black text-sm">
                            {data?.frequent_analysis?.length || 0} Profiles Found
                        </span>
                        <div className={`transition-transform duration-300 ${isFrequentExpanded ? 'rotate-180' : ''}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                    </div>
                </button>

                <div className={`transition-all duration-700 ease-in-out ${isFrequentExpanded ? 'max-h-[50000px] opacity-100 p-8 pt-0' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                                    <th className="pb-4">Name</th>
                                    <th className="pb-4">Card Number/ UPI ID</th>
                                    <th className="pb-4">Type</th>
                                    <th className="pb-4">Activity</th>
                                    <th className="pb-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {data?.frequent_analysis?.filter(u =>
                                    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    u.payment_mode_id.toLowerCase().includes(searchTerm.toLowerCase())
                                ).sort((a, b) => b.total_transactions - a.total_transactions).map((user, i) => {
                                    const isUserExpanded = expandedUserInfo[`freq_${user.payment_mode_id}`];
                                    return (
                                        <React.Fragment key={i}>
                                            <tr className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-5 font-bold text-slate-900">{user.name}</td>
                                                <td className="py-5 text-slate-500 font-mono text-xs">{user.payment_mode_id}</td>
                                                <td className="py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${user.card_type === 'DEBIT' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                        user.card_type === 'CREDIT' ? 'bg-red-50 text-red-600 border-red-100' :
                                                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                        }`}>
                                                        {user.card_type}
                                                    </span>
                                                </td>
                                                <td className="py-5">
                                                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                        {user.total_transactions} Transactions
                                                    </span>
                                                </td>
                                                <td className="py-5 text-right">
                                                    <button
                                                        onClick={() => setExpandedUserInfo(prev => ({
                                                            ...prev,
                                                            [`freq_${user.payment_mode_id}`]: !prev[`freq_${user.payment_mode_id}`]
                                                        }))}
                                                        className={`p-2 rounded-xl transition-all ${isUserExpanded ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                                    >
                                                        {isUserExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr className={`${isUserExpanded ? 'table-row' : 'hidden'} print:table-row`}>
                                                <td colSpan="5" className="py-4 px-2">
                                                    <div className="bg-slate-50/50 rounded-[2rem] p-6 space-y-4 border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Complete History</h5>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {user.transactions.map((txn, j) => (
                                                                <div key={j} className="flex items-center justify-between text-sm bg-white p-4 rounded-3xl shadow-sm border border-slate-50 hover:border-emerald-100 transition-all">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className={`p-2.5 rounded-2xl ${txn["Transaction Status"] === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                                            {txn["Transaction Status"] === 'Success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-black text-slate-900 leading-none mb-1">₹{formatCurrency(txn["Transaction Amount"])}</p>
                                                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{txn["Transaction Date"]}</p>
                                                                        </div>
                                                                    </div>
                                                                    {txn["Transaction Status"] === 'Success' ? (
                                                                        <CheckCircle size={14} className="text-emerald-500" />
                                                                    ) : (
                                                                        <XCircle size={14} className="text-rose-500" />
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Suspicious Rapid Use - Below Frequent Users, Expandable */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
                <button
                    onClick={() => setIsRapidExpanded(!isRapidExpanded)}
                    className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 rounded-2xl text-amber-500">
                            <ShieldAlert size={28} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl font-bold text-slate-900">Rapid Activity Analysis</h3>
                            <p className="text-slate-500 text-sm font-medium">Detection of transactions within 2 minutes</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="bg-amber-100 text-amber-700 px-4 py-1 rounded-full font-black text-sm">
                            {data.rapid_use.length} Flags Detected
                        </span>
                        <div className={`transition-transform duration-300 ${isRapidExpanded ? 'rotate-180' : ''}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                    </div>
                </button>

                <div className={`transition-all duration-500 ease-in-out ${isRapidExpanded ? 'max-h-[10000px] opacity-100 p-8 pt-0 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-slate-400 text-xs font-black uppercase tracking-[0.2em] border-b border-slate-50">
                                    <th className="pb-6">Customer Name</th>
                                    <th className="pb-6">Payment Method ID</th>
                                    <th className="pb-6">Transaction Amount</th>
                                    <th className="pb-6">Time Separation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {data.rapid_use.length > 0 ? data.rapid_use.map((item, i) => (
                                    <tr key={i} className="hover:bg-amber-50/50 transition-colors">
                                        <td className="py-6 font-bold text-slate-900">{item.Name}</td>
                                        <td className="py-6 text-slate-500 font-mono tracking-tighter">{item["Customer Payment Mode ID"]}</td>
                                        <td className="py-6">
                                            <span className="text-lg font-black text-slate-900">₹{formatCurrency(item["Transaction Amount"])}</span>
                                        </td>
                                        <td className="py-6">
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} className="text-amber-500" />
                                                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-xs font-black">
                                                    {Math.round(item.time_diff_sec)} seconds
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="py-12 text-center text-slate-400 font-bold">No rapid use detected in this dataset</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Expired / Cancelled Analysis - Expandable */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 border-l-4 border-l-rose-500 overflow-hidden transition-all duration-300">
                <button
                    onClick={() => setIsIssuesExpanded(!isIssuesExpanded)}
                    className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-50 rounded-2xl text-rose-500">
                            <AlertTriangle size={28} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl font-bold text-slate-900">Session Issues Analysis</h3>
                            <p className="text-slate-500 text-sm font-medium">Expired or manually cancelled transactions</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="bg-rose-100 text-rose-700 px-4 py-1 rounded-full font-black text-sm">
                            {data.expired_cancelled.length} Issues Logged
                        </span>
                        <div className={`transition-transform duration-300 ${isIssuesExpanded ? 'rotate-180' : ''}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                    </div>
                </button>

                <div className={`transition-all duration-500 ease-in-out ${isIssuesExpanded ? 'max-h-[10000px] opacity-100 p-8 pt-0' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-slate-400 text-sm font-bold uppercase tracking-widest border-b border-slate-50">
                                    <th className="pb-4 px-2">Customer</th>
                                    <th className="pb-4 px-2">Amount</th>
                                    <th className="pb-4 px-2">Date</th>
                                    <th className="pb-4 px-2">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {data.expired_cancelled.filter(u =>
                                    u.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    u["Customer Payment Mode ID"].toLowerCase().includes(searchTerm.toLowerCase())
                                ).map((item, i) => (
                                    <tr key={i} className="hover:bg-rose-50/20 transition-colors">
                                        <td className="py-4 px-2">
                                            <div className="font-bold text-slate-900">{item.Name}</div>
                                            <div className="text-xs text-slate-400 font-mono">{item["Customer Payment Mode ID"]}</div>
                                        </td>
                                        <td className="py-4 px-2 font-black text-slate-700">₹{formatCurrency(item["Transaction Amount"])}</td>
                                        <td className="py-4 px-2 text-slate-500">{item["Transaction Date"]}</td>
                                        <td className="py-4 px-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-black ${item["Transaction Status"] === 'User Cancelled' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                {item["Transaction Status"]}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default TransactionsAnalysis;
