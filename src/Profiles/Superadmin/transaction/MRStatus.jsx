import React, {useEffect, useState, useContext} from 'react'
import { AuthContext } from '../../../context/AuthContext.jsx'
import { useDispatch } from 'react-redux';
import { getData, postOrUpdateData, urls } from '../../../redux/urls';
import ExportExcel from '../../../components/ExportExcel';
import OrderTable from '../../../components/OrderTable';
import { FaEdit } from 'react-icons/fa';
import Modal from '../../../components/Modal';
import { FaDeleteLeft, FaNoteSticky } from 'react-icons/fa6';
import { getFormattedDate } from '../../../utils/DateTime';
import PurchaseOrderTemplate from '../../../components/PurchaseOrderTemplate';
import Loader from '../../../components/Loader';

export default function MRStatus() {
	const dispatch = useDispatch();
  const { user, logout, refreshUser } = useContext(AuthContext);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);
  const headers = ["po_number", "Date", "Company", "Vendor", "PO Status", "MR Status", "Punched By"];
  const [loading, setLoading] = useState(false);
	const [orders, setOrders] = useState([]);
	const getOrders = async() => {
		setLoading(true);
		const res = await dispatch(getData(
			urls.filters,
			{filter: "purchaseorders", fields: {po_status: "Lock & Approved", mr_status: "Not"}}
		));
		if (res?.success) {
			setOrders(res?.data);
		}
		setLoading(false);
	};

	useEffect(() => {
		getOrders();
	}, []);


	const [showModal, setShowModal] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState({});
	const [renderPO, setRenderPO] = useState(false);

	const [showConfirm, setShowConfirm] = useState(false);
	const [status, setStatus] = useState("");

	const handleEditOrder = async() => {
		const res = await dispatch(postOrUpdateData(
			urls.edit,
			{
				filter: "PurchaseOrders",
				id: selectedOrder?.id,
				data: {mr_status: status}
			}
		));
		if (res?.success) {
			setStatus("");
			setShowConfirm(false);
			setSelectedOrder({});
			setShowModal(false);
			getOrders();
		}
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
		const res = await dispatch(getData(
			urls.filters,
			{
				filter: "company",
				fields: {status: true}
			}
		));
		if (res?.success) {
			setCompanies(res?.data);
		}
	};

	const [vendors, setVendors] = useState([]);
	const getVendors = async() => {
		const res = await dispatch(getData(
			urls.filters,
			{
				filter: "vendor",
				fields: {status: true}
			}
		));
		if (res?.success) {
			setVendors(res?.data);
		}
	};

	const [users, setUsers] = useState([]);
	const getUsers = async() => {
		const res = await dispatch(getData(
			urls.filters,
			{
				filter: "users",
				fields: {status: true}
			}
		));
		if (res?.success) {
			setUsers(res?.data);
		}
	};

	useEffect(() => {
		getCompanies();
		getVendors();
		getUsers();
	}, []);

	const handleFilterSubmit = async() => {
		const payload = {
			...(fields?.startDate && {created_at__gte: new Date(new Date(fields.startDate).getTime() - 5.5 * 60 * 60 * 1000).toISOString()}),
			...(fields?.endDate && {created_at__lte: new Date(new Date(fields.endDate).getTime() +(24 * 60 * 60 * 1000 - 1000) -5.5 * 60 * 60 * 1000).toISOString()}),
			...(fields?.po_number && {po_number: fields?.po_number}),
			...(fields?.company && {company_data__company_name: fields?.company}),
			...(fields?.vendor && {vendor_data__company_name: fields?.vendor}),
			...(fields?.employee && {punched_by__employee_code: fields?.employee}),
			...(fields?.po_status && {po_status: fields?.po_status}),
			...(fields?.mr_status && {mr_status: fields?.mr_status}),
			mr_status: "Not",
			po_status: "Lock & Approved"
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
							max={new Date().toISOString().split("T")[0]} // Restrict future dates
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
							{companies?.map((c, i) => {
								return (
									<option key={i} value={c?.company_name}>{c?.company_name}</option>
								)
							})}
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
							{vendors?.map((v, i) => {
								return (
									<option key={i} value={v?.company_name}>{v?.company_name}</option>
								)
							})}
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
							{users?.map((u, i) => {
								return (
									<option key={i} value={u?.employee_code}>{u?.name} ({u?.employee_code})</option>
								)
							})}
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
							{["Lock & Approved", "Draft", "Cancelled"]?.map((status, i) => {
								return (
									<option key={i} value={status}>{status}</option>
								)
							})}
						</select>
					</div>

					<div className="col-md-3 mb-3">
						<label className='form-label m-0'>MR Status</label>
						<select
							className='form-select'
							name='mr_status'
							value={fields?.mr_status || ""}
							onChange={handleChange}
						>
							<option value="">Select Status</option>
							{["Full", "Parcel", "Not"]?.map((status, i) => {
								return (
									<option key={i} value={status}>{status} Received</option>
								)
							})}
						</select>
					</div>

					<div className="col-md-12 d-flex justify-content-end gap-3">
						<button className='btn btn-warning' onClick={() => setFields({})}>Reset</button>
						<button className='btn btn-primary' onClick={handleFilterSubmit}>Search</button>
					</div>
				</div>
			</div>

			<OrderTable 
				title="Approved Invoices"
				headers={headers}
				data={orders}
				loading={loading}
				actionButton={<ExportExcel tableId="Approved Invoices" />}
				actionHeaders={["Actions"]}
				actionCells={(row) => [
					<button className="btn btn-outline-info" title='Update MR Status' onClick={() => {setShowModal(true); setSelectedOrder(row);}}>Update</button>,
					// <button className="btn btn-info" title='View Quotation' onClick={() => {setRenderPO(true); setSelectedOrder(row);}}>View</button>
				]}
			/>

			<Modal 
				title="Update Invoice"
				onclose={() => setShowModal(false)}
				showModal={showModal}
				size='xl'
				content={<div>
					<div className="modal-body row">
						{/* <div className="col-md-6">
							<label className='form-label'>PO Number</label>
							<input 
								type="text" 
								className='form-control'
								value={selectedOrder?.po_number || ""}
								disabled
							/>
						</div>
						<div className="col-md-6">
							<label className='form-label'>Date</label>
							<input 
								type="text" 
								className='form-control'
								value={getFormattedDate(selectedOrder?.created_at) || ""}
								disabled
							/>
						</div> */}
						{/* <div className="col-md-6">
							<label className='form-label'>PO Status</label>
							<select
								className='form-select'
								value={selectedOrder?.po_status || ""}
							>
								<option value="">Select an option</option>
								<option value="Draft">Draft</option>
								<option value="Lock & Approved">Lock & Approved</option>
								<option value="">Select an option</option>
							</select>
						</div> */}
						<div className=''>
							{/* <h4 className='text-center'>Preview</h4> */}
							<PurchaseOrderTemplate data={selectedOrder} />
						</div>
					</div>
					<div className='modal-footer'>
						<div className="btn btn-success" onClick={() => {setShowConfirm(true); setStatus("Full")}}>Full Received</div>
						<div className="btn btn-warning" onClick={() => {setShowConfirm(true); setStatus("Parcel")}}>Parcel Received</div>
						<div className="btn btn-danger" onClick={() => {setShowConfirm(true); setStatus("Not")}}>Not Received</div>
					</div>
				</div>}
			/>

			<Modal 
				showModal={showConfirm}
				title="Confirm Update"
				onclose={() => {setShowConfirm(false); setStatus("");}}
				content={<div>
					<div className="modal-body">
						Are you sure to update the invoice to <strong>{status}</strong> Received?
					</div>
					<div className="modal-footer">
						<button className='btn btn-primary' onClick={handleEditOrder}>Proceed</button>
					</div>
				</div>}
			/>

    </div>
  )
}
