import React, {useEffect, useState, useContext} from 'react'
import { AuthContext } from '../../../context/AuthContext.jsx'
import CustomTable from '../../../components/CustomTable'
import ExportExcel from '../../../components/ExportExcel';
import { useDispatch } from 'react-redux';
import { getData, postOrUpdateData, urls } from '../../../redux/urls';
import Modal from '../../../components/Modal';
import Loader from '../../../components/Loader';
import { toast } from 'react-toastify';

export default function Ship() {

	const dispatch = useDispatch();
  const { user, logout, refreshUser } = useContext(AuthContext);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

	const headers = [ "company_name", "ship_via", "account_number", "status" ];

	const [loading, setLoading] = useState(false);
	const [data, setData] = useState([]);

	// ================= GET Companies =================
  const [companies, setCompanies] = useState([]);
  const getCompanies = async () => {
    const res = await dispatch(getData(
      urls.filters,
      {filter: "company"}
    ));
    if (res?.success) {
      setCompanies(res?.data);
    }
  };





	// ================= GET Shipping =================
	const getShipping = async () => {
		setLoading(true);

		const res = await dispatch(
			getData(urls.filters, {
				filter: "shipping"
			})
		);

		if (res?.success) {
			setData(res?.data || []);
		}

		setLoading(false);
	};

	useEffect(() => {
		getShipping();
		getCompanies();
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
				urls.addshipping,
				fields
			));
			if (res?.success) {
				handleModalClose();
				getShipping();
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
				{filter: "Shipping", id, data}
			));
			if (res?.success) {
				handleModalClose();
				getShipping();
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
					+ Add Shipping
				</button>
			</div>

			<CustomTable
				title="Shipping"
				headers={headers}
				data={data}
				loading={loading}
				user={user}
				actionButton={<ExportExcel tableId="Shipping" />}
				actionHeaders={["Actions"]}
				actionCells={(row) => [
					<button key={row?.id} className='btn btn-outline-info' onClick={() => {setFields(row); setShowModal(true); setEditing(true);}}>Edit</button>
				]}
			/>

			<Modal
				showModal={showModal}
				title={editing ? "Update Shipping" : "Add Shipping"}
				onclose={handleModalClose}
				content={
					submitting ? <Loader /> :
					<form onSubmit={editing ? handleUpdate : handleSubmit}>
						<div className="row modal-body">

							<div className="col-md-6 mb-4">
								<label className='form-label mb-0'>
									Company Name <span className='text-danger'>*</span>
								</label>

                <select
                  className='form-select'
                  name='company_name'
									value={fields.company_name || ""}
									onChange={handleChange}
									required
                >
                  <option value="">Select</option>
                  {companies?.map((c, i) => {
                    return (
                      <option value={c?.company_name} key={i}>{c?.company_name}</option>
                    )
                  })}
                </select>
							</div>

							<div className="col-md-6 mb-4">
								<label className='form-label mb-0'>
									Ship Via <span className='text-danger'>*</span>
								</label>

								<input
									type="text"
									className='form-control'
									name='ship_via'
									value={fields.ship_via || ""}
									onChange={handleChange}
									required
								/>
							</div>

              <div className="col-md-6 mb-4">
								<label className='form-label mb-0'>
									Account Number <span className='text-danger'>*</span>
								</label>

								<input
									type="text"
									className='form-control'
									name='account_number'
									value={fields.account_number || ""}
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
								{editing ? "Update Shipping" : "Add Shipping"}
							</button>
						</div>
					</form>
				}
			/>
		</div>
	)
}
