import "./template.css";
import logo from "../../public/pivlogo.png";
import { ToWords } from "to-words";
import { formatOrderAmount, getLineTotal, getOrderTotals } from "../utils/orderTotals";


export default function InvoiceTemplate({ data, invoices, copyLabel = "Original Copy for Recipient" }) {

  const amountToWords = (amount, country = "IN") => {
    if (!amount) {
      return;
    }
    const config = {
      IN: {
        localeCode: "en-IN",
        currencyOptions: {
          name: "Rupee",
          plural: "Rupees",
          symbol: "₹",
          fractionalUnit: {
            name: "Paisa",
            plural: "Paise",
            symbol: "",
          },
        },
      },
      US: {
        localeCode: "en-US",
        currencyOptions: {
          name: "Dollar",
          plural: "Dollars",
          symbol: "$",
          fractionalUnit: {
            name: "Cent",
            plural: "Cents",
            symbol: "",
          },
        },
      },
    };

    const options = config[country] || config.IN;

    const toWords = new ToWords({
      localeCode: options.localeCode,
      converterOptions: {
        currency: true,
        ignoreDecimal: false,
        ignoreZeroCurrency: false,
        doNotAddOnly: false,
        currencyOptions: options.currencyOptions,
      },
    });

    return toWords.convert(amount);
  };

  const { totalPrice, specialDiscount, grandTotal } = getOrderTotals(data);

  const getFormattedDate = (dateTime) => {
    const date = new Date(dateTime);

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };

  // const componentRef = useRef();
  // const handlePrint = useReactToPrint({
  //   contentRef: componentRef,
  //   documentTitle: "Purchase_Order",
  // });

  return (
    <div className="po-container">
      {/* ref={componentRef} */}

      <div className="d-flex justify-content-between mb-2">
        <div>
          <img src={logo} alt="" style={{width: "40px"}} />
        </div>
        <div>CIN: U24100DL2014PTC264996</div>
      </div>

      <div className="d-flex justify-content-between align-items-end">
        <div>
          <p><strong>{data?.vendor_data?.company_name}</strong></p>
          <p>{data?.vendor_data?.address}</p>
          <p>Ph: {data?.vendor_data?.phone?.join(", ")}</p>
          <p>Tel: {data?.vendor_data?.telephone?.join(", ")}</p>
          <p>Email: {data?.vendor_data?.email?.join(", ")}</p>
          <p>Contact Person: {data?.vendor_data?.contact_person}</p>
        </div>
        <div>
          <table className="table table-bordered mb-1">
            <thead>
              <tr>
                <td colSpan={2} className="text-center p-0 fs-5">INVOICE</td>
              </tr>
              <tr>
                <td className="text-center p-1">INVOICE No.</td>
                <td className="text-center p-1">Date</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-center p-1">{invoices?.find(i => i?.po_number === data?.po_number)?.invoice_number}</td>
                <td className="text-center p-1">{getFormattedDate(data?.created_at || new Date())}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="billing mb-4 mt-2">

        <div className="address" style={{backgroundColor: "#f4faff"}}>
          <p><strong>Bill To</strong></p>
          <p><strong>{data?.company_data?.company_name}</strong></p>
          <p>{data?.company_data?.address}</p>
          {data?.company_data?.tax_registration && <p>GST No.- {data?.company_data?.tax_registration}</p>}
          <p>Phone Number: {data?.company_data?.phone?.join(", ")}</p>
          <p>Contact Person: {data?.company_data?.contact_person}</p>
        </div>

        <div className="address" style={{backgroundColor: "#f4faff"}}>
          <p><strong>Ship To</strong></p>
          <p><strong>{data?.company_data?.company_name}</strong></p>
          <p>{data?.company_data?.address}</p>
          {data?.company_data?.tax_registration && <p>GST No.- {data?.company_data?.tax_registration}</p>}
          <p>Phone Number: {data?.company_data?.phone?.join(", ")}</p>
          <p>Contact Person: {data?.company_data?.contact_person}</p>
        </div>

      </div>

      <div className="shipping my-3">
        <table className="table table-bordered text-center">
          <thead>
            <tr>
              <th>Terms</th>
              <th>Ship Via</th>
              <th>Currency</th>
              <th>Shipping Account No.</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{data?.terms}</td>
              <td>{data?.ship_via}</td>
              <td>{data?.currency}</td>
              <td>{data?.shipping_account_number}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <table className="table table-bordered">

        <thead className="table-secondary">
          <tr>
            <th>Item Code</th>
            <th>Item</th>
            <th>Presentation</th>
            <th>Qty</th>
            <th>Price</th>
            <th>GST</th>
            <th>Discount</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>

          {data?.items?.map((item,i)=>{

            const total = getLineTotal(item);

            return(
              <tr key={i}>
                <td>
                  {item.data.item_code}                  
                </td>
                <td>{item.data.description}</td>

                <td>
                  {item.data.presentation}
                </td>

                <td>{item.qty}</td>

                <td>{item.price}</td>
                <td>{item.gst}%</td>
                <td>{item.discount || 0}%</td>

                <td>{total.toFixed(2)}</td>
              </tr>
            )

          })}

          <tr><td colSpan="7" className="text-end"><strong>Subtotal</strong></td><td><strong>{formatOrderAmount(totalPrice, data?.currency)}</strong></td></tr>
          <tr><td colSpan="7" className="text-end"><strong>Special Discount</strong></td><td><strong>- {formatOrderAmount(specialDiscount, data?.currency)}</strong></td></tr>
          <tr>
            <td colSpan="6">
              <strong>
                {amountToWords(grandTotal)}
              </strong>
            </td>
            <td className="text-end"><strong>Grand Total</strong></td>
            <td><strong>{formatOrderAmount(grandTotal, data?.currency)}</strong></td>
          </tr>

        </tbody>

      </table>

      <div className="remarks">
        <h6>Remarks:</h6>
        <div>
          <div><strong>{data?.internal_remarks}</strong></div>
          {data?.remarks?.map((r, i) => {
            return (
              <div key={i}><strong>{r}</strong></div>
            )
          })}
        </div>
      </div>


      <div className="bank_details mt-3">
        <table className="table table-bordered">
          <tbody>
            <tr>
              <td colSpan={2} className="text-center"><strong>Bank Details for Customers</strong></td>
            </tr>
            <tr>
              <td>
                <p>HDFC Bank Ltd.</p>
                <p>A/C No.-01582320004506</p>
                <p>IFSC-HDFC0000158</p>
              </td>
              <td>
                <p>State Bank of India</p>
                <p>A/C no.64061689117</p>
                <p>IFSC-SBIN0017983</p>
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="text-center"><strong>For UPI/Credit Card:- https://lifetechindia.com/payments.php</strong></td>
            </tr>
            <tr><td colSpan={2} className="text-center">{copyLabel}</td></tr>
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-center">Quotation Reference Number: {data?.po_number}</p>
      <p className="mt-4 text-center">Research Use Only</p>

      {/* <div className="d-flex justify-content-end">
        <button className="btn btn-primary" onClick={handlePrint}>Save as PDF</button>
      </div> */}
    </div>
  )
}
