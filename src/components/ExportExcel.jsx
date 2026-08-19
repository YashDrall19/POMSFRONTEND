import React from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

export default function ExportExcel({
  tableId,
  fileName = "data",
  buttonText = "Download Excel",
}) {
  const handleExport = () => {
    const table = document.getElementById(tableId);

    if (!table) {
      toast.error("Table not found.");
      return;
    }

    // Check if table has data rows
    const tbodyRows = table.querySelectorAll("tbody tr");

    if (tbodyRows.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    // Clone table so original UI is not modified
    const clonedTable = table.cloneNode(true);

    // Find "Actions" column index
    const headers = clonedTable.querySelectorAll("thead th");
    let actionsColIndex = -1;

    headers.forEach((th, index) => {
      if (th.textContent.trim().toLowerCase() === "actions") {
        actionsColIndex = index;
      }
    });

    // Remove Actions column from all rows
    if (actionsColIndex !== -1) {
      clonedTable.querySelectorAll("tr").forEach((row) => {
        const cells = row.children;

        if (cells[actionsColIndex]) {
          cells[actionsColIndex].remove();
        }
      });
    }

    const workbook = XLSX.utils.table_to_book(clonedTable, {
      sheet: "Sheet1",
    });

    XLSX.writeFile(workbook, `${fileName}.xlsx`);

    toast.success("Excel file downloaded successfully.");
  };

  return (
    <button
      type="button"
      className="btn btn-outline-success"
      onClick={handleExport}
    >
      {buttonText}
    </button>
  );
}