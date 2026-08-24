import React, { useContext, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux';
import { getData, urls } from '../../redux/urls';
import OrderTable from '../../components/OrderTable';
import ExportExcel from '../../components/ExportExcel';
import { AuthContext } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { printDocument } from '../../utils/printDocument';
import PurchaseOrderTemplate from '../../components/PurchaseOrderTemplate';
import InvoiceTemplate from '../../components/InvoiceTemplate';

export default function InvoiceReports() {
  const dispatch = useDispatch();
  const { user, refreshUser } = useContext(AuthContext);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const headers = ["Invoice Number", "Quotation Number", "Date", "Company", "Vendor", "Punched By"];
  const [loading, setLoading] = useState(false);
  const predefinedRanges = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Last 7 Days", value: "last7" },
    { label: "Last 30 Days", value: "last30" },
    { label: "This Month", value: "thisMonth" },
    { label: "Last Month", value: "lastMonth" },
  ];

  const handlePredefinedRange = (range) => {
    const today = new Date();
    let startDate, endDate;

    switch (range) {
      case "today":
        startDate = endDate = today;
        break;
      case "yesterday":
        startDate = endDate = new Date(today.setDate(today.getDate() - 1));
        break;
      case "last7":
        startDate = new Date(today.setDate(today.getDate() - 6));
        endDate = new Date();
        break;
      case "last30":
        startDate = new Date(today.setDate(today.getDate() - 29));
        endDate = new Date();
        break;
      case "thisMonth":
        startDate = new Date(today.getFullYear(), today.getMonth(), 2);
        endDate = new Date();
        break;
      case "lastMonth":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 2);
        endDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      default:
        return;
    }

    handleChange({
      target: {
        name: "startDate",
        value: startDate.toISOString().split("T")[0],
      },
    });
    handleChange({
      target: { name: "endDate", value: endDate.toISOString().split("T")[0] },
    });
  };

  const [fields, setFields] = useState({});
  const handleChange = (e) => {
    const {name, value} = e.target;
    setFields(prev => ({...prev, [name]: value}));
  };

  const [companies, setCompanies] = useState([]);
  const getCompanies = async() => {
    const res = await dispatch(getData(urls.filters, {
      filter: "company",
      fields: {status: true}
    }));
    if (res?.success) {
      setCompanies(res?.data);
    }
  };

  const [vendors, setVendors] = useState([]);
  const getVendors = async() => {
    const res = await dispatch(getData(urls.filters, {
      filter: "vendor",
      fields: {status: true}
    }));
    if (res?.success) {
      setVendors(res?.data);
    }
  };

  const [users, setUsers] = useState([]);
  const getUsers = async() => {
    const res = await dispatch(getData(urls.filters, {
      filter: "users",
      fields: {status: true}
    }));
    if (res?.success) {
      setUsers(res?.data);
    }
  };

  const handleFilterSubmit = async() => {
    const payload = {
      ...(fields?.startDate && {
        created_at__gte: `${fields.startDate} 00:00:00`
      }),
      ...(fields?.endDate && {
        created_at__lte: `${fields.endDate} 23:59:59`
      }),
      ...(fields?.po_number && { po_number: fields.po_number }),
      ...(fields?.company && { company_data__company_name: fields.company }),
      ...(fields?.vendor && { vendor_data__company_name: fields.vendor }),
      ...(fields?.employee && { punched_by__employee_code: fields.employee }),
      ...(fields?.po_status && { po_status: fields.po_status }),
      ...(fields?.mr_status && { mr_status: fields.mr_status }),
    };

    setLoading(true);
    try {
      const res = await dispatch(getData(
        urls.filters,
        {
        filter: "invoicenumbers",
        fields: payload
        }
        ));
      if (res?.success) {
        setInvoices(res?.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    getCompanies();
    getVendors();
    getUsers();
  }, []);


  const [invoices, setInvoices] = useState([]);
  const getInvoices = async() => {
    setLoading(true);
    const res = await dispatch(getData(
      urls.filters,
      {filter: "invoicenumbers"}
    ));
    if (res?.success) {
      setInvoices(res?.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    getInvoices();
  }, []);

  const pivRef = useRef(null);
  const [showPIV, setShowPIV] = useState(false);
  const [piv, setPIV] = useState({});

  const downloadPDF = async () => {
    try {
      await printDocument(pivRef, { title: piv?.po_number || "Quotation" });
    } catch (err) {
      console.error("Print failed:", err);
    }
  };


  const invoiceRef = useRef(null);
  const [showInvoice, setShowInvoice] = useState(false);

  const searchPO = async(po_number) => {
    const res = await dispatch(getData(urls.filters, {
      filter: "purchaseorders",
      fields: {po_number}
    }));
    if (res?.success) {
      setPIV(res?.data[0]);
      setShowPIV(true);
    }
  };

  const searchInvoice = async(po_number) => {
    const res = await dispatch(getData(urls.filters, {
      filter: "purchaseorders",
      fields: {po_number}
    }));
    if (res?.success) {
      setPIV(res?.data[0]);
      setShowInvoice(true);
    }
  };

  const downloadInvoice = async () => {
    try {
      await printDocument(invoiceRef, {
        title:
          invoices?.find((i) => i?.po_number === piv?.po_number)?.invoice_number ||
          piv?.po_number ||
          "Invoice",
      });
    } catch (err) {
      console.error("Print failed:", err);
    }
  };


  return (
    <div>
      <div className="card mb-4 p-3">
				<div className="row">
					<div className="col-md-3 mb-3">
						<label className="form-label m-0">Select Date Range</label>
						<select
							className="form-select"
							onChange={(e) => handlePredefinedRange(e.target.value)}
						>
							<option value="" className="text-secondary">
								Select Date Range
							</option>
							{predefinedRanges.map((range) => (
								<option key={range.value} value={range.value}>
									{range.label}
								</option>
							))}
						</select>
					</div>

					<div className="col-md-3 mb-3">
						<label className="form-label m-0">Start Date</label>
						<input
							type="date"
							className="form-control"
							max={new Date().toISOString().split("T")[0]}
							name="startDate"
							value={fields?.startDate || ""}
							onChange={handleChange}
						/>
					</div>

					<div className="col-md-3 mb-3">
						<label className="form-label m-0">End Date</label>
						<input
							type="date"
							className="form-control"
							max={new Date().toISOString().split("T")[0]}
							name="endDate"
							value={fields?.endDate || ""}
							onChange={handleChange}
						/>
					</div>
					
					<div className="col-md-3 mb-3">
						<label className='form-label m-0'>Quotation Number</label>
						<input 
							type="text" 
							className='form-control'
							name='po_number'
							value={fields?.po_number || ""}
							onChange={handleChange}
							placeholder='Quotation Number'
						/>
					</div>

					<div className="col-md-3 mb-3">
						<label className='form-label m-0'>Company</label>
						<select 
							className='form-select'
							name='company'
							value={fields?.company || ""}
							onChange={handleChange}
						>
							<option value="">Select Company</option>
							{companies?.map((c, i) => (
								<option key={i} value={c?.company_name}>{c?.company_name}</option>
							))}
						</select>
					</div>

					<div className="col-md-3 mb-3">
						<label className='form-label m-0'>Vendor</label>
						<select
							className='form-select'
							name='vendor'
							value={fields?.vendor || ""}
							onChange={handleChange}
						>
							<option value="">Select Vendor</option>
							{vendors?.map((v, i) => (
								<option key={i} value={v?.company_name}>{v?.company_name}</option>
							))}
						</select>
					</div>

					<div className="col-md-3 mb-3">
						<label className='form-label m-0'>Employee</label>
						<select
							className='form-select'
							name='employee'
							value={fields?.employee || ""}
							onChange={handleChange}
						>
							<option value="">Select Employee</option>
							{users?.map((u, i) => (
								<option key={i} value={u?.employee_code}>{u?.name} ({u?.employee_code})</option>
							))}
						</select>
					</div>

					{/* <div className="col-md-3 mb-3">
						<label className='form-label m-0'>MR Status</label>
						<select
							className='form-select'
							name='mr_status'
							value={fields?.mr_status || ""}
							onChange={handleChange}
						>
							<option value="">Select Status</option>
							{["Full", "Parcel", "Not"]?.map((status, i) => (
								<option key={i} value={status}>{status} Received</option>
							))}
						</select>
					</div> */}

					<div className="col-md-12 d-flex justify-content-end gap-3">
						<button className='btn btn-warning' onClick={() => setFields({})}>Reset</button>
						<button className='btn btn-primary' onClick={handleFilterSubmit}>Search</button>
					</div>
				</div>
			</div>

      <OrderTable
        title="All Invoices"
        headers={headers}
        data={invoices}
        loading={loading}
        user={user}
        actionButton={<ExportExcel tableId="All Invoices" />}
        actionHeaders={["Actions"]}
        actionCells={(row) => [
          <button className='btn btn-info' key={row?.id} onClick={() => searchPO(row?.po_number)}>View Quotation</button>,
          <button className='btn btn-outline-secondary' key={row?.invoice_number} onClick={() => searchInvoice(row?.po_number)}>View Invoice</button>
        ]}
      />


      <Modal
        showModal={showPIV}
        title="Quotation"
        // size='xl'
        onclose={() => {setShowPIV(false); setPIV({});}}
        content={
          <div>
            <div className="modal-content" ref={pivRef}>
              <PurchaseOrderTemplate data={piv} />
            </div>
            <div className="modal-footer">
              <button className='btn btn-primary' onClick={downloadPDF}>Generate PDF</button>
            </div>
          </div>
        }
      />

      <Modal 
        showModal={showInvoice}
        title="Purchase Invoice"
        onclose={() => {setShowInvoice(false); setPIV({});}}
        size='xl'
        content={
          <div>
            <div className="modal-body" ref={invoiceRef}>
              <InvoiceTemplate data={piv} invoices={invoices} copyLabel="Original Copy for Recipient" />
              <InvoiceTemplate data={piv} invoices={invoices} copyLabel="Duplicate Copy for Carrier" />
              <InvoiceTemplate data={piv} invoices={invoices} copyLabel="Triplicate Copy for Supplier" />
            </div>
            <div className="modal-footer">
              <button className='btn btn-primary' onClick={downloadInvoice}>Print</button>
            </div>
          </div>
        }
      />
    </div>
  )
}
