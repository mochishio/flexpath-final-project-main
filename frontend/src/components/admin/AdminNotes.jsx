import { addVisibilityIcon } from "../../utils/visibilityIcon";
import { formatDateTime } from "../../utils/date";
import { useEffect, useState } from "react";

export function AdminNotes({sectionName, columns}) {
  const [records, setRecords] = useState([]);
  const [selectedRecordIds, setSelectedRecordIds] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecords() {
      try {
        setError("");

        const response = await fetch(
          `http://localhost:8080/api/${sectionName}`
        );
        if (!response.ok) {
          throw new Error("Failed to load records");
        }

        const data = await response.json();
        setRecords(data);

      } catch (error) {
        setError(error.message);

      } finally {
        setLoading(false);
      }
    }

    loadRecords();
  }, [sectionName]);

  function handleRecordCheck(recordId) {
    if (selectedRecordIds.includes(recordId)) {
      const updatedIds = selectedRecordIds.filter((id) => id !== recordId);
      setSelectedRecordIds(updatedIds);
    } else {
      const updatedIds = [...selectedRecordIds, recordId];
      setSelectedRecordIds(updatedIds);
    }
  }

  async function handleDeleteSelected() {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedRecordIds.length} record(s)?`
    );
    if (!confirmed) { return; }

    try {
      setError("");

      for (const recordId of selectedRecordIds) {
        const response = await fetch(
          `http://localhost:8080/api/records/${recordId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete records");
        }
      }

      const updatedRecords = records.filter(
        (record) =>!selectedRecordIds.includes(record.id)
      );
      setRecords(updatedRecords);
      setSelectedRecordIds([]);

    } catch (error) {
      setError(error.message);
    }
  }

  function formatHeaderValue(headerName) {
    headerName = headerName.charAt(0).toUpperCase() + headerName.slice(1);

    if (headerName.includes("At")) {
      headerName = headerName.replace("At", "");
    }

    return headerName;
  }

  function formatValue(record, column) {
    const value = record[column];

    if (
      (column === "title" || column === "name") &&
      "isPublic" in record
    ) {
      return addVisibilityIcon(
        record.isPublic,
        value
      );
    }

    if (column === "createdAt" || column === "updatedAt") {
      return formatDateTime(value);
    }

    if (value == null) { return ""; }

    return value;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">{error}</div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">{sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}</h4>
      </div>

      <div className="mb-4 d-flex justify-content-between align-items-center">
        <button
          className="btn btn-danger"
          disabled={selectedRecordIds.length === 0}
          onClick={handleDeleteSelected}
        >
          Delete Selected
        </button>
        <span className="text-muted">
          {selectedRecordIds.length} / {records.length} {sectionName.slice(0, -1)}(s)
        </span>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th></th>
              {columns.map((column) =>
                <th key={column.key}>
                  {formatHeaderValue(column)}
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={selectedRecordIds.includes(record.id)}
                    onChange={() =>handleRecordCheck(record.id)}
                  />
                </td>
                {columns.map((column) =>
                  <td key={column.key}>
                    {formatValue(record, column)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminNotes;