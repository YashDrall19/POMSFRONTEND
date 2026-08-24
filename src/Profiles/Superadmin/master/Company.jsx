import React, {useEffect, useState, useContext} from 'react'
import { AuthContext } from '../../../context/AuthContext.jsx'
import CustomTable from '../../../components/CustomTable'
import ExportExcel from '../../../components/ExportExcel';
import { useDispatch } from 'react-redux';
import { base_url, getData, postOrUpdateData, uploadFile, urls } from '../../../redux/urls';
import Modal from '../../../components/Modal';
import Loader from '../../../components/Loader';
import { toast } from 'react-toastify';

export default function Company() {

	const dispatch = useDispatch();
  const { user, logout, refreshUser } = useContext(AuthContext);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

	const headers = [ "company_name", "company_logo", "prefix", "contact_person", "email", "phone", "telephone", "address", "status" ];

	const [loading, setLoading] = useState(false);
	const [data, setData] = useState([]);

	// ================= GET COMPANIES =================
	const getCompanies = async () => {
		setLoading(true);

		const res = await dispatch(
			getData(urls.filters, {
				filter: "company"
			})
		);

		if (res?.success) {
			setData(res?.data || []);
		}

		setLoading(false);
	};

	useEffect(() => {
		getCompanies();
	}, []);


	// add company
	const [showModal, setShowModal] = useState(false);
	const [company, setCompany] = useState({});
	const [submitting, setSubmitting] = useState(false);
	const [logoUploading, setLogoUploading] = useState(false);
	const [tel, setTel] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const handleModalClose = () => {
		setShowModal(false);
		setCompany({});
		setTel("");
		setEmail("");
		setPhone("");
		setEditing(false);
	};

	// ================= INPUT CHANGE =================
	const handleChange = (e) => {
		const { name, value, files, type } = e.target;

		// File input
		if (type === "file") {
			const file = files?.[0];
			if (!file) return;
			uploadCompanyLogo(file);
			return;
		}

		setCompany((prev) => ({
			...prev,
			[name]: value
		}));
	};

	const uploadCompanyLogo = async (file) => {
		setLogoUploading(true);
		const formData = new FormData();
		formData.append('company_logo', file);

		const res = await dispatch(uploadFile(urls.uploadcompanylogo, formData));
		if (res?.success && res?.data?.company_logo) {
			setCompany((prev) => ({
				...prev,
				company_logo: res.data.company_logo
			}));
		}
		setLogoUploading(false);
	};

	const handleRemoveCompanyLogo = () => {
		setCompany((prev) => ({
			...prev,
			company_logo: null
		}));
	};

	// ================= STATUS CHANGE =================
	const handleStatusChange = (status) => {
		setCompany((prev) => ({
			...prev,
			status
		}));
	};

	// ================= ADD PHONE =================
	const handleAddNumber = () => {
		if (!phone) {
			toast.warning("Please add a valid number");
			return;
		}
		if (company?.phone?.includes(phone)) {
			toast.warning("Number already added");
			return;
		}
		setCompany(prev => ({
			...prev,
			phone: [...company?.phone || [], phone]
		}));
		setPhone("");
	};

	// ================= ADD EMAIL =================
	const handleAddEmail = () => {
		if (company?.email?.includes(email)) {
			toast.warning("Email already added");
			return;
		}
		setCompany(prev => ({
			...prev,
			email: [...company?.email || [], email]
		}));
		setEmail("");
	};

	// ================= ADD TELEPHONE =================
	const handleAddTelephone = () => {
		if (!tel) {
			toast.warning("Please add a valid number");
			return;
		}
		if (company?.telephone?.includes(tel)) {
			toast.warning("Number already added");
			return;
		}
		setCompany(prev => ({
			...prev,
			telephone: [...company?.telephone || [], tel]
		}));
		setTel("");
	};

	// ================= SUBMIT FORM =================
	const handleSubmit = async (e) => {
		e.preventDefault();
		
		
		// Validation
		if (tel !== "") {
			toast.warning("Please click the add button to add the telephone number");
			return;
		}
		if (email !== "") {
			toast.warning("Please click the add button to add the email");
			return;
		}
		if (phone !== "") {
			toast.warning("Please click the add button to add the phone number");
			return;
		}
		if (!company?.phone || company?.phone?.length === 0) {
			toast.warning("Please add at least 1 phone number");
			return;
		}
		if (!company?.email || company?.email?.length === 0) {
			toast.warning("Please add at least 1 email");
			return;
		}
		setSubmitting(true);
		try {
			const res = await dispatch(postOrUpdateData(
				urls.addcompany,
				company
			));
			if (res?.success) {
				handleModalClose();
				getCompanies();
			}
		} catch (error) {
			console.log(error);
		} finally {
			setSubmitting(false);
		}
	};

	const [editing, setEditing] = useState(false);
	const handleUpdate = async (e) => {
		e.preventDefault();
		
		
		// Validation
		if (tel !== "") {
			toast.warning("Please click the add button to add the telephone number");
			return;
		}
		if (email !== "") {
			toast.warning("Please click the add button to add the email");
			return;
		}
		if (phone !== "") {
			toast.warning("Please click the add button to add the phone number");
			return;
		}
		if (!company?.phone || company?.phone?.length === 0) {
			toast.warning("Please add at least 1 phone number");
			return;
		}
		if (!company?.email || company?.email?.length === 0) {
			toast.warning("Please add at least 1 email");
			return;
		}
		setSubmitting(true);
		try {
			const {id, company_code, ...data} = company;
			const res = await dispatch(postOrUpdateData(
				urls.edit,
				{filter: "Company", id, data}
			));
			if (res?.success) {
				handleModalClose();
				getCompanies();
			}
		} catch (error) {
			console.log(error);
		} finally {
			setSubmitting(false);
		}
	};
	console.log(company)

	return (
		<div>

			<div className='d-flex justify-content-end mb-4'>
				<button
					className='btn btn-outline-primary'
					onClick={() => setShowModal(true)}
				>
					+ Add Company
				</button>
			</div>

			<CustomTable
				title="Companies"
				headers={headers}
				data={data}
				loading={loading}
				user={user}
				actionButton={<ExportExcel tableId="Companies" />}
				actionHeaders={["Actions"]}
				actionCells={(row) => [
					<button key={row?.id} className='btn btn-outline-info' onClick={() => {setCompany(row); setShowModal(true); setEditing(true);}}>Edit</button>
				]}
			/>

			<Modal
				showModal={showModal}
				title={editing ? "Update Company" : "Add Company"}
				onclose={handleModalClose}
				content={
					submitting ? <Loader /> :
					<form onSubmit={editing ? handleUpdate : handleSubmit}>
						<div className="row modal-body">

							<div className="col-md-6 mb-4">
								<label className='form-label mb-0'>
									Company Name <span className='text-danger'>*</span>
								</label>

								<input
									type="text"
									className='form-control'
									name='company_name'
									value={company.company_name || ""}
									onChange={handleChange}
									required
								/>
							</div>

							<div className="col-md-6 mb-4">
								<label className='form-label mb-0'>
									Contact Person <span className='text-danger'>*</span>
								</label>

								<input
									type="text"
									className='form-control'
									name='contact_person'
									value={company.contact_person || ""}
									onChange={handleChange}
								/>
							</div>

							<div className="col-md-6 mb-4">
								<label className='form-label mb-0'>
									Phone <span className='text-danger'>*</span>
								</label>

								<div className='d-flex gap-2'>
									<input
										type='text'
										className='form-control'
										name='phone'
										value={phone || ""}
										maxLength={10}
										onChange={(e) => {
											const value = e.target.value.replace(/\D/g, "");
											setPhone(value);
										}}
									/>
									<button 
										type='button' 
										className='btn btn-outline-primary'
										onClick={handleAddNumber}
									>+</button>
								</div>

								<div className='mt-2'>
									{company?.phone?.map((p, i) => {
										return (
											<div key={i} className='d-flex gap-2 mt-2'>
												<input 
													className='form-control'
													type="text" 
													disabled
													value={p}
												/>
												<button 
													className='btn btn-danger'
													type='button'
													onClick={() => {
														setCompany(prev => ({
															...prev,
															phone: company?.phone?.filter(v => v !== p)
														}));
													}}
												>x</button>
											</div>
										)
									})}
								</div>
							</div>

							<div className="col-md-6 mb-4">
								<label className='form-label mb-0'>
									Telephone
								</label>

								<div className='d-flex gap-2'>
									<input
										type='text'
										className='form-control'
										name='tel'
										value={tel || ""}
										maxLength={10}
										onChange={(e) => {
											const value = e.target.value.replace(/\D/g, "");
											setTel(value);
										}}
									/>
									<button 
										type='button' 
										className='btn btn-outline-primary'
										onClick={handleAddTelephone}
									>+</button>
								</div>

								<div className='mt-2'>
									{company?.telephone?.map((t, i) => {
										return (
											<div key={i} className='d-flex gap-2 mt-2'>
												<input 
													className='form-control'
													type="text" 
													disabled
													value={t}
												/>
												<button 
													className='btn btn-danger'
													type='button'
													onClick={() => {
														setCompany(prev => ({
															...prev,
															telephone: company?.telephone?.filter(v => v !== t)
														}));
													}}
												>x</button>
											</div>
										)
									})}
								</div>
							</div>

							<div className="col-md-6 mb-4">
								<label className='form-label mb-0'>
									Email ID <span className='text-danger'>*</span>
								</label>

								<div className='d-flex gap-2'>
									<input
										type='email'
										className='form-control'
										name='email'
										value={email || ""}
										onChange={(e) => setEmail(e.target.value)}
									/>
									<button 
										type='button' 
										className='btn btn-outline-primary'
										onClick={handleAddEmail}
									>+</button>
								</div>

								<div className='mt-2'>
									{company?.email?.map((e, i) => {
										return (
											<div key={i} className='d-flex gap-2 mt-2'>
												<input 
													className='form-control'
													type="text" 
													disabled
													value={e}
												/>
												<button 
													className='btn btn-danger'
													type='button'
													onClick={() => {
														setCompany(prev => ({
															...prev,
															email: company?.email?.filter(v => v !== e)
														}));
													}}
												>x</button>
											</div>
										)
									})}
								</div>
							</div>
							<div className="col-md-6 mb-4">
								<label className='form-label mb-0'>Prefix <span className='text-danger'>*</span></label>
								<input
									type="text"
									className='form-control'
									name='prefix'
									value={company.prefix || ""}
									onChange={handleChange}
									required
								/>
							</div>

							<div className="col-md-12 mb-4">
								<label className='form-label mb-0'>Address <span className='text-danger'>*</span></label>
								<textarea
									rows={5}
									className='form-control'
									name='address'
									value={company.address || ""}
									onChange={handleChange}
									required
								/>
							</div>

							<div className="col-md-6 mb-4">
								<label className='form-label mb-0'>Tax Registration</label> {/*  <span className='text-danger'>*</span> */}
								<input
									type="text"
									className='form-control'
									name='tax_registration'
									value={company.tax_registration || ""}
									onChange={handleChange}
									// required
								/>
							</div>

							<div className="col-md-6 mb-4">
								<label className='form-label mb-0'>
									Company Logo
								</label>

							{company?.company_logo ? (
								<div className="position-relative" style={{ maxWidth: '180px' }}>
									<img
										src={`${base_url}${company?.company_logo}`}
										alt="Company Logo"
										className="img-fluid rounded border"
									/>
									<button
										type="button"
										className="btn btn-danger btn-sm position-absolute top-0 end-0"
										onClick={handleRemoveCompanyLogo}
									>
										x
									</button>
								</div>
							) : (
								<>
									<input
										type="file"
										className='form-control'
										name='company_logo'
										accept='image/*'
										onChange={handleChange}
									/>
									{logoUploading && (
										<small className='text-muted'>Uploading logo...</small>
									)}
								</>
							)}
						</div>

						{/* STATUS */}
						<div className="col-md-6 mb-4">
							<label className='form-label d-block mb-2'>
								Status
							</label>

							<div className='d-flex gap-4'>
								<div className='form-check'>
									<input
										type="radio"
										className='form-check-input'
										name='status'
										checked={company.status === true}
										onChange={() => handleStatusChange(true)}
									/>

									<label className='form-check-label'>
										Active
									</label>
								</div>

								<div className='form-check'>
									<input
										type="radio"
										className='form-check-input'
										name='status'
										checked={company.status === false}
										onChange={() => handleStatusChange(false)}
									/>

									<label className='form-check-label'>
										Non Active
									</label>
								</div>
							</div>
						</div>

						<div className="modal-footer">
							<button
								type="button"
								className='btn btn-secondary'
								onClick={handleModalClose}
							>
								Cancel
							</button>

							<button
								type="submit"
								className='btn btn-primary'
								disabled={loading}
							>
								{editing ? "Update Company" : "Add Company"}
							</button>
						</div>
						</div>
					</form>
				}
			/>
		</div>
	)
}
