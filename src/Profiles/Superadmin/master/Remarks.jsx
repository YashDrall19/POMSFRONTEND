import React, {useEffect, useState, useContext} from 'react'
import { AuthContext } from '../../../context/AuthContext.jsx'
import CustomTable from '../../../components/CustomTable'
import ExportExcel from '../../../components/ExportExcel';
import { useDispatch } from 'react-redux';
import { getData, postOrUpdateData, urls } from '../../../redux/urls';
import Modal from '../../../components/Modal';
import Loader from '../../../components/Loader';
import { toast } from 'react-toastify';

export default function Remarks() {

	const dispatch = useDispatch();
  const { user, logout, refreshUser } = useContext(AuthContext);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

	const headers = [ "remark", "status" ];

	const [loading, setLoading] = useState(false);
	const [data, setData] = useState([]);

	// ================= GET Remarks =================
	const getRemarks = async () => {
		setLoading(true);

		const res = await dispatch(
			getData(urls.filters, {
				filter: "remarks"
			})
		);

		if (res?.success) {
			setData(res?.data || []);
		}

		setLoading(false);
	};

	useEffect(() => {
		getRemarks();
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
				urls.addremarks,
				fields
			));
			if (res?.success) {
				handleModalClose();
				getRemarks();
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
			const {id, ...data} = fields;
			const res = await dispatch(postOrUpdateData(
				urls.edit,
				{filter: "Remarks", id, data}
			));
			if (res?.success) {
				handleModalClose();
				getRemarks();
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
					+ Add Remark
				</button>
			</div>

			<CustomTable
				title="Remarks"
				headers={headers}
				data={data}
				loading={loading}
				user={user}
				actionButton={<ExportExcel tableId="Remarks" />}
				actionHeaders={["Actions"]}
				actionCells={(row) => [
					<button key={row?.id} className='btn btn-outline-info' onClick={() => {setFields(row); setShowModal(true); setEditing(true);}}>Edit</button>
				]}
			/>

			<Modal
				showModal={showModal}
				title={editing ? "Update Remark" : "Add Remark"}
				onclose={handleModalClose}
				content={
					submitting ? <Loader /> :
					<form onSubmit={editing ? handleUpdate : handleSubmit}>
						<div className="row modal-body">

              <div className="col-md-12 mb-4">
								<label className='form-label mb-0'>
									Remark <span className='text-danger'>*</span>
								</label>

								<textarea
                  rows={5}
									className='form-control'
									name='remark'
									value={fields.remark || ""}
									onChange={handleChange}
									required
								/>
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
								{editing ? "Update Remark" : "Add Remark"}
							</button>
						</div>
					</form>
				}
			/>
		</div>
	)
}
