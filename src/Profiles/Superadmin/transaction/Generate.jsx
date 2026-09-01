import { useContext, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux';
import { getData, postOrUpdateData, urls } from '../../../redux/urls';
import Select from 'react-select';
import PurchaseOrderTemplate from '../../../components/PurchaseOrderTemplate';
import Modal from '../../../components/Modal';
import Loader from '../../../components/Loader';
import { AuthContext } from '../../../context/AuthContext';
import { calculateLineItem } from '../../../utils/orderTotals';

export default function Generate() {
  const dispatch = useDispatch();
  const [companies, setCompanies] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [terms, setTerms] = useState([]);
  const [shipping, setShipping] = useState([]);
  const [currency, setCurrency] = useState([]);
  const [products, setProducts] = useState([]);
  const [remarks, setRemarks] = useState([]);

  const [loading, setLoading] = useState(false);



  // get all data
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

  const getShipping = async() => {
    const res = await dispatch(getData(
      urls.filters,
      {
        filter: "shipping",
        fields: {company_name: fields?.company, status: true}
      }
    ));
    if (res?.success) {
      setShipping(res?.data);
    }
  };

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

  const getProducts = async() => {
    const res = await dispatch(getData(
      urls.filters,
      {
        filter: "products",
        fields: {status: true}
      }
    ));
    if (res?.success) {
      setProducts(res?.data);
    }
  };

  const getRemarks = async() => {
    const res = await dispatch(getData(
      urls.filters,
      {
        filter: "remarks",
        fields: {status: true}
      }
    ));
    if (res?.success) {
      setRemarks(res?.data);
    }
  };

  useEffect(() => {
    getCompanies();
    getVendors();
    getTerms();
    getCurrency();
    getProducts();
    getRemarks();
  }, []);



  const [fields, setFields] = useState({});
  useEffect(() => {
    if (fields?.company) {
      setShipping([]);
      getShipping();
      setFields(prev => ({...prev, shipping_account_number: ""}))
    }
  }, [fields?.company]);

  useEffect(() => {
    if (fields?.ship_via) {
      setFields(prev => ({...prev, shipping_account_number: shipping?.find(s => s?.ship_via === fields?.ship_via)?.account_number}));
    }
  }, [fields?.ship_via]);

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFields(prev => ({...prev, [name]: value}));
  };

  const [renderPO, setRenderPO] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    setRenderPO(true);

    const company = companies?.find(c => c?.company_name === fields?.company);
    const vendor = vendors?.find(v => v?.company_name === fields?.vendor);

    setFields(prev => ({
      ...prev,
      company_data: company,
      vendor_data: vendor
    }));
  };

  const handleReset = () => {
    setFields({});
  };


  const handleItemChange = (index, key, value) => {
    setFields(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? { ...item, [key]: value }
          : item
      )
    }));
  };

  const { user, refreshUser } = useContext(AuthContext);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const componentRef = useRef();
  const submitPO = async() => {
    if (!user) {
      return;
    }
    const items = fields.items || [];
    // Company and vendor names are only form selectors; their complete data is
    // stored in company_data and vendor_data for the quotation.
    const rest = Object.fromEntries(
      Object.entries(fields).filter(([key]) => !["company", "vendor", "items"].includes(key))
    );
    const calculatedItems = items.map((item) => {
      const { subtotal, gstAmount, total, discountAmount, grandTotal: itemGrandTotal } = calculateLineItem(item);

      return {
        ...item,
        qty: Number(item.qty || 0),
        price: Number(item.price || 0),
        gst: Number(item.gst || 0),
        discount: Number(item.discount || 0),
        subtotal,
        gst_amount: gstAmount,
        total,
        discount_amount: discountAmount,
        grand_total: itemGrandTotal,
        // Retained for compatibility with existing consumers of the API.
        line_total: itemGrandTotal,
      };
    });
    setLoading(true);
    try {
      const res = await dispatch(postOrUpdateData(
        urls.addpo,
        {
          ...rest, 
          items: calculatedItems,
          punched_by: {
            id: user?.id,
            name: user?.name,
            employee_code: user?.employee_code,
          },
          total_price: totalAmount,
          special_discount: Number(specialDiscount || 0),
          grand_total: grandTotal
        }
      ));
      if (res?.success) {
        setFields({});
        setRenderPO(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const [specialDiscount, setSpecialDiscount] = useState("");

  const totalAmount = (fields?.items || [])
    .reduce((sum, item) => sum + calculateLineItem(item).grandTotal, 0);

  const grandTotal = totalAmount - Number(specialDiscount || 0);

  return (
    <div className='mb-5'>

      <div className="card p-4">
        <form className="row" onSubmit={handleSubmit}>

          <div className="col-md-6 mb-4">
            <label className='form-label'>Company <span className='text-danger'>*</span></label>
            <select
              className='form-select'
              name='company'
              value={fields?.company || ""}
              onChange={handleChange}
              required
            >
              <option value="">Select Company</option>
              {companies?.map((c, i) => {
                return (
                  <option key={i} value={c?.company_name}>{c?.company_name}</option>
                )
              })}
            </select>
          </div>

          <div className="col-md-6 mb-4">
            <label className='form-label'>Vendor <span className='text-danger'>*</span></label>
            <select
              className='form-select'
              name='vendor'
              value={fields?.vendor || ""}
              onChange={handleChange}
              required
            >
              <option value="">Select Vendor</option>
              {vendors?.map((v, i) => {
                return (
                  <option key={i} value={v?.company_name}>{v?.company_name}</option>
                )
              })}
            </select>
          </div>

          <div className="col-md-3 mb-4">
            <label className='form-label'>Terms <span className='text-danger'>*</span></label>
            <select
              className='form-select'
              name='terms'
              value={fields?.terms || ""}
              onChange={handleChange}
              required
            >
              <option value="">Select Terms</option>
              {terms?.map((t, i) => {
                return (
                  <option key={i} value={t?.term}>{t?.term}</option>
                )
              })}
            </select>
          </div>

          <div className="col-md-3 mb-4">
            <label className='form-label'>Ship Via <span className='text-danger'>*</span></label>
            <select
              className='form-select'
              name='ship_via'
              value={fields?.ship_via || ""}
              onChange={handleChange}
              required
            >
              <option value="">Select Shipping</option>
              {shipping?.map((v, i) => {
                return (
                  <option key={i} value={v?.ship_via}>{v?.ship_via}</option>
                )
              })}
            </select>
          </div>

          <div className="col-md-3 mb-4">
            <label className='form-label'>Currency <span className='text-danger'>*</span></label>
            <select
              className='form-select'
              name='currency'
              value={fields?.currency || ""}
              onChange={handleChange}
              required
            >
              <option value="">Select Currency</option>
              {currency?.map((v, i) => {
                return (
                  <option key={i} value={v?.currency}>{v?.currency}</option>
                )
              })}
            </select>
          </div>

          <div className="col-md-3 mb-4">
            <label className='form-label'>Shipping Account Number <span className='text-danger'>*</span></label>
            <input 
              type="text" 
              className='form-control'
              disabled
              name='shipping_account_number'
              value={fields?.shipping_account_number || ""}
              required
            />
          </div>

          <div className="col-md-12 mb-4">
            <label className='form-label'>Select Items <span className='text-danger'>*</span></label>
            <Select
              isMulti 
              name="items"
              options={products?.map((p) => ({
                value: p.id,
                label: `${p.item_code} - ${p.description} - ${p.presentation}`,
                data: p
              }))}

              value={fields?.items || []}

              onChange={(selected) => {
                setFields(prev => {
                  const existingItems = prev.items || [];

                  return {
                    ...prev,
                    items: (selected || []).map((item) => {
                      const existingItem = existingItems.find(
                        (currentItem) => currentItem.value === item.value
                      );

                      // React Select returns fresh option objects whenever the
                      // selection changes. Reuse the existing row so manually
                      // entered price, GST, quantity, and discount remain intact.
                      return {
                        ...item,
                        ...existingItem,
                        qty: existingItem?.qty ?? 1,
                        price: existingItem?.price ?? "",
                        gst: existingItem?.gst ?? "",
                        discount: existingItem?.discount ?? 0,
                      };
                    }),
                  };
                });
              }}
            />
            {
              fields?.items?.length > 0 && (
                <div className="mt-2 table-responsive">

                  <table className="table table-bordered">

                    <thead className='table-light'>
                      <tr>
                        <th>Item</th>
                        <th>Presentation</th>
                        <th width="120">Qty</th>
                        <th width="150">Price</th>
                        <th width="120">GST (%)</th>
                        <th width="120">GST Amount</th>
                        <th width="150">Total</th>
                        <th width="150">Discount (%)</th>
                        <th width="150">Grand Total</th>
                      </tr>
                    </thead>

                    <tbody>

                      {fields.items.map((item, index) => {

  const { gstAmount, total, discountAmount, grandTotal: itemGrandTotal } = calculateLineItem(item);

  return (
    <tr key={item.value}>

      <td>
        {item.data.item_code} - {item.data.description}
      </td>

      <td>
        {item.data.presentation}
      </td>

      <td>
        <input
          type="number"
          min="1"
          className="form-control"
          value={item.qty}
          onChange={(e) =>
            handleItemChange(index, "qty", e.target.value)
          }
          onWheel={(e) => e.target.blur()}
        />
      </td>

      <td>
        <input
          type="number"
          min="0"
          className="form-control"
          value={item.price}
          onChange={(e) =>
            handleItemChange(index, "price", e.target.value)
          }
          onWheel={(e) => e.target.blur()}
        />
      </td>

      <td>
        <input
          type="number"
          min="0"
          className="form-control"
          value={item.gst}
          onChange={(e) =>
            handleItemChange(index, "gst", e.target.value)
          }
          onWheel={(e) => e.target.blur()}
        />
      </td>

      <td>
        <input
          className="form-control"
          value={gstAmount.toFixed(2)}
          disabled
        />
      </td>

      <td>
        ₹ {total.toFixed(2)}
      </td>

      <td>
        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          className="form-control"
          value={item.discount}
          onChange={(e) =>
            handleItemChange(
              index,
              "discount",
              e.target.value
            )
          }
          onWheel={(e) => e.target.blur()}
        />
      </td>

      <td>
        <p className="text-end mb-1">
          ₹ {total.toFixed(2)}
        </p>

        <p className="text-end mb-1">
          - ₹ {discountAmount.toFixed(2)}
        </p>

        <p className="text-end mb-0">
          = ₹ {itemGrandTotal.toFixed(2)}
        </p>
      </td>

    </tr>
  );
})}

                      <tr className='table-secondary fw-bold'>
                        <td colSpan="8" className='text-end'>
                          Total Amount
                        </td>
                        <td>
                          ₹ {totalAmount.toFixed(2)}
                        </td>
                      </tr>

                      <tr className='fw-bold'>
                        <td colSpan="8" className='text-end'>
                          Special Discount
                        </td>
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
                        <td colSpan="8" className='text-end'>
                          Grand Total
                        </td>
                        <td>
                          ₹ {grandTotal.toFixed(2)}
                        </td>
                      </tr>

                    </tbody>

                  </table>

                </div>
              )
            }
          </div>

          <div className="col-md-12 mb-4">

            <label className='form-label'>
              Select Remarks
            </label>

            <Select
              isMulti
              name="remarks"

              options={remarks?.map((r) => ({
                value: r.remark,
                label: r.remark
              }))}

              value={
                fields?.remarks?.map((remark) => ({
                  value: remark,
                  label: remark
                })) || []
              }

              onChange={(selected) => {
                setFields(prev => ({
                  ...prev,
                  remarks: selected?.map(
                    item => item.value
                  ) || []
                }));
              }}
            />

            {
              fields?.remarks?.length > 0 && (

                <div className="table-responsive mt-3">

                  <table className="table table-bordered">

                    <thead className="table-light">
                      <tr>
                        <th>Remark</th>
                        <th width="120">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      {fields.remarks.map(
                        (remark, index) => (

                        <tr key={index}>

                          <td
                            style={{
                              whiteSpace: "pre-line"
                            }}
                          >
                            {remark}
                          </td>

                          <td>

                            <button
                              type="button"
                              className="btn btn-danger btn-sm"

                              onClick={() => {

                                setFields(prev => ({
                                  ...prev,

                                  remarks:
                                    prev.remarks.filter(
                                      (_, i) =>
                                        i !== index
                                    )
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

              )
            }

          </div>

          <div className="col-md-12 mb-4">
            <label className='form-label'>Internal Remarks</label>
            <textarea 
              rows={5}
              className='form-control'
              name='internal_remarks'
              value={fields?.internal_remarks || ""}
              onChange={handleChange}
              placeholder='Enter Remarks (optional)'
            />
          </div>



          <div className="col-md-12 d-flex gap-3 justify-content-end mt-4">
            <button className='btn btn-secondary' type='button' onClick={handleReset}>Reset</button>
            <button className='btn btn-info'>Generate Quotation</button>
          </div>

        </form>
      </div>

      {/* {renderPO && 
        
      } */}
      <Modal
        showModal={renderPO}
        title="Quotation Order"
        onclose={() => setRenderPO(false)}
        size='xl'
        content={
          loading ? <Loader /> :
            <div>
            <div className="modal-body" ref={componentRef}>
              <PurchaseOrderTemplate data={fields} />
            </div>
            <div className="modal-footer">
              <button className='btn btn-primary' onClick={submitPO}>Save</button>
            </div>
          </div>
        }
      />

    </div>
  )
}
