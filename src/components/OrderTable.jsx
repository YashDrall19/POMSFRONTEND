import React, { useEffect, useState } from "react";
import { FadeLoader } from "react-spinners";
import Loader from "./Loader";
import { formatHeader } from "../utils/FormatString";
import { getFormattedDate } from "../utils/DateTime";
import Modal from "./Modal";
import PurchaseOrderTemplate from "./PurchaseOrderTemplate";

function DetailValue({ value, path = "value", horizontal = false }) {
  if (Array.isArray(value)) {
    if (!value.length) return <span className="detail-empty">Empty list</span>;

    return value.every((item) => item === null || typeof item !== "object") ? (
      <div className="detail-pills">
        {value.map((item, index) => (
          <span className="detail-pill" key={`${path}-${index}`}>{String(item)}</span>
        ))}
      </div>
    ) : (
      <div className={`detail-list ${horizontal ? "detail-list-horizontal" : ""}`}>
        {value.map((item, index) => (
          <div className="detail-list-item" key={`${path}-${index}`}>
            <span className="detail-list-index">{index + 1}</span>
            <DetailValue value={item} path={`${path}-${index}`} />
          </div>
        ))}
      </div>
    );
  }

  if (value && typeof value === "object") {
    return (
      <div className="detail-object">
        {Object.entries(value).map(([key, nestedValue]) => (
          <div className="detail-field" key={`${path}-${key}`}>
            <div className="detail-label">{formatHeader(key)}</div>
            <div className="detail-value">
              <DetailValue
                value={nestedValue}
                path={`${path}-${key}`}
                horizontal={key === "items"}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <span>{value === null || value === undefined || value === "" ? "--" : String(value)}</span>;
}

export default function OrderTable({headers, data, title, loading=false, actionButton = null, actionHeaders = null, actionCells = null, user}) {
  
  const [tableData, setTableData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const showActions = user?.role === "ADMIN";
  const columnCount = headers.length + 1 + (showActions ? Math.max(actionHeaders?.length || 0, actionCells ? 1 : 0) : 0);
  useEffect(() => {
    setTableData(data);
  }, [data]);

  // Search handler
  const [search, setSearch] = useState("");
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(e.target.value);

    if (!value) {
      setTableData(data);
      return;
    }

    const filtered = data.filter((row) => {
      const searchableText = JSON.stringify(row)
        .toLowerCase()
        .replace(/[{}[\]",]/g, " ");

      return searchableText.includes(value);
    });

    setTableData(filtered);
  };

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center pb-4">
        <div>
          <span className="fs-4">{title}</span> |{" "}
          <span>{tableData?.length}</span>
        </div>

        {/* Search */}
        <div className="w-50">
          <input
            type="text"
            className="form-control"
            placeholder="Search..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        {actionButton}
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-hover table-bordered order-table" id={title}>
          <thead className="table-success">
            <tr>
              <th>#</th>
              {headers?.map((h, i) => (
                <th key={i}>{formatHeader(h)}</th>
              ))}
              {showActions && actionHeaders &&
                actionHeaders?.map((a, i) => {
                  return (
                    <th key={i}>{a}</th>
                  )
                })
              }
            </tr>
          </thead>

          <tbody>
            {loading ? 
                (<tr>
                    <td colSpan={columnCount} className="text-center">
                        <Loader />
                    </td>
                </tr>) :
                tableData?.length > 0 ? (tableData?.map((d, i) => (
                    <tr key={i} className="cursor-pointer" onClick={() => setSelectedRow(d)}>
                      <td>{i+1}.</td>
                      {headers.map((h, j) => {
                        let val = d[h];
                        if (typeof d[h] === "boolean") {
                          val = <p className="card rounded-5 text-center bg-info">{d[h] ? "Active": "Non-Active"}</p>;
                        } else if (h === "Punched By") {
                          val = <div><div><strong>{d?.punched_by?.name}</strong></div><div>(Code: {d?.punched_by?.employee_code})</div></div>;
                        } else if (h === "Date") {
                          val = <div>{getFormattedDate(d?.created_at)}</div>;
                        } else if (h === "Company") {
                          val = <div>{d?.company_data?.company_name}</div>;
                        } else if (h === "Vendor") {
                          val = <div>{d?.vendor_data?.company_name}</div>;
                        } else if (h === "Quotation Status") {
                          val = <p className={`card rounded-5 text-center text-white px-3 ${d?.po_status === "Lock & Approved" ? "bg-success" : d?.po_status === "Cancelled" ? "bg-danger" : "bg-warning"}`}>{d?.po_status}</p>;
                        } else if (h === "MR Status") {
                          val = <p className={`card rounded-5 text-center text-white ${d?.mr_status === "Full" ? "bg-primary" : d?.mr_status === "Not" ? "bg-secondary" : "bg-info"}`}>{d?.mr_status} Received</p>;
                        } else if (h === "Quotation Number") {
                          val = <div>{d?.po_number}</div>;
                        } else if (h === "Products") {
                          val = <div>{d?.items?.map((i, k) => <p className="card rounded-5 text-center text-white bg-info px-3 mb-2" key={k}>{i?.data?.presentation}</p>)}</div>;
                        } else {
                          val = <div>{d[h?.toLowerCase()?.replace(" ", "_")]}</div>;
                        }
                        return (
                            <td key={j}>{val || "--"}</td>
                        )
                      })}
                      {showActions && actionCells && (
                        <td onClick={(event) => event.stopPropagation()}>
                          <div className="d-flex gap-2 align-items-center">
                            {actionCells(d, i)}
                          </div>
                        </td>
                      )}
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan={columnCount} className="text-center">
                        No results found
                    </td>
                </tr>
                )
            }
          </tbody>
        </table>
      </div>

      <Modal
        showModal={Boolean(selectedRow)}
        onclose={() => setSelectedRow(null)}
        title={`${title} Details`}
        size="xl"
        content={
          <div className="detail-modal-body">
            {selectedRow && <DetailValue value={selectedRow} />}
          </div>
        }
      />
			
			
    </div>
  );
}
