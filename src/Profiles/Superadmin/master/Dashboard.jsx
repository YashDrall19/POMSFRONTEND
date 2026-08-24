import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  FaArrowDown, FaArrowUp, FaBuilding, FaCheckCircle, FaClipboardList,
  FaClock, FaFileInvoice, FaMoneyBillWave, FaShippingFast, FaUsers,
  FaUserFriends, FaBoxes, FaExclamationTriangle,
} from 'react-icons/fa';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { AuthContext } from '../../../context/AuthContext.jsx';
import { getData, urls } from '../../../redux/urls.jsx';

const COLORS = ['#f59e0b', '#2563eb', '#10b981', '#8b5cf6', '#ef4444', '#0ea5e9', '#f97316'];
const RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 days' }, { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' }, { value: '12m', label: 'Last 12 months' },
  { value: '3y', label: 'Last 3 years' },
];
const GROUP_OPTIONS = [
  { value: 'daily', label: 'Daily' }, { value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly' },
];

const number = (value) => Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
const money = (value, currency) => `${currency || ''} ${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`.trim();
const shortDate = (value) => {
  if (!value) return '';
  const normalized = /^\d{4}$/.test(value) ? `${value}-01-01` : /^\d{4}-\d{2}$/.test(value) ? `${value}-01` : value;
  const date = new Date(`${normalized}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: value.length === 4 ? 'numeric' : undefined });
};
const percent = (value) => `${Number(value || 0).toFixed(1)}%`;

function Card({ icon, label, value, detail, color = '#2563eb' }) {
  return <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 14 }}>
    <div className="card-body d-flex gap-3 align-items-center">
      <div className="d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, borderRadius: 12, color, background: `${color}16`, fontSize: 19 }}>{icon}</div>
      <div className="min-w-0"><div className="text-muted small text-uppercase fw-semibold" style={{ letterSpacing: '.04em' }}>{label}</div><div className="fs-4 fw-bold lh-sm text-truncate">{value}</div>{detail && <div className="small text-muted text-truncate">{detail}</div>}</div>
    </div>
  </div>;
}

function Panel({ title, subtitle, action, children, height = 300 }) {
  return <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 14 }}>
    <div className="card-body"><div className="d-flex align-items-start justify-content-between gap-2 mb-3"><div><h6 className="fw-bold mb-1">{title}</h6>{subtitle && <div className="small text-muted">{subtitle}</div>}</div>{action}</div><div style={{ height, width: '100%' }}>{children}</div></div>
  </div>;
}

function EmptyChart({ message = 'No data in this period.' }) { return <div className="h-100 d-flex align-items-center justify-content-center text-muted small">{message}</div>; }
function Badge({ status }) {
  const kind = status === 'Lock & Approved' || status === 'Full' ? 'success' : status === 'Cancelled' || status === 'Rejected' ? 'danger' : status === 'Partial' ? 'warning' : 'secondary';
  return <span className={`badge bg-${kind}-subtle text-${kind} border border-${kind}-subtle`}>{status || 'Unknown'}</span>;
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user, refreshUser } = useContext(AuthContext);
  const [range, setRange] = useState('12m');
  const [groupBy, setGroupBy] = useState('monthly');
  const [currency, setCurrency] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    const response = await dispatch(getData(urls.dashboard, { range, group_by: groupBy }));
    if (response?.success) {
      setData(response.data);
      const currencies = response.data?.currency_options || response.data?.value_by_currency?.map((item) => item.name) || [];
      setCurrency((current) => currencies.includes(current) ? current : currencies[0] || '');
    } else setError(response?.message || 'Unable to load dashboard data.');
    setLoading(false);
  };

  useEffect(() => { refreshUser(); }, [refreshUser]);
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [range, groupBy]);

  const kpis = data?.kpis || {};
  const health = data?.operational_health || {};
  const selectedCurrency = currency || (data?.currency_options || [])[0];
  const amountSeries = useMemo(() => (data?.amount_timeseries || []).filter((item) => item.currency === selectedCurrency), [data, selectedCurrency]);
  const selectedCurrencyTotals = (data?.currency_summary || []).find((item) => item.currency === selectedCurrency);
  const vendorValueData = data?.vendor_value_by_currency?.[selectedCurrency] || data?.top_vendors_by_value || data?.top_vendors || [];
  const companyValueData = data?.company_value_by_currency?.[selectedCurrency] || data?.top_companies_by_value || data?.top_companies || [];
  const change = kpis.order_change_percent;
  const statusData = data?.po_status || [];
  const hasAmounts = amountSeries.some((item) => Number(item.amount) > 0);

  if (loading && !data) return <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 420 }}><div className="spinner-border text-warning" role="status" /></div>;
  if (error && !data) return <div className="alert alert-danger m-4">{error}<button className="btn btn-sm btn-outline-danger ms-3" onClick={load}>Retry</button></div>;

  return <div style={{ minHeight: '100vh', color: '#1e293b' }}>
    <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
      <div><div className="d-flex align-items-center gap-2"><h4 className="fw-bold mb-0">Business overview</h4>{loading && <span className="spinner-border spinner-border-sm text-warning" />}</div><div className="text-muted small mt-1">Welcome{user?.name ? `, ${user.name}` : ''}. Track procurement volume, value, approvals, and delivery risk.</div></div>
      <div className="d-flex gap-2 flex-wrap"><select aria-label="Dashboard date range" className="form-select form-select-sm" value={range} onChange={(event) => setRange(event.target.value)}>{RANGE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><select aria-label="Chart grouping" className="form-select form-select-sm" value={groupBy} onChange={(event) => setGroupBy(event.target.value)}>{GROUP_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><button className="btn btn-outline-secondary btn-sm" onClick={load} disabled={loading}>Refresh</button></div>
    </div>
    {error && <div className="alert alert-warning py-2 small">{error} Showing the last successful dashboard data.</div>}

    <div className="row g-3 mb-3">
      <div className="col-12 col-sm-6 col-xl-3"><Card icon={<FaFileInvoice />} label="Quotations created" value={number(kpis.orders_in_period)} detail={`${number(kpis.approved_in_period)} approved in selected period`} color="#2563eb" /></div>
      <div className="col-12 col-sm-6 col-xl-3"><Card icon={change >= 0 ? <FaArrowUp /> : <FaArrowDown />} label="Activity vs prior period" value={percent(Math.abs(change))} detail={change >= 0 ? 'Increase in quotation volume' : 'Decrease in quotation volume'} color={change >= 0 ? '#10b981' : '#ef4444'} /></div>
      <div className="col-12 col-sm-6 col-xl-3"><Card icon={<FaCheckCircle />} label="Approval rate" value={percent(kpis.approval_rate)} detail={`${number(kpis.approved_total)} approved of ${number(kpis.total_pos)} total`} color="#10b981" /></div>
      <div className="col-12 col-sm-6 col-xl-3"><Card icon={<FaClock />} label="Awaiting action" value={number(health.pending_approval)} detail={`${number(health.draft)} draft · ${number(health.receipt_pending)} awaiting receipt`} color="#f59e0b" /></div>
    </div>

    <div className="row g-3 mb-3">
      <div className="col-12 col-xl-8"><Panel title="Procurement activity" subtitle={`${GROUP_OPTIONS.find((item) => item.value === groupBy)?.label} quotation volume for the selected period`}>
        {(data?.order_timeseries || data?.po_timeseries || []).length ? <ResponsiveContainer><AreaChart data={data?.order_timeseries || data?.po_timeseries || []} margin={{ top: 10, right: 10, left: -18 }}><defs><linearGradient id="ordersGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity=".34" /><stop offset="100%" stopColor="#2563eb" stopOpacity=".02" /></linearGradient></defs><CartesianGrid vertical={false} stroke="#e8edf4" /><XAxis dataKey="period" tickFormatter={shortDate} fontSize={11} stroke="#94a3b8" /><YAxis allowDecimals={false} fontSize={11} stroke="#94a3b8" /><Tooltip labelFormatter={shortDate} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} /><Area type="monotone" dataKey="count" name="Quotations" stroke="#2563eb" strokeWidth={2.5} fill="url(#ordersGradient)" /></AreaChart></ResponsiveContainer> : <EmptyChart />}
      </Panel></div>
      <div className="col-12 col-xl-4"><Panel title="Approval pipeline" subtitle="All quotations by current status">
        {statusData.length ? <ResponsiveContainer><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3}>{statusData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} /><Legend iconType="circle" verticalAlign="bottom" height={36} /></PieChart></ResponsiveContainer> : <EmptyChart />}
      </Panel></div>
    </div>

    <div className="row g-3 mb-3">
      <div className="col-12 col-xl-8"><Panel title="Quotation amount trend" subtitle={selectedCurrency ? `Amounts are shown only in ${selectedCurrency}; currencies are never combined.` : 'No currency data available.'} action={<select aria-label="Currency for amount trend" className="form-select form-select-sm" value={selectedCurrency || ''} onChange={(event) => setCurrency(event.target.value)} disabled={!data?.currency_options?.length}>{(data?.currency_options || []).map((item) => <option key={item} value={item}>{item}</option>)}</select>}>
        {hasAmounts ? <ResponsiveContainer><BarChart data={amountSeries} margin={{ top: 10, right: 10, left: 0 }}><CartesianGrid vertical={false} stroke="#e8edf4" /><XAxis dataKey="period" tickFormatter={shortDate} fontSize={11} stroke="#94a3b8" /><YAxis tickFormatter={(value) => number(value)} fontSize={11} stroke="#94a3b8" width={68} /><Tooltip labelFormatter={shortDate} formatter={(value) => [money(value, selectedCurrency), 'Quotation value']} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} /><Bar dataKey="amount" name="Quotation value" fill="#10b981" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer> : <EmptyChart message="No quotation amounts in this currency for the selected period." />}
      </Panel></div>
      <div className="col-12 col-xl-4"><Panel title="Currency exposure" subtitle="Quoted value, kept separate by currency">
        {(data?.currency_summary || data?.value_by_currency || []).length ? <div className="h-100 overflow-auto pe-1">{(data?.currency_summary || data?.value_by_currency || []).map((item, index) => <div key={item.currency || item.name} className="d-flex justify-content-between align-items-center py-2 border-bottom"><div><span className="d-inline-block rounded-circle me-2" style={{ width: 9, height: 9, background: COLORS[index % COLORS.length] }} /><span className="fw-semibold">{item.currency || item.name}</span><div className="small text-muted ms-3">{number(item.count || 0)} quotations</div></div><div className="fw-bold text-end">{money(item.grand_total ?? item.value, item.currency || item.name)}</div></div>)}</div> : <EmptyChart />}
      </Panel></div>
    </div>

    <div className="row g-3 mb-3">
      <div className="col-12 col-lg-6"><Panel title="Highest-value vendors" subtitle={selectedCurrency ? `Approved and draft quotation value in ${selectedCurrency}` : 'By quotation value'}>
        {vendorValueData.length ? <ResponsiveContainer><BarChart data={vendorValueData} layout="vertical" margin={{ left: 15, right: 10 }}><CartesianGrid horizontal={false} stroke="#e8edf4" /><XAxis type="number" tickFormatter={number} fontSize={11} stroke="#94a3b8" /><YAxis type="category" dataKey="name" width={130} fontSize={11} stroke="#64748b" /><Tooltip formatter={(value) => [money(value, selectedCurrency), 'Quotation value']} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} /><Bar dataKey="value" name="Quotation value" fill="#8b5cf6" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer> : <EmptyChart />}
      </Panel></div>
      <div className="col-12 col-lg-6"><Panel title="Business units by value" subtitle={selectedCurrency ? `Quotation value in ${selectedCurrency}` : 'By quotation value'}>
        {companyValueData.length ? <ResponsiveContainer><BarChart data={companyValueData} layout="vertical" margin={{ left: 15, right: 10 }}><CartesianGrid horizontal={false} stroke="#e8edf4" /><XAxis type="number" tickFormatter={number} fontSize={11} stroke="#94a3b8" /><YAxis type="category" dataKey="name" width={130} fontSize={11} stroke="#64748b" /><Tooltip formatter={(value) => [money(value, selectedCurrency), 'Quotation value']} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} /><Bar dataKey="value" name="Quotation value" fill="#f59e0b" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer> : <EmptyChart />}
      </Panel></div>
    </div>

    <div className="row g-3 mb-3">
      <div className="col-12 col-xl-8"><div className="card border-0 shadow-sm h-100" style={{ borderRadius: 14 }}><div className="card-body"><div className="d-flex justify-content-between align-items-start mb-3"><div><h6 className="fw-bold mb-1">Latest quotations</h6><div className="small text-muted">The most recent activity across the business</div></div><FaClipboardList className="text-muted" /></div><div className="table-responsive"><table className="table table-sm align-middle mb-0"><thead className="small text-muted"><tr><th>Quotation</th><th>Company</th><th>Vendor</th><th className="text-end">Amount</th><th>Status</th><th>Created</th></tr></thead><tbody>{(data?.recent_pos || []).length ? data.recent_pos.map((po) => <tr key={po.po_number}><td className="fw-semibold">{po.po_number}</td><td>{po.company}</td><td>{po.vendor}</td><td className="text-end text-nowrap">{money(po.value, po.currency)}</td><td><Badge status={po.po_status} /></td><td className="small text-muted text-nowrap">{shortDate(po.created_at?.slice(0, 10))}</td></tr>) : <tr><td colSpan="6" className="text-center text-muted py-4">No quotations found.</td></tr>}</tbody></table></div></div></div></div>
      <div className="col-12 col-xl-4"><Panel title="Attention needed" subtitle="Items that need owner visibility" height={240}><div className="d-flex flex-column gap-2"><div className="border rounded-3 p-2"><FaExclamationTriangle className="text-warning me-2" /><strong>{number(health.pending_approval)}</strong><span className="small text-muted ms-2">draft quotations awaiting approval</span></div><div className="border rounded-3 p-2"><FaShippingFast className="text-primary me-2" /><strong>{number(health.receipt_pending)}</strong><span className="small text-muted ms-2">approved quotations awaiting receipt</span></div><div className="border rounded-3 p-2"><FaMoneyBillWave className="text-success me-2" /><strong>{selectedCurrencyTotals ? money(selectedCurrencyTotals.grand_total, selectedCurrency) : '—'}</strong><span className="small text-muted ms-2">quoted in selected period</span></div></div></Panel></div>
    </div>

    <div className="row g-3 pb-3">{[
      ['Companies', data?.counts?.companies, data?.active_counts?.companies, <FaBuilding />, '#2563eb'], ['Vendors', data?.counts?.vendors, data?.active_counts?.vendors, <FaUserFriends />, '#8b5cf6'], ['Products', data?.counts?.products, data?.active_counts?.products, <FaBoxes />, '#10b981'], ['Users', data?.counts?.users, data?.active_counts?.users, <FaUsers />, '#f59e0b'],
    ].map(([label, total, active, icon, color]) => <div key={label} className="col-6 col-lg-3"><Card icon={icon} label={label} value={number(total)} detail={`${number(active)} active`} color={color} /></div>)}</div>
  </div>;
}
