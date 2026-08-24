import React, { useEffect, useState } from "react";
import { FadeLoader } from "react-spinners";
import Loader from "./Loader";
import { formatHeader } from "../utils/FormatString";
import { base_url } from "../redux/urls";
import Modal from "./Modal";

function DetailValue({ value, path = "value" }) {
  if (Array.isArray(value)) {
    if (!value.length) return <span className="detail-empty">Empty list</span>;

    return value.every((item) => item === null || typeof item !== "object") ? (
      <div className="detail-pills">
        {value.map((item, index) => (
          <span className="detail-pill" key={`${path}-${index}`}>{String(item)}</span>
        ))}
      </div>
    ) : (
      <div className="detail-list">
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
              <DetailValue value={nestedValue} path={`${path}-${key}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <span>{value === null || value === undefined || value === "" ? "--" : String(value)}</span>;
}

export default function CustomTable({headers, data, title, loading=false, actionButton = null, actionHeaders = null, actionCells = null, user}) {
  
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
    const value = e.target.value;
    setSearch(value);
    if (!value) {
      setTableData(data);
      return;
    }
    const filtered = data.filter((row) =>
      headers.some((key) =>
        row[key]?.toString().toLowerCase().includes(value.toLowerCase())
      )
    );
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
        <table className="table table-hover table-bordered custom-table" id={title}>
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
                          val = <p className={`card rounded-5 text-center text-white ${d[h] ? "bg-info" : "bg-secondary"}`}>{d[h] ? "Active": "Non-Active"}</p>;
                        } else if(typeof d[h] === "object" && d[h]?.length) {
                          val = <div>
                            {d[h].map((v, i) => {
                              return (
                                <p key={i} className="card rounded-5 text-center px-2 mb-2 bg-light">{v}</p>
                              )
                            })}
                          </div>;
                        } else if(h === "company_logo") {
                          val = d[h] ? <img src={`${base_url}${d[h]}`} alt="Not Found" /> : "--";
                        }
                        return (
                            <td key={j} style={{minWidth: "100px"}}>{val || "--"}</td>
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
        size="lg"
        content={
          <div className="detail-modal-body">
            {selectedRow && <DetailValue value={selectedRow} />}
          </div>
        }
      />
    </div>
  );
}
