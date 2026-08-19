import React from 'react'
import { ToWords } from "to-words";
import { getFormattedDate, getFormattedDateDot } from '../utils/DateTime';

export default function Quotation({data}) {
	console.log(data)

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

  return (
    <div>
      <div className="modal-content p-2">
				<div className='table-responsive'>
					<table className='table-bordered w-100' id='quotation'>
						<tbody>

							<tr>
								<td colSpan={13} className='text-center'>QUOTATION</td>
							</tr>

							<tr>
								<td>{" "}</td>
								<td>{" "}</td>
								<td>{" "}</td>
								<td>{" "}</td>
								<td>{" "}</td>
								<td>{" "}</td>
							</tr>

							<tr>
								<td colSpan={6}><strong>{data?.company_data?.company_name}</strong></td>
								<td colSpan={3}>Voucher No.</td>
								<td colSpan={2}>Dated:</td>
								<td colSpan={2}>Quotation No.:</td>
							</tr>

							<tr>
								<td colSpan={6}>308, Aggarwal City Mall, Road No. 44</td>
								<td><strong>{`${data?.company_data?.prefix}-${data?.vendor_data?.prefix}-${getFormattedDateDot(data?.created_at)}`}</strong></td>
								<td></td>
								<td></td>
								<td colSpan={2}>{getFormattedDateDot(data?.created_at)}</td>
								<td colSpan={3}>{data?.po_number}</td>
							</tr>

							<tr>
								<td colSpan={6}>Pitampura, North West Delhi, Delhi, 110034</td>
								<td colSpan={3}></td>
								<td colSpan={4}>Mode/Terms of Payment </td>
							</tr>

							<tr>
								<td colSpan={6}>State Code-07</td>
								<td colSpan={3}></td>
								<td colSpan={4}><strong>Advance</strong></td>
							</tr>

							<tr>
								<td colSpan={6}>GSTIN/UIN:  07AAMCA4411E2Z0</td>
								<td colSpan={3}>Buyer's Ref./Order No.</td>
								<td colSpan={4}>Other References</td>
							</tr>

							<tr>
								<td colSpan={6}>State Name :  Delhi, Code : 07</td>
								<td colSpan={3}></td>
								<td colSpan={4}></td>
							</tr>

							<tr>
								<td colSpan={6}>E-Mail: finance@arshbiotech.com</td>
								<td colSpan={7}>
									<strong>Terms of delivery: </strong>
									{data?.remarks?.map((rem, i) => {
										return (
											<div key={i}>{i+1}) {rem}</div>
										)
									})}
									<p>{data?.internal_remarks}</p>
								</td>
							</tr>

							<tr>
								<td colSpan={6}>Consignee (Ship to)</td>
								<td colSpan={7}></td>
							</tr>

							<tr>
								<td colSpan={6}><strong>{data?.vendor_data?.company_name}</strong></td>
								<td colSpan={7}></td>
							</tr>

							<tr>
								<td colSpan={6}>{data?.vendor_data?.address}</td>
								<td colSpan={7}></td>
							</tr>

							<tr>
								<td colSpan={6}>Contact no.- {data?.vendor_data?.phone?.join(", ")}</td>
								<td colSpan={7}></td>
							</tr>

							<tr>
								<td colSpan={3}>GSTIN/UIN:</td>
								<td colSpan={3}>{data?.vendor_data?.gst || "--"}</td>
								<td colSpan={7}></td>
							</tr>

							<tr>
								<td colSpan={3}>State Name:</td>
								<td colSpan={3}>--</td>
								<td colSpan={7}></td>
							</tr>

							<tr>
								<td colSpan={3}>State Code:</td>
								<td colSpan={3}>--</td>
								<td colSpan={7}></td>
							</tr>

							<tr>
								<td colSpan={6}>Buyer (Bill to)</td>
								<td colSpan={7}></td>
							</tr>

							<tr>
								<td colSpan={6}><strong>{data?.vendor_data?.company_name}</strong></td>
								<td colSpan={7}></td>
							</tr>

							<tr>
								<td colSpan={6}>{data?.vendor_data?.address}</td>
								<td colSpan={7}></td>
							</tr>

							<tr>
								<td colSpan={6}>Contact no.- {data?.vendor_data?.phone?.join(", ")}</td>
								<td colSpan={7}></td>
							</tr>

							<tr>
								<td colSpan={3}>GSTIN/UIN:</td>
								<td colSpan={3}>{data?.vendor_data?.gst || "--"}</td>
								<td colSpan={7}></td>
							</tr>

							<tr>
								<td colSpan={3}>State Name:</td>
								<td colSpan={3}>--</td>
								<td colSpan={7}></td>
							</tr>

							<tr>
								<td colSpan={3}>State Code:</td>
								<td colSpan={3}>--</td>
								<td colSpan={7}></td>
							</tr>

							<tr>
								<td>Sl</td>
								<td colSpan={5}>Description of Goods</td>
								<td>HSN/SAC</td>
								<td>Quantity</td>
								<td>Rate</td>
								<td>GST</td>
								<td>Discount</td>
								<td>Per</td>
								<td>Amount</td>
							</tr>

							<tr>
								<td>No.</td>
							</tr>

							{/* <tr>
								<td>1</td>
								<td colSpan={7}>Indirubin 10MG-T6169-10MG</td>
								<td>382200</td>
								<td>1 no</td>
								<td>13,555</td>
								<td>No</td>
								<td>13,555</td>
							</tr> */}

							{data?.items?.map((d, i) => {
								return (
									<tr key={i}>
										<td>{i+1}</td>
										<td colSpan={5}>{d?.data?.description}</td>
										{/* <td colSpan={7}>{d?.data?.description}-{d?.data?.item_code}-{d?.data?.presentation}</td> */}
										<td>{d?.data?.item_code}</td>
										<td>{d?.qty}</td>
										<td>{d?.price}</td>
										<td>{d?.gst}</td>
										<td>{d?.discount}</td>
										<td>No</td>
										<td><strong>{d?.qty * d?.price + ((d?.gst * d?.price)/100) - d?.discount}</strong></td>
									</tr>
								)
							})}

							{/* <tr>
								<td colSpan={7} className='text-end'>IGST</td>
								<td>5%</td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td>678</td>
							</tr>

							<tr>
								<td colSpan={7} className='text-end'>CGST</td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
							</tr>

							<tr>
								<td colSpan={7} className='text-end'>SGST</td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
							</tr> */}

							{/* <tr>
								<td colSpan={6} className='text-end'>Sum rounded off</td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
							</tr> */}

							<tr>
								<td colSpan={6} className="text-end">
									<strong>Total</strong>
								</td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td>
									<strong>
										{data?.items?.reduce((total, item) => {
											const qty = Number(item?.qty || 0);
											const price = Number(item?.price || 0);
											const gst = Number(item?.gst || 0);
											const discount = Number(item?.discount || 0);

											return total + (qty * price) + ((gst * price) / 100) - discount;
										}, 0)}
									</strong>
								</td>
							</tr>

							<tr>
								<td colSpan={6}>Amount Chargeable (in words)</td>
								<td colSpan={7}></td>
							</tr>

							<tr>
								<td colSpan={6}><strong>
									{amountToWords(
										data?.items?.reduce(
											(total, item) =>
												total + (Number(item?.qty || 0) * Number(item?.price || 0)),
											0
										)
									)}
								</strong></td>
								<td>Company's Bank Details</td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
							</tr>

							<tr>
								<td colSpan={6}>
									<strong>Terms of delivery: </strong>
									{data?.remarks?.map((rem, i) => {
										return (
											<div key={i}>{i+1}) {rem}</div>
										)
									})}
									<p>{data?.internal_remarks}</p>
								</td>
								<td>A/c Holder's Name:</td>
								<td><strong>Arsh Biotech Private Limited</strong></td>
								<td colSpan={5}></td>
							</tr>

							<tr>
								<td colSpan={6}></td>
								<td>Bank Name:</td>
								<td><strong>HDFC Bank</strong></td>
								<td colSpan={5}></td>
							</tr>

							<tr>
								<td colSpan={3}>Company's PAN:</td>
								<td colSpan={3}><strong>AAMCA4411E</strong></td>
								<td>A/c No.:</td>
								<td><strong>50200006661451</strong></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
							</tr>

							<tr>
								<td colSpan={6}></td>
								<td>Branch & IFS Code:</td>
								<td><strong>Pitampura, HDFC0000158</strong></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
							</tr>

							<tr>
								<td colSpan={6}></td>
								<td colSpan={7}><strong>for Arsh Biotech Private Limited</strong></td>
							</tr>

							<tr>
								<td colSpan={6}></td>
								<td colSpan={5} className='text-end'>Authorised Signatory</td>
								<td></td>
								<td></td>
							</tr>

							<tr>
								<td colSpan={13} className='text-center'>This is a Computer Generated Document</td>
							</tr>

						</tbody>
					</table>
				</div>
			</div>
			<div className="modal-footer">
				<button className='btn btn-success' onClick={exportTable}>Generate</button>
			</div>
    </div>
  )
}


import * as XLSX from "xlsx";

const exportTable = () => {
  const table = document.getElementById("quotation");
  const workbook = XLSX.utils.table_to_book(table, {
    sheet: "Sheet1"
  });

  XLSX.writeFile(workbook, "table.xlsx");
};