import React, {useEffect, useState, useContext} from 'react'
import { AuthContext } from '../../../context/AuthContext.jsx'
import CustomTable from '../../../components/CustomTable'
import ExportExcel from '../../../components/ExportExcel';
import { useDispatch } from 'react-redux';
import { getData, postOrUpdateData, urls } from '../../../redux/urls';
import Modal from '../../../components/Modal';
import Loader from '../../../components/Loader';
import { toast } from 'react-toastify';
import { generatePassword } from '../../../utils/FormatString';

export default function User() {

	const dispatch = useDispatch();
  const { user, logout, refreshUser } = useContext(AuthContext);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

	const headers = [ "name", "phone", "email", "employee_code", "temp_password", "password", "status" ];

	const [loading, setLoading] = useState(false);
	const [data, setData] = useState([]);

	// ================= GET Users =================
	const getUsers = async () => {
		setLoading(true);

		const res = await dispatch(
			getData(urls.filters, {
				filter: "users"
			})
		);

		if (res?.success) {
			setData(res?.data || []);
		}

		setLoading(false);
	};

	useEffect(() => {
		getUsers();
	}, []);


	// add address
	const [showModal, setShowModal] = useState(false);
	const [fields, setFields] = useState({});
	const [submitting, setSubmitting] = useState(false);
	const handleModalClose = () => {
		setShowModal(false);
		setFields({});
		setEditing(false);
	};


  const setTempPassword = (name) => {
    const res = generatePassword(name);
    setFields((prev) => ({ ...prev, temp_password: res }));
  }

	// ================= INPUT CHANGE =================
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFields((prev) => ({ ...prev, [name]: value }));
	};

	// ================= STATUS CHANGE =================
	const handleStatusChange = (status) => {
		setFields((prev) => ({ ...prev, status}));
	};

	// ================= SUBMIT FORM =================
	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		try {
			const res = await dispatch(postOrUpdateData(
				urls.adduser,
				fields
			));
			if (res?.success) {
				handleModalClose();
				getUsers();
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
		setSubmitting(true);
		try {
			const {id, employee_code, ...data} = fields;
			const res = await dispatch(postOrUpdateData(
				urls.edit,
				{filter: "Users", id, data}
			));
			if (res?.success) {
				handleModalClose();
				getUsers();
			}
		} catch (error) {
			console.log(error);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div>

			<div className='d-flex justify-content-end mb-4'>
				<button
					className='btn btn-outline-primary'
					onClick={() => setShowModal(true)}
				>
					+ Add User
				</button>
			</div>

			<CustomTable
				title="Users"
				headers={headers}
				data={data}
				loading={loading}
				user={user}
				actionButton={<ExportExcel tableId="Users" />}
				actionHeaders={["Actions"]}
				actionCells={(row) => [
					<button key={row?.id} className='btn btn-outline-info' onClick={() => {setFields(row); setShowModal(true); setEditing(true);}}>Edit</button>
				]}
			/>

			<Modal
				showModal={showModal}
				title={editing ? "Update User" : "Add User"}
				onclose={handleModalClose}
				content={
					submitting ? <Loader /> :
					<form onSubmit={editing ? handleUpdate : handleSubmit}>
						<div className="row modal-body">

							<div className="col-md-6 mb-4">
								<label className='form-label mb-0'>
									Name <span className='text-danger'>*</span>
								</label>

								<input
									type='text'
									className='form-control'
									name='name'
									value={fields.name || ""}
									onChange={handleChange}
									required
									onBlur={(e) => !editing && setTempPassword(e.target.value)}
								/>
							</div>

							<div className="col-md-6 mb-4">
								<label className='form-label mb-0'>
									Phone Number <span className='text-danger'>*</span>
								</label>

								<input
									type='text'
									className='form-control'
									name='phone'
									value={fields.phone || ""}
									onChange={handleChange}
									required
								/>
							</div>

							<div className="col-md-6 mb-4">
								<label className='form-label mb-0'>
									Email <span className='text-danger'>*</span>
								</label>

								<input
									type='email'
									className='form-control'
									name='email'
									value={fields.email || ""}
									onChange={handleChange}
									required
								/>
							</div>

							<div className="col-md-6 mb-4">
								<label className='form-label mb-0'>
									Employee Code <span className='text-danger'>*</span>
								</label>

								<input
									type='text'
									className='form-control'
									name='employee_code'
									value={fields.employee_code || ""}
									onChange={handleChange}
									required
									disabled={editing}
								/>
							</div>

							<div className="col-md-6 mb-4">
								<label className='form-label mb-0'>
									Temporary Password <span className='text-danger'>*</span>
								</label>

								<input
									type='text'
									className='form-control'
									name='temp_password'
									value={fields.temp_password || ""}
									onChange={handleChange}
									disabled
								/>
							</div>

							<div className="col-md-6 mb-4">
								<label className='form-label mb-0'>
									Role <span className='text-danger'>*</span>
								</label>
								<select
									className='form-select'
									name='role'
									value={fields.role || ""}
									onChange={handleChange}
								>
									<option value="">Select Role</option>
									<option value="ADMIN">ADMIN</option>
									<option value="EMPLOYEE">EMPLOYEE</option>
								</select>
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
											checked={fields.status === true}
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
											checked={fields.status === false}
											onChange={() => handleStatusChange(false)}
										/>

										<label className='form-check-label'>
											Non Active
										</label>
									</div>

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
								{editing ? "Update User" : "Add User"}
							</button>
						</div>
					</form>
				}
			/>
		</div>
	)
}
