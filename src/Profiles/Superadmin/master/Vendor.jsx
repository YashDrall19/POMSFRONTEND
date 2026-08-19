import React, {useEffect, useState, useContext} from 'react'
import { AuthContext } from '../../../context/AuthContext.jsx'
import CustomTable from '../../../components/CustomTable'
import ExportExcel from '../../../components/ExportExcel';
import { useDispatch } from 'react-redux';
import { getData, postOrUpdateData, urls } from '../../../redux/urls';
import Modal from '../../../components/Modal';
import Loader from '../../../components/Loader';
import { toast } from 'react-toastify';

export default function Vendor() {

	const dispatch = useDispatch();
  const { user, logout, refreshUser } = useContext(AuthContext);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

	const headers = [ "prefix", "company_name", "contact_person", "address", "email", "phone", "tax_registration", "telephone", "status" ];

	const [loading, setLoading] = useState(false);
	const [data, setData] = useState([]);

	// ================= GET Addresses =================
	const getVendor = async () => {
		setLoading(true);

		const res = await dispatch(
			getData(urls.filters, {
				filter: "vendor"
			})
		);

		if (res?.success) {
			setData(res?.data || []);
		}

		setLoading(false);
	};

	useEffect(() => {
		getVendor();
	}, []);


	// add vendor
	const [showModal, setShowModal] = useState(false);
	const [fields, setFields] = useState({});
	const [submitting, setSubmitting] = useState(false);
	const handleModalClose = () => {
		setShowModal(false);
		setFields({});
		setEditing(false);
		setTel("");
		setEmail("");
		setPhone("");
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
    if (!fields?.phone || fields?.phone?.length === 0) {
      toast.warning("Please add at least 1 phone number");
      return;
    }
    setSubmitting(true);
		try {
			const res = await dispatch(postOrUpdateData(
				urls.addvendor,
				fields
			));
			if (res?.success) {
				handleModalClose();
				getVendor();
			}
      console.log(fields)
		} catch (error) {
			console.log(error);
		} finally {
			setSubmitting(false);
		}
	};

	const [editing, setEditing] = useState(false);
	const handleUpdate = async (e) => {
		e.preventDefault();
		
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
    if (!fields?.phone || fields?.phone?.length === 0) {
      toast.warning("Please add at least 1 phone number");
      return;
    }
    setSubmitting(true);
		try {
			const {id, ...data} = fields;
			const res = await dispatch(postOrUpdateData(
				urls.edit,
				{filter: "Vendor", id, data}
			));
			if (res?.success) {
				handleModalClose();
				getVendor();
			}
      console.log(fields)
		} catch (error) {
			console.log(error);
		} finally {
			setSubmitting(false);
		}
	};

  // temp fields
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");


  const handleAddNumber = () => {
    if (!phone) {
      toast.warning("Please add a valid number");
      return;
    }
    if (fields?.phone?.includes(phone)) {
      toast.warning("Number already added");
      return;
    }
    setFields(prev => ({
      ...prev,
      phone: [...fields?.phone || [], phone]
    }));
    setPhone("");
  };

  const handleAddEmail = () => {
    if (fields?.email?.includes(email)) {
      toast.warning("Email already added");
      return;
    }
    setFields(prev => ({
      ...prev,
      email: [...fields?.email || [], email]
    }));
    setEmail("");
  };

  const handleAddTelephone = () => {
    if (!tel) {
      toast.warning("Please add a valid number");
      return;
    }
    if (fields?.telephone?.includes(tel)) {
      toast.warning("Number already added");
      return;
    }
    setFields(prev => ({
      ...prev,
      telephone: [...fields?.telephone || [], tel]
    }));
    setTel("");
  };

	return (
		<div>

			<div className='d-flex justify-content-end mb-4'>
				<button
					className='btn btn-outline-primary'
					onClick={() => setShowModal(true)}
				>
					+ Add Vendor
				</button>
			</div>

			<CustomTable
				title="Vendors"
				headers={headers}
				data={data}
				loading={loading}
				actionButton={<ExportExcel tableId="Vendors" />}
				actionHeaders={["Actions"]}
				actionCells={(row) => [
					<button key={row?.id} className='btn btn-outline-info' onClick={() => {setFields(row); setShowModal(true); setEditing(true);}}>Edit</button>
				]}
			/>

			<Modal
				showModal={showModal}
				title={editing ? "Edit Vendor" : "Add Vendor"}
				onclose={handleModalClose}
				content={
					submitting ? <Loader /> :
					<form onSubmit={editing ? handleUpdate : handleSubmit}>
						<div className="row modal-body">

							<div className="col-md-6 mb-4">
								<label className='form-label mb-0'>
									Prefix <span className='text-danger'>*</span>
								</label>

								<input
									type="text"
									className='form-control'
									name='prefix'
									value={fields.prefix || ""}
									onChange={handleChange}
									required
								/>
							</div>

							<div className="col-md-6 mb-4">
								<label className='form-label mb-0'>
									Vendor Name <span className='text-danger'>*</span>
								</label>

								<input
									type="text"
									className='form-control'
									name='company_name'
									value={fields.company_name || ""}
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
									value={fields.contact_person || ""}
									onChange={handleChange}
                  required
								/>
							</div>

							<div className="col-md-6 mb-4">
								<label className='form-label mb-0'>
									Tax Registration <span className='text-danger'>*</span>
								</label>

								<input
									type="text"
									className='form-control'
									name='tax_registration'
									value={fields.tax_registration || ""}
									onChange={handleChange}
								/>
							</div>

              <div className="col-md-12 mb-4">
								<label className='form-label mb-0'>
									Address <span className='text-danger'>*</span>
								</label>

								<textarea
									rows={5}
									className='form-control'
									name='address'
									value={fields.address || ""}
									onChange={handleChange}
                  required
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
                  {fields?.phone?.map((p, i) => {
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
                            setFields(prev => ({
                              ...prev,
                              phone: fields?.phone?.filter(v => v !== p)
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
                  {fields?.telephone?.map((t, i) => {
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
                            setFields(prev => ({
                              ...prev,
                              telephone: fields?.telephone?.filter(v => v !== t)
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
									Email
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
                  {fields?.email?.map((e, i) => {
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
                            setFields(prev => ({
                              ...prev,
                              email: fields?.email?.filter(v => v !== e)
                            }));
                          }}
                        >x</button>
                      </div>
                    )
                  })}
                </div>
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
								{editing ? "Edit Vendor" : "Add Vendor"}
							</button>
						</div>
					</form>
				}
			/>
		</div>
	)
}