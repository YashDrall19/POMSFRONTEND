import React, { useEffect, useState } from "react";
import { FadeLoader } from "react-spinners";
import Loader from "./Loader";
import { formatHeader } from "../utils/FormatString";
import { base_url } from "../redux/urls";

export default function CustomTable({headers, data, title, loading=false, actionButton = null, actionHeaders = null, actionCells = null}) {                         // 
  
  const [tableData, setTableData] = useState([]);
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
              {actionHeaders && 
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
                    <td colSpan={headers?.length + 1} className="text-center">
                        <Loader />
                    </td>
                </tr>) :
                tableData?.length > 0 ? (tableData?.map((d, i) => (
                    <tr key={i} className="cursor-pointer">
                      <td>{i+1}.</td>
                      {headers.map((h, j) => {
                        let val = d[h];
                        if (typeof d[h] === "boolean") {
                          val = <p className={`card rounded-5 text-center text-white ${d[h] ? "bg-info" : "bg-secondary"}`}>{d[h] ? "Active": "Non-Active"}</p>;
                        } else if(typeof d[h] === "object" && d[h]?.length) {
                          val = <div>
                            {d[h].map((v, i) => {
                              return (
                                <p key={i} className="card rounded-5 text-center p-1 bg-light">{v}</p>
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
                      {actionCells && (
                        <td>
                          <div className="d-flex gap-2 align-items-center">
                            {actionCells(d, i)}
                          </div>
                        </td>
                      )}
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan={headers?.length + 1} className="text-center">
                    No results found
                    </td>
                </tr>
                )
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}