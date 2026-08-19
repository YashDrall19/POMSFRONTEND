import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { useDispatch } from "react-redux";
import { postOrUpdateData, urls } from "../../../redux/urls";

const Upload = ({ getProducts }) => {
	const dispatch = useDispatch();

	const headers = [
		"Item Code",
		"Description",
		"Presentation",
	];

	const [rows, setRows] = useState([]);
	const [uploading, setUploading] = useState(false);

	const onDrop = (acceptedFiles) => {
		const file = acceptedFiles?.[0];

		if (!file) return;

		const reader = new FileReader();

		reader.onload = (event) => {
			try {
				const data = event.target.result;

				const workbook = XLSX.read(data, {
					type: "array",
				});

				const sheetName = workbook.SheetNames[0];

				const worksheet = workbook.Sheets[sheetName];

				const jsonData = XLSX.utils.sheet_to_json(worksheet, {
					defval: "",
				});

				const transformedData = jsonData.map((row) => {
          const normalizedRow = {};

          Object.keys(row).forEach((key) => {
            normalizedRow[key.replace(/\s+/g, "").toLowerCase()] = row[key];
          });
          console.log(normalizedRow)

          return {
            "Item Code": normalizedRow.productcode || "",
            Description: normalizedRow.productchinesename || "",
            Presentation: normalizedRow.productsku || "",
          };
        });

				setRows(transformedData);
			} catch (error) {
				console.error(error);
			}
		};

		reader.readAsArrayBuffer(file);
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		multiple: false,
		accept: {
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
				".xlsx",
			],
			"application/vnd.ms-excel": [".xls"],
			"text/csv": [".csv"],
		},
	});

	const uploadSingle = async (row, index) => {
    try {
      const payload = {
        item_code: row["Item Code"],
        description: row["Description"],
        presentation: row["Presentation"],
      };

      const res = await dispatch(
        postOrUpdateData(
          urls.addproduct,
          payload
        )
      );

      if (res?.success) {
        setRows((prev) => prev.filter((_, i) => i !== index));
      }
    } catch (error) {
      console.error(error);
    }
  };

	const uploadAll = async () => {
    try {
      setUploading(true);

      const failedRows = [];

      for (let i = 0; i < rows.length; i++) {
        try {
          const payload = {
            item_code: rows[i]["Item Code"],
            description: rows[i]["Description"],
            presentation: rows[i]["Presentation"],
          };

          const res = await dispatch(
            postOrUpdateData(
              urls.addproduct,
              payload
            )
          );

          if (!res?.success) {
            failedRows.push(rows[i]);
          }
        } catch (error) {
          console.error(`Failed to upload row ${i + 1}`, error);
          failedRows.push(rows[i]);
        }
      }

      setRows(failedRows);

      if (getProducts) {
        getProducts();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const resetPage = () => {
    setRows([]);
    setUploading(false);
    setSearch(""); // if you have search
  };

	return (
		<div
			// style={{
			// 	maxWidth: "1400px",
			// 	margin: "40px auto",
			// 	padding: "20px",
			// }}
		>
			<h2>Upload Products</h2>

			<div
				{...getRootProps()}
				style={{
					border: "2px dashed #bdbdbd",
					borderRadius: "12px",
					padding: "50px",
					textAlign: "center",
					cursor: "pointer",
					background: isDragActive
						? "#f8f9fa"
						: "#ffffff",
					marginBottom: "20px",
				}}
			>
				<input {...getInputProps()} />

				{isDragActive ? (
					<p>Drop the file here...</p>
				) : (
					<>
						<p
							style={{
								margin: 0,
								fontSize: "16px",
							}}
						>
							Drag & Drop Excel File Here
						</p>
						<p
							style={{
								marginTop: "10px",
								color: "#666",
							}}
						>
							or click to browse
						</p>
					</>
				)}
			</div>

			{rows.length > 0 && (
				<>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "12px",
							marginBottom: "20px",
              justifyContent: "space-between"
						}}
					>
						<button
							onClick={uploadAll}
							disabled={uploading}
							style={{
								padding: "10px 20px",
								border: "none",
								borderRadius: "6px",
								background: "#198754",
								color: "#fff",
								cursor: "pointer",
							}}
						>
							{uploading
								? "Uploading..."
								: "Upload All"}
						</button>

						<span>
							Total Products:
							<strong>
								{" "}
								{rows.length}
							</strong>
						</span>

            <button className="btn btn-danger" onClick={resetPage}>Clear</button>
					</div>

					<div
						style={{
							overflowX: "auto",
							border: "1px solid #ddd",
							borderRadius: "8px",
						}}
					>
						<table
							style={{
								width: "100%",
								borderCollapse: "collapse",
							}}
						>
							<thead>
								<tr>
									<th
										style={{
											border:
												"1px solid #ddd",
											padding: "12px",
											background:
												"#f8f9fa",
										}}
									>
										#
									</th>

									{headers.map(
										(header) => (
											<th
												key={header}
												style={{
													border:
														"1px solid #ddd",
													padding:
														"12px",
													background:
														"#f8f9fa",
													textAlign:
														"left",
												}}
											>
												{header}
											</th>
										)
									)}

									<th
										style={{
											border:
												"1px solid #ddd",
											padding: "12px",
											background:
												"#f8f9fa",
										}}
									>
										Action
									</th>
								</tr>
							</thead>

							<tbody>
								{rows.map(
									(row, index) => (
										<tr key={index}>
											<td
												style={{
													border:
														"1px solid #ddd",
													padding:
														"10px",
												}}
											>
												{index +
													1}
											</td>

											{headers.map(
												(
													header
												) => (
													<td
														key={
															header
														}
														style={{
															border:
																"1px solid #ddd",
															padding:
																"10px",
														}}
													>
														{row[
															header
														] ||
															"-"}
													</td>
												)
											)}
											<td
												style={{
													border:
														"1px solid #ddd",
													padding:
														"10px",
												}}
											>
												<button
													onClick={() =>
														uploadSingle(
															row,
															index
														)
													}
													style={{
														padding:
															"6px 14px",
														border:
															"none",
														borderRadius:
															"4px",
														background: "#0d6efd",
														color:
															"#fff",
														cursor: "pointer"
													}}
												>
													Add
												</button>
											</td>
										</tr>
									)
								)}
							</tbody>
						</table>
					</div>
				</>
			)}
		</div>
	);
};

export default Upload;