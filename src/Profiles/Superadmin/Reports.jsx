import React, {useEffect, useState, useContext, useRef} from 'react'
import { AuthContext } from '../../context/AuthContext.jsx'
import { useDispatch } from 'react-redux';
import { getData, postOrUpdateData, urls } from '../../redux/urls';
import ExportExcel from '../../components/ExportExcel';
import OrderTable from '../../components/OrderTable';
import { FaEdit } from 'react-icons/fa';
import Modal from '../../components/Modal';
import { FaDeleteLeft, FaNoteSticky } from 'react-icons/fa6';
import { getFormattedDate } from '../../utils/DateTime';
import PurchaseOrderTemplate from '../../components/PurchaseOrderTemplate';
import Loader from '../../components/Loader';
import { printDocument } from '../../utils/printDocument';
import * as XLSX from 'xlsx';
import Quotation from '../../components/Quotation.jsx';
import InvoiceTemplate from '../../components/InvoiceTemplate.jsx';

export default function Reports() {
	const dispatch = useDispatch();
  const { user, logout, refreshUser } = useContext(AuthContext);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);
  const headers = ["Quotation Number", "Date", "Company", "Vendor", "Total Price", "Special Discount", "Grand Total", "Quotation Status", "Punched By"];
  const [loading, setLoading] = useState(false);
	const [orders, setOrders] = useState([]);
	const getOrders = async() => {
		setLoading(true);
		const res = await dispatch(getData(
			urls.filters,
			{filter: "purchaseorders"}
		));
		if (res?.success) {
			setOrders(res?.data);
		}
		setLoading(false);
	};

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

	const predefinedRanges = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Last 7 Days", value: "last7" },
    { label: "Last 30 Days", value: "last30" },
    { label: "This Month", value: "thisMonth" },
    { label: "Last Month", value: "lastMonth" },
  ];

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
			...(fields?.startDate && {created_at__gte: fields?.startDate}),
			...(fields?.endDate && {created_at__lte: fields?.endDate}),
			...(fields?.po_number && {po_number: fields?.po_number}),
			...(fields?.company && {company_data__company_name: fields?.company}),
			...(fields?.vendor && {vendor_data__company_name: fields?.vendor}),
			...(fields?.employee && {punched_by__employee_code: fields?.employee}),
			...(fields?.po_status && {po_status: fields?.po_status}),
			...(fields?.mr_status && {mr_status: fields?.mr_status}),
		};

		setLoading(true);
		try {
			const res = await dispatch(getData(
				urls.filters,
				{
				filter: "purchaseorders",
				fields: payload
				}
				));
			if (res?.success) {
				setOrders(res?.data);
			}
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	const pivRef = useRef(null);
	const invoiceRef = useRef(null);

  // const downloadPDF = async () => {
  //   const element = pivRef.current;

  //   if (!element) return;

  //   try {
  //     const dataUrl = await toPng(element, {
  //       cacheBust: true,
  //       pixelRatio: 2,
  //     });

  //     const pdf = new jsPDF("p", "mm", "a4");
  //     const pdfWidth = pdf.internal.pageSize.getWidth();
  //     const pdfHeight = pdf.internal.pageSize.getHeight();
  //     const margin = 0;

  //     const img = new Image();
  //     img.src = dataUrl;

  //     img.onload = () => {
  //       const imgWidth = img.width;
  //       const imgHeight = img.height;
  //       const availableWidth = pdfWidth - 2 * margin;
  //       const ratio = availableWidth / imgWidth;
  //       const scaledWidth = imgWidth * ratio;
  //       const scaledHeight = imgHeight * ratio;
  //       const availableHeight = pdfHeight - 2 * margin;
  //       const numPages = Math.ceil(scaledHeight / availableHeight);

  //       for (let i = 0; i < numPages; i++) {
  //         if (i > 0) {
  //           pdf.addPage();
  //         }
  //         const yOffset = i * availableHeight;
  //         pdf.addImage(
  //           dataUrl,
  //           "PNG",
  //           margin,
  //           margin - yOffset * (scaledHeight / (availableHeight * numPages)),
  //           scaledWidth,
  //           scaledHeight
  //         );
  //       }
  //       pdf.save(`${piv?.po_number}.pdf`);
  //     };
  //   } catch (err) {
  //     console.error("PDF generation failed:", err);
  //   }
  // };

	// const downloadInvoice = async () => {
  //   const element = invoiceRef.current;

  //   if (!element) return;

  //   try {
  //     const dataUrl = await toPng(element, {
  //       cacheBust: true,
  //       pixelRatio: 2,
  //     });

  //     const pdf = new jsPDF("p", "mm", "a4");
  //     const pdfWidth = pdf.internal.pageSize.getWidth();
  //     const pdfHeight = pdf.internal.pageSize.getHeight();
  //     const margin = 0;

  //     const img = new Image();
  //     img.src = dataUrl;

  //     img.onload = () => {
  //       const imgWidth = img.width;
  //       const imgHeight = img.height;
  //       const availableWidth = pdfWidth - 2 * margin;
  //       const ratio = availableWidth / imgWidth;
  //       const scaledWidth = imgWidth * ratio;
  //       const scaledHeight = imgHeight * ratio;
  //       const availableHeight = pdfHeight - 2 * margin;
  //       const numPages = Math.ceil(scaledHeight / availableHeight);

  //       for (let i = 0; i < numPages; i++) {
  //         if (i > 0) {
  //           pdf.addPage();
  //         }
  //         const yOffset = i * availableHeight;
  //         pdf.addImage(
  //           dataUrl,
  //           "PNG",
  //           margin,
  //           margin - yOffset * (scaledHeight / (availableHeight * numPages)),
  //           scaledWidth,
  //           scaledHeight
  //         );
  //       }
  //       pdf.save(`${piv?.po_number}.pdf`);
  //     };
  //   } catch (err) {
  //     console.error("PDF generation failed:", err);
  //   }
  // };

	const downloadPDF = async () => {
		try {
			await printDocument(pivRef, { title: piv?.po_number || "Quotation" });
		} catch (err) {
			console.error("Print failed:", err);
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

	const [showModal, setShowModal] = useState(false);
	const [piv, setPIV] = useState({});

	const [showQuotation, setShowQuotation] = useState(false);

	const [showUpdate, setShowUpdate] = useState(false);

	const handleUpdate = async(status) => {
		const res = await dispatch(postOrUpdateData(
			urls.edit,
			{filter: "purchaseorders", id: piv?.id, data: {po_status: status}}
		));
		if (res?.success) {
			setPIV({});
			setShowUpdate(false);
			getOrders();
		}
	}

	const [showConfirmation, setShowConfirmation] = useState(false);
	const [showInvoice, setShowInvoice] = useState(false);

	const [invoices, setInvoices] = useState([]);
	const getInvoices = async() => {
		const res = await dispatch(getData(
			urls.filters,
			{filter: "invoicenumbers"}
		));
		if (res?.success) {
			setInvoices(res?.data);
		}
	}

	const generateInvoice = async() => {
		const res = await dispatch(postOrUpdateData(
			urls.addinvoice,
			{po_number: piv?.po_number, company_data: piv?.company_data, vendor_data: piv?.vendor_data, punched_by: piv?.punched_by}
		));
		if (res?.success) {
			getOrders();
			getInvoices();
			setShowInvoice(true);
			setShowConfirmation(false);
		}
	};

	useEffect(() => {
		getCompanies();
		getVendors();
		getUsers();
		getOrders();
		getInvoices();
	}, []);

	const isPIVGenerated = (po_number) => {
		const res = invoices?.find(i => i?.po_number === po_number);
		if (!!res) {
			return true;
		}
		return false;
	}

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

					<div className="col-md-3 mb-3">
						<label className='form-label m-0'>Quotation Status</label>
						<select
							className='form-select'
							name='po_status'
							value={fields?.po_status || ""}
							onChange={handleChange}
						>
							<option value="">Select Status</option>
							{["Lock & Approved", "Draft", "Cancelled"]?.map((status, i) => (
								<option key={i} value={status}>{status}</option>
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
				title="All Quotations"
				headers={headers}
				data={orders}
				loading={loading}
				actionButton={<ExportExcel tableId="All Quotations" />}
				actionHeaders={["Actions"]}
				actionCells={(row) => [
					<button className='btn btn-info' key={row?.po_number} onClick={() => {setShowModal(true);setPIV(row);}}>View</button>,
					<button className='btn btn-outline-success' key={row?.id} onClick={() => {setShowUpdate(true);setPIV(row);}}>Update Status</button>,
					<button className='btn btn-secondary' key={row?.po_number} 
						onClick={() => {
							setPIV(row);
							isPIVGenerated(row?.po_number) ? setShowInvoice(true) : setShowConfirmation(true);
						}}
					>
							{/* {setShowConfirmation(true); setPIV(row);} */}
						{isPIVGenerated(row?.po_number) ? "View Invoice" : "Generate Invoice"}
					</button>
				]}
			/>

			<Modal 
				showModal={showModal}
				title="Quotation Invoice"
				// size='xl'
				onclose={() => setShowModal(false)}
				content={
					<div>
						<div className="modal-content" ref={pivRef}>
							<PurchaseOrderTemplate data={piv} />
						</div>
						<div className="modal-footer">
							<button className='btn btn-primary' onClick={downloadPDF}>Generate PDF</button>
							<button className='btn btn-success' onClick={() => setShowQuotation(true)}>Generate Excel</button>
						</div>
					</div>
				}
			/>

			<Modal 
				showModal={showQuotation}
				title="Quotation"
				onclose={() => setShowQuotation(false)}
				size='xl'
				content={<Quotation data={piv} />}
			/>

			<Modal 
				showModal={showUpdate}
				title="Update Status"
				onclose={() => setShowUpdate(false)}
				content={
					<div>
						<div className="modal-body">
							Please select an option below to update Quotation Status.
						</div>
						<div className="modal-footer">
							{piv?.po_status !== "Draft" && <button className='btn btn-warning' onClick={() => handleUpdate("Draft")}>Draft</button>}
							{piv?.po_status !== "Cancelled" && <button className='btn btn-danger' onClick={() => handleUpdate("Cancelled")}>Cancel</button>}
							{piv?.po_status !== "Lock & Approved" && <button className='btn btn-success' onClick={() => handleUpdate("Lock & Approved")}>Lock & Approved</button>}
						</div>
					</div>
				}
			/>

			<Modal 
				showModal={showConfirmation}
				title="Generate Invoice"
				onclose={() => setShowConfirmation(false)}
				content={
					<div>
						<div className="modal-body">
							Generate Invoice for {piv?.po_number}?
						</div>
						<div className="modal-footer">
							<button className='btn btn-primary' onClick={generateInvoice}>Yes</button>
							<button className='btn btn-danger' onClick={() => {setShowConfirmation(false); setPIV({});}}>No</button>
						</div>
					</div>
				}
			/>

			<Modal 
				showModal={showInvoice}
				title="Purchase Invoice"
				onclose={() => setShowInvoice(false)}
				size='xl'
				content={
					<div>
						<div className="modal-body" ref={invoiceRef}>
							<InvoiceTemplate data={piv} invoices={invoices} />
						</div>
						<div className="modal-footer">
							<button className='btn btn-primary' onClick={downloadInvoice}>Print</button>
							<button className='btn btn-secondary' onClick={() => setShowInvoice(false)}>Close</button>
						</div>
					</div>
				}
			/>

			
    </div>
  )
}
