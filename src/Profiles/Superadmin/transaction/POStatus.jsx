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
import Select from 'react-select';

export default function POStatus() {
	const dispatch = useDispatch();
  const { user, logout, refreshUser } = useContext(AuthContext);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);
  const headers = ["po_number", "Date", "Company", "Vendor", "Total Price", "Special Discount", "Grand Total", "Products", "Punched By"];		// "PO Status"
  const [loading, setLoading] = useState(false);
	const [orders, setOrders] = useState([]);
	const getOrders = async() => {
		setLoading(true);
		const res = await dispatch(getData(
			urls.filters,
			{filter: "purchaseorders", fields: {po_status: "Draft"}}
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

	const [showConfirm, setShowConfirm] = useState(false);
	const [status, setStatus] = useState("");

	const handleEditOrder = async() => {
		const po_status = status === "lock" ? "Lock & Approved" : "Cancelled";
		const res = await dispatch(postOrUpdateData(
			urls.edit,
			{
				filter: "PurchaseOrders",
				id: selectedOrder?.id,
				data: {po_status}
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

	const [terms, setTerms] = useState([]);
	const getTerms = async() => {
		const res = await dispatch(getData(
			urls.filters,
			{
				filter: "terms",
				fields: {status: true}
			}
		));
		if (res?.success) {
			setTerms(res?.data);
		}
	};

	const [shipping, setShipping] = useState([]);
	const getShipping = async(company) => {
		const res = await dispatch(getData(
			urls.filters,
			{
				filter: "shipping",
				fields: {company_name: company, status: true}
			}
		));
		if (res?.success) {
			setShipping(res?.data);
		}
	};

	const [currency, setCurrency] = useState([]);
	const getCurrency = async() => {
		const res = await dispatch(getData(
			urls.filters,
			{
				filter: "currency",
				fields: {status: true}
			}
		));
		if (res?.success) {
			setCurrency(res?.data);
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
			po_status: "Draft"
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

	const [showEdit, setShowEdit] = useState(false);
	const [editing, setEditing] = useState({});

	const selectedCompany = editing?.company || editing?.company_data?.company_name;

	useEffect(() => {
		if (!selectedCompany) {
			setShipping([]);
			return;
		}

		getShipping(selectedCompany);
	}, [selectedCompany]);

	useEffect(() => {
		if (!editing?.ship_via) return;

		const selectedShipping = shipping?.find(
			v =>
				v?.company_name === (editing?.company || editing?.company_data?.company_name) &&
				v?.ship_via === editing?.ship_via
		);

		if (selectedShipping?.account_number) {
			setEditing(prev => ({
				...prev,
				shipping_account_number: selectedShipping.account_number
			}));
		}
	}, [shipping, editing?.ship_via]);

	const handleEditPIV = async() => {
		const companyData = companies?.find(c => c?.company_name === (editing?.company || editing?.company_data?.company_name));
		const vendorData = vendors?.find(v => v?.company_name === (editing?.vendor || editing?.vendor_data?.company_name));

		const payload = {
			...editing,
			company_data: companyData,
			vendor_data: vendorData,
			total_price: editingTotalAmount,
			special_discount: Number(specialDiscount || 0),
			grand_total: editingGrandTotal,
		};

		const { company, vendor, id, ...data } = payload;
		
		const res = await dispatch(postOrUpdateData(
			urls.edit,
			{filter: "purchaseorders", id, data}
		));

		if (res?.success) {
			setEditing({});
			setSpecialDiscount(0);
			setShowEdit(false);
			getOrders();
		}
	};

	const [products, setProducts] = useState([]);
	const [remarks, setRemarks] = useState([]);

	const getProducts = async() => {
		const res = await dispatch(
			getData(urls.filters,{
				filter: "products",
				fields: { status: true }
			})
		);

		if(res?.success){
			setProducts(res.data);
		}
	};

	const getRemarks = async() => {
		const res = await dispatch(
			getData(urls.filters,{
				filter: "remarks",
				fields: { status: true }
			})
		);

		if(res?.success){
			setRemarks(res.data);
		}
	};

	const handleItemChange = (index, key, value) => {
		setEditing(prev => ({
			...prev,
			items: prev.items.map((item, i) =>
				i === index
					? { ...item, [key]: value }
					: item
			)
		}));
	};

	const [specialDiscount, setSpecialDiscount] = useState(0);

	const editingTotalAmount = (editing?.items || [])
		.reduce((sum, item) => {
			const qty = Number(item.qty || 0);
			const price = Number(item.price || 0);
			const gstPerc = Number(item.gst || 0);
			const discount = Number(item.discount || 0);

			const lineTotal = qty * price;
			const gstAmount = (lineTotal * gstPerc) / 100;
			const discountAmount = (lineTotal * discount) / 100;

			return sum + (lineTotal + gstAmount - discountAmount);
		}, 0)
		.toFixed(2);

	const editingGrandTotal = Number(editingTotalAmount || 0) - Number(specialDiscount || 0);

	useEffect(() => {
		getCompanies();
		getVendors();
		getUsers();
		getTerms();
		getCurrency();
		getProducts();
		getRemarks();
	}, []);


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

					{/* <div className="col-md-3 mb-3">
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
					</div> */}

					{/* <div className="col-md-3 mb-3">
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
					</div> */}

					<div className="col-md-12 d-flex justify-content-end gap-3">
						<button className='btn btn-warning' onClick={() => setFields({})}>Reset</button>
						<button className='btn btn-primary' onClick={handleFilterSubmit}>Search</button>
					</div>
				</div>
			</div>

			<OrderTable 
				title="Drafted Quotations"
				headers={headers}
				data={orders}
				loading={loading}
				actionButton={<ExportExcel tableId="Drafted Quotations" />}
				actionHeaders={["Actions"]}
				actionCells={(row) => [
					<button 
						className='btn btn-secondary' 
						title='Edit Invoice Details' 
						onClick={() => {
							setShowEdit(true);
																		setSpecialDiscount(Number(row?.special_discount || 0));
							setEditing({
								...row,

								items: (row.items || []).map(item => ({
									...item,
									value: item.value || item.data?.id,
									label:
										item.label ||
										`${item.data?.item_code} - ${item.data?.description}`
								}))
							});
						}}
					>
						Edit
					</button>,
					user?.role === "ADMIN" && (<button className="btn btn-outline-info" title='Update Quotation Status' onClick={() => {setShowModal(true); setSelectedOrder(row);}}>Update Status</button>)
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
						<div className="btn btn-success" onClick={() => {setShowConfirm(true); setStatus("lock")}}>Lock & Approve</div>
						<div className="btn btn-danger" onClick={() => {setShowConfirm(true); setStatus("cancel")}}>Cancel</div>
					</div>
				</div>}
			/>

			<Modal 
				showModal={showConfirm}
				title="Confirm Update"
				onclose={() => {setShowConfirm(false); setStatus("");}}
				content={<div>
					<div className="modal-body">
						{
						status === "lock"
							? <>Are you sure to <strong>Lock & Approve</strong> the Order?</>
							: <>Are you sure to <strong>Cancel</strong> the Order?</>
						}
					</div>
					<div className="modal-footer">
						<button className='btn btn-primary' onClick={handleEditOrder}>Proceed</button>
					</div>
				</div>}
			/>

			<Modal 
				showModal={showEdit}
				title="Edit Invoice"
				onclose={() => {setEditing({}); setSpecialDiscount(0); setShowEdit(false);}}
				size='xl'
				content={
					<div>
						<div className="modal-body row">
							<div className="col-md-6 mb-3">
								<label>Company</label>
								<select 
									className='form-select'
									name='company'
									value={editing?.company || editing?.company_data?.company_name || ""}
									onChange={(e) => setEditing(prev => ({...prev, company: e.target.value}))}
								>
									<option value="">Select</option>
									{companies?.map((c, i) => (
										<option key={i} value={c?.company_name}>{c?.company_name}</option>
									))}
								</select>
							</div>

							<div className="col-md-6 mb-3">
								<label>Vendor</label>
								<select 
									className='form-select'
									name='vendor'
									value={editing?.vendor || editing?.vendor_data?.company_name || ""}
									onChange={(e) => setEditing(prev => ({...prev, vendor: e.target.value}))}
								>
									<option value="">Select</option>
									{vendors?.map((v, i) => (
										<option key={i} value={v?.company_name}>{v?.company_name}</option>
									))}
								</select>
							</div>

							<div className="col-md-6 mb-3">
								<label>Terms</label>
								<select 
									className='form-select'
									name='terms'
									value={editing?.terms || ""}
									onChange={(e) => setEditing(prev => ({...prev, terms: e.target.value}))}
								>
									<option value="">Select</option>
									{terms?.map((t, i) => (
										<option key={i} value={t?.term}>{t?.term}</option>
									))}
								</select>
							</div>

							<div className="col-md-6 mb-3">
								<label>Ship Via</label>
								<select 
									className='form-select'
									name='ship_via'
									value={editing?.ship_via || ""}
									onChange={(e) => setEditing(prev => ({...prev, ship_via: e.target.value}))}
								>
									<option value="">Select</option>
									{shipping?.map((s, i) => (
										<option key={i} value={s?.ship_via}>{s?.ship_via}</option>
									))}
								</select>
							</div>

							<div className="col-md-6 mb-3">
								<label>Currency</label>
								<select 
									className='form-select'
									name='currency'
									value={editing?.currency || ""}
									onChange={(e) => setEditing(prev => ({...prev, currency: e.target.value}))}
								>
									<option value="">Select</option>
									{currency?.map((c, i) => (
										<option key={i} value={c?.currency}>{c?.currency}</option>
									))}
								</select>
							</div>

							<div className="col-md-6 mb-3">
								<label>Shipping Account Number</label>
								<input 
									className='form-control'
									name='shipping_account_number'
									value={editing?.shipping_account_number || ""}
									disabled
								/>
							</div>

							<div className="col-md-12 mb-3">
								<label>Select Items</label>

								<Select
									isMulti
									options={products.map((p) => ({
										value: p.id,
										label: `${p.item_code} - ${p.description}`,
										data: p
									}))}
									value={editing?.items || []}
									onChange={(selected) => {
										setEditing(prev => ({
											...prev,
											items: selected?.map(item => {
												const existing = prev?.items?.find(
													i => i.value === item.value
												);

												return existing || {
													...item,
													qty: 1,
													price: "",
													gst: 0,
													discount: 0
												};
											}) || []
										}));
									}}
								/>

								{editing?.items?.length > 0 && (
									<div className="table-responsive mt-3">
										<table className="table table-bordered">
											<thead>
												<tr>
													<th>Item</th>
													<th>Presentation</th>
													<th>Qty</th>
													<th>Price</th>
													<th>GST (%)</th>
													<th>Discount (%)</th>
													<th>Total</th>
												</tr>
											</thead>

											<tbody>
												{editing.items.map((item, index) => {
													const qty = Number(item.qty || 0);
													const price = Number(item.price || 0);
													const gstPerc = Number(item.gst || 0);
													const discount = Number(item.discount || 0);

													const lineTotal = qty * price;
													const gstAmount = (lineTotal * gstPerc) / 100;
													const discountAmount = (lineTotal * discount) / 100;
													const total = lineTotal + gstAmount - discountAmount;

													return (
														<tr key={index}>
															<td>{item.label}</td>
															<td>{item.data?.presentation}</td>
															<td>
																<input
																	type="number"
																	className="form-control"
																	value={item.qty}
																	onChange={(e) => handleItemChange(index, "qty", e.target.value)}
																	onWheel={(e) => e.target.blur()}
																/>
															</td>
															<td>
																<input
																	type="number"
																	className="form-control"
																	value={item.price}
																	onChange={(e) => handleItemChange(index, "price", e.target.value)}
																	onWheel={(e) => e.target.blur()}
																/>
															</td>
															<td>
																<input
																	type="number"
																	className="form-control"
																	value={item.gst}
																	onChange={(e) => handleItemChange(index, "gst", e.target.value)}
																	onWheel={(e) => e.target.blur()}
																/>
															</td>
															<td>
																<input
																	type="number"
																	className="form-control"
																	value={item.discount}
																	onChange={(e) => handleItemChange(index, "discount", e.target.value)}
																	onWheel={(e) => e.target.blur()}
																/>
															</td>
															<td>₹ {total.toFixed(2)}</td>
														</tr>
													);
												})}

												<tr className='table-secondary fw-bold'>
													<td colSpan="6" className='text-end'>Total Amount</td>
													<td>₹ {editingTotalAmount}</td>
												</tr>

												<tr className='fw-bold'>
													<td colSpan="6" className='text-end'>Special Discount</td>
													<td>
														<input 
															type="number"
															className='form-control'
															name='specialDiscount'
															value={specialDiscount || ""}
															onChange={e => setSpecialDiscount(e.target.value)}
															onWheel={(e) => e.target.blur()}
														/>
													</td>
												</tr>

												<tr className='table-secondary fw-bold'>
													<td colSpan="6" className='text-end'>Grand Total</td>
													<td>₹ {editingGrandTotal.toFixed(2)}</td>
												</tr>
											</tbody>
										</table>
									</div>
								)}
							</div>

							<div className="col-md-12 mb-3">
								<label>Remarks</label>
								<Select
									isMulti
									options={remarks.map((r) => ({
										value: r.remark,
										label: r.remark
									}))}
									value={editing?.remarks?.map((remark) => ({ value: remark, label: remark })) || []}
									onChange={(selected) => {
										setEditing(prev => ({
											...prev,
											remarks: selected?.map(item => item.value) || []
										}));
									}}
								/>

								{editing?.remarks?.length > 0 && (
									<div className="table-responsive mt-3">
										<table className="table table-bordered">
											<thead className="table-light">
												<tr>
													<th>Remark</th>
													<th width="120">Action</th>
												</tr>
											</thead>
											<tbody>
												{editing.remarks.map((remark, index) => (
													<tr key={index}>
														<td style={{ whiteSpace: "pre-line" }}>{remark}</td>
														<td>
															<button
																type="button"
																className="btn btn-danger btn-sm"
																onClick={() => {
																	setEditing(prev => ({
																		...prev,
																		remarks: prev.remarks.filter((_, i) => i !== index)
																	}));
																}}
															>
																Remove
															</button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</div>

							<div className="col-md-12 mb-3">
								<label>Internal Remarks</label>
								<textarea 
									className='form-control'
									name='internal_remarks'
									value={editing?.internal_remarks || ""}
									onChange={(e) => setEditing(prev => ({...prev, internal_remarks: e.target.value}))}
								/>
							</div>

						</div>
						<div className="modal-footer">
							<button className='btn btn-success' onClick={handleEditPIV}>Save</button>
							<button className='btn btn-secondary' onClick={() => {setEditing({}); setShowEdit(false);}}>Cancel</button>
						</div>
					</div>
				}
			/>

    </div>
  )
}
