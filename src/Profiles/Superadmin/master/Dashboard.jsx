import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  FaBuilding,
  FaUsers,
  FaUserFriends,
  FaBoxes,
  FaFileInvoice,
  FaShippingFast,
  FaMoneyBillWave,
  FaClipboardList,
  FaArrowUp,
} from 'react-icons/fa';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';

import { AuthContext } from '../../../context/AuthContext.jsx';
import { getData, urls } from '../../../redux/urls.jsx';

const PALETTE = [
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#10b981', // emerald
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

const fmtNum = (n) =>
  n == null
    ? '—'
    : Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : '';

const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

function KpiCard({ icon, label, value, sub, color }) {
  return (
    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
      <div className="card-body d-flex align-items-center gap-3">
        <div
          className="d-flex align-items-center justify-content-center"
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: `${color}1a`,
            color,
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div className="flex-grow-1">
          <div className="text-muted small text-uppercase fw-semibold" style={{ letterSpacing: 0.5 }}>
            {label}
          </div>
          <div className="fs-3 fw-bold lh-1 mt-1">{value}</div>
          {sub && <div className="text-muted small mt-1">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children, height = 280, right }) {
  return (
    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h6 className="mb-0 fw-bold">{title}</h6>
            {subtitle && <div className="text-muted small">{subtitle}</div>}
          </div>
          {right}
        </div>
        <div style={{ width: '100%', height }}>{children}</div>
      </div>
    </div>
  );
}

function StatusBadge({ value, type }) {
  const map = {
    po: {
      'Lock & Approved': 'success',
      Approved: 'success',
      Draft: 'secondary',
      Pending: 'warning',
      Cancelled: 'danger',
      Rejected: 'danger',
    },
    mr: {
      Full: 'success',
      Partial: 'warning',
      Not: 'secondary',
    },
  };
  const cls = map[type]?.[value] || 'info';
  return <span className={`badge bg-${cls}-subtle text-${cls} border border-${cls}-subtle`}>{value || '—'}</span>;
}

export default function Dashboard() {
  const { user, refreshUser } = useContext(AuthContext);
  const dispatch = useDispatch();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const load = async () => {
    setLoading(true);
    setError(null);
    const res = await dispatch(getData(urls.dashboard, {}));
    if (res?.success) {
      setData(res.data);
    } else {
      setError(res?.message || 'Failed to load dashboard');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kpis = data?.kpis || {};
  const counts = data?.counts || {};
  const active = data?.active_counts || {};

  const masterCards = useMemo(
    () => [
      { label: 'Companies', value: counts.companies, sub: `${active.companies ?? 0} active`, icon: <FaBuilding />, color: PALETTE[0] },
      { label: 'Vendors', value: counts.vendors, sub: `${active.vendors ?? 0} active`, icon: <FaUserFriends />, color: PALETTE[1] },
      { label: 'Products', value: counts.products, sub: `${active.products ?? 0} active`, icon: <FaBoxes />, color: PALETTE[2] },
      { label: 'Users', value: counts.users, sub: `${active.users ?? 0} active`, icon: <FaUsers />, color: PALETTE[4] },
    ],
    [counts, active],
  );

  if (loading && !data) {
    return (
      <div className="p-4 d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
        <div className="spinner-border text-warning" role="status" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-warning" onClick={load}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-0">Dashboard</h4>
          <div className="text-muted small">
            Welcome{user?.name ? `, ${user.name}` : ''} — overview of your procurement system.
          </div>
        </div>
        <button className="btn btn-outline-warning btn-sm" onClick={load} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Top KPI cards */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <KpiCard
            icon={<FaFileInvoice />}
            label="Total PIVs"
            value={fmtNum(kpis.total_pos)}
            sub={`${fmtNum(kpis.pos_last_7_days)} in last 7 days`}
            color={PALETTE[0]}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <KpiCard
            icon={<FaArrowUp />}
            label="PIVs (last 30 days)"
            value={fmtNum(kpis.pos_last_30_days)}
            sub="Rolling window"
            color={PALETTE[1]}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <KpiCard
            icon={<FaClipboardList />}
            label="Line Items"
            value={fmtNum(kpis.total_line_items_sampled)}
            sub="Across recent PIVs"
            color={PALETTE[2]}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <KpiCard
            icon={<FaMoneyBillWave />}
            label="Estimated Quotation Value"
            value={fmtNum(kpis.total_estimated_value)}
            sub="Sum across currencies"
            color={PALETTE[5]}
          />
        </div>
      </div>

      {/* Master entity cards */}
      <div className="row g-3 mb-3">
        {masterCards.map((c) => (
          <div key={c.label} className="col-6 col-md-3">
            <KpiCard {...c} value={fmtNum(c.value)} />
          </div>
        ))}
      </div>

      {/* Charts row 1: timeseries (8) + PO status pie (4) */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-xl-8">
          <ChartCard title="Performa Invoices — Last 30 Days" subtitle="Daily Quotation creation trend">
            <ResponsiveContainer>
              <AreaChart data={data?.po_timeseries || []} margin={{ left: -10, right: 10, top: 10 }}>
                <defs>
                  <linearGradient id="poGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PALETTE[0]} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={PALETTE[0]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" tickFormatter={fmtDate} fontSize={11} stroke="#999" />
                <YAxis allowDecimals={false} fontSize={11} stroke="#999" />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid #eee' }}
                  labelFormatter={(d) => fmtDate(d)}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={PALETTE[0]}
                  fill="url(#poGrad)"
                  strokeWidth={2}
                  name="POs"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className="col-12 col-xl-4">
          <ChartCard title="Quotation Status" subtitle="Distribution by status">
            <ResponsiveContainer>
              <PieChart>
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #eee' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                <Pie
                  data={data?.po_status || []}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {(data?.po_status || []).map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Charts row 2: top vendors (6) + top companies (6) */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-xl-6">
          <ChartCard title="Top Vendors" subtitle="By number of PIVs">
            <ResponsiveContainer>
              <BarChart data={data?.top_vendors || []} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
                <XAxis type="number" allowDecimals={false} fontSize={11} stroke="#999" />
                <YAxis type="category" dataKey="name" width={130} fontSize={11} stroke="#666" />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #eee' }} />
                <Bar dataKey="value" name="POs" radius={[0, 6, 6, 0]}>
                  {(data?.top_vendors || []).map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className="col-12 col-xl-6">
          <ChartCard title="Top Companies" subtitle="By number of PIVs">
            <ResponsiveContainer>
              <BarChart data={data?.top_companies || []} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
                <XAxis type="number" allowDecimals={false} fontSize={11} stroke="#999" />
                <YAxis type="category" dataKey="name" width={130} fontSize={11} stroke="#666" />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #eee' }} />
                <Bar dataKey="value" name="POs" radius={[0, 6, 6, 0]}>
                  {(data?.top_companies || []).map((_, i) => (
                    <Cell key={i} fill={PALETTE[(i + 2) % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Charts row 3: MR status radial + currency value + ship via */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6 col-xl-4">
          <ChartCard title="MR Status" subtitle="Material receipt progress">
            <ResponsiveContainer>
              <RadialBarChart
                innerRadius="25%"
                outerRadius="100%"
                data={(data?.mr_status || []).map((d, i) => ({
                  ...d,
                  fill: PALETTE[i % PALETTE.length],
                }))}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar minAngle={15} background dataKey="value" cornerRadius={6} />
                <Legend iconType="circle" verticalAlign="bottom" height={36} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #eee' }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className="col-12 col-md-6 col-xl-4">
          <ChartCard title="Value by Currency" subtitle="Estimated Quotation value">
            <ResponsiveContainer>
              <BarChart data={data?.value_by_currency || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" fontSize={11} stroke="#999" />
                <YAxis fontSize={11} stroke="#999" />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #eee' }} formatter={(v) => fmtNum(v)} />
                <Bar dataKey="value" name="Value" radius={[6, 6, 0, 0]}>
                  {(data?.value_by_currency || []).map((_, i) => (
                    <Cell key={i} fill={PALETTE[(i + 1) % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className="col-12 col-xl-4">
          <ChartCard title="Top Shipping Methods" subtitle="PIVs by ship-via" right={<FaShippingFast className="text-muted" />}>
            <ResponsiveContainer>
              <PieChart>
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #eee' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                <Pie
                  data={data?.top_shipping || []}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label={(e) => e.name}
                >
                  {(data?.top_shipping || []).map((_, i) => (
                    <Cell key={i} fill={PALETTE[(i + 3) % PALETTE.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Recent POs */}
      {/* <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 className="mb-0 fw-bold">Recent Performa Invoices</h6>
              <div className="text-muted small">Last 10 entries</div>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="text-muted small text-uppercase">
                <tr>
                  <th>Quotation #</th>
                  <th>Company</th>
                  <th>Vendor</th>
                  <th>Currency</th>
                  <th className="text-end">Value</th>
                  <th>Quotation Status</th>
                  <th>MR Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recent_pos || []).length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">
                      No purchase orders yet.
                    </td>
                  </tr>
                )}
                {(data?.recent_pos || []).map((po) => (
                  <tr key={po.po_number}>
                    <td className="fw-semibold">{po.po_number}</td>
                    <td>{po.company}</td>
                    <td>{po.vendor}</td>
                    <td>{po.currency}</td>
                    <td className="text-end">{fmtNum(po.value)}</td>
                    <td><StatusBadge type="po" value={po.po_status} /></td>
                    <td><StatusBadge type="mr" value={po.mr_status} /></td>
                    <td className="text-muted small">{fmtDateTime(po.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div> */}

      {/* Master data minor counts */}
      <div className="row g-3 mt-1">
        {[
          { label: 'Addresses', value: counts.addresses, color: PALETTE[6] },
          { label: 'Currencies', value: counts.currencies, color: PALETTE[3] },
          { label: 'Shipping', value: counts.shipping, color: PALETTE[7] },
          { label: 'Terms', value: counts.terms, color: PALETTE[5] },
          { label: 'Remarks', value: counts.remarks, color: PALETTE[1] },
        ].map((m) => (
          <div key={m.label} className="col-6 col-md-4 col-xl">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 14 }}>
              <div className="card-body py-3">
                <div className="text-muted small text-uppercase fw-semibold">{m.label}</div>
                <div className="fs-4 fw-bold" style={{ color: m.color }}>{fmtNum(m.value)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
