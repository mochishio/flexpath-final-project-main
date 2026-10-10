import { addVisibilityIcon, capitalize } from "../../utils/formatText";
import { CategoryForm } from "../category/CategoryForm";
import { CollectionForm } from "../collection/CollectionForm";
import { fetchJson } from "../../services/fetch";
import { formatDateTime } from "../../utils/date";
import { handleApiError } from "../../services/handleApiError";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function AdminTable({sectionName, columns}) {
  const { currentUser } = useAuth();
  const currentUsername = currentUser?.username;

  const navigate = useNavigate();

  // to show table content
  const [records, setRecords] = useState([]);
  const [selectedRecordIds, setSelectedRecordIds] = useState([]);

  // to create/edit a collection
  const [collection, setCollection] = useState(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  // to create/edit a category
  const [category, setCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecords() {
      try {
        setError("");
        setLoading(true);

        const data = await fetchJson(`http://localhost:8080/api/${sectionName}`);
        setRecords(data);
        setSelectedRecordIds([]);

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

  function handleCreate() {
    if (sectionName === "notes") {
      navigate("/notes/new");
      return;
    }

    if (sectionName === "collections") {
      setCollection(null);
      setShowCollectionModal(true);
      return;
    }

    if (sectionName === "categories") {
      setCategory(null);
      setShowCategoryModal(true);
      return;
    }
  }

  function handleEdit() {
    if (selectedRecordIds.length !== 1) {
      return;
    }

    const selectedId = selectedRecordIds[0];

    if (sectionName === "notes") {
      navigate(`/notes/${selectedId}/edit`);
      return;
    }

    if (sectionName === "collections") {
      const selectedCollection = records.find((record) =>
        record.id === selectedId
      );
      setCollection(selectedCollection);
      setShowCollectionModal(true);
      return;
    }

    if (sectionName === "categories") {
      const selectedCategory = records.find((record) =>
        record.id === selectedId
      );
      setCategory(selectedCategory);
      setShowCategoryModal(true);
      return;
    }
  }

  async function handleSaveCollection(collectionData) {
    try {
      setError("");

      let savedCollectionData = {...collectionData};
      if (collection == null) {
        savedCollectionData.username = currentUsername;
      }

      const savedCollection = await fetchJson(
        collection == null
        ? "http://localhost:8080/api/collections"
        : `http://localhost:8080/api/collections/${collection.id}`,
        {
          method: collection == null ? "POST" : "PUT",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(savedCollectionData),
        }
      );

      let updatedRecords;
      if (collection == null) {
        // create
        updatedRecords = [...records, savedCollection];
      } else {
        // update
        updatedRecords = records.map((record) => {
          if (record.id === savedCollection.id) {
            return savedCollection;
          }
          return record;
        });
      }
      setRecords(updatedRecords);

      setSelectedRecordIds([]);
      setCollection(null);
      setShowCollectionModal(false);
    } catch (error) {
      handleApiError(error, navigate, setError);
    }
  }

  async function handleSaveCategory(categoryData) {
    try {
      setError("");

      let savedCategoryData = {...categoryData};
      if (category == null) {
        savedCategoryData.username = currentUsername;
      }

      const savedCategory = await fetchJson(
        category == null
        ? "http://localhost:8080/api/categories"
        : `http://localhost:8080/api/categories/${category.id}`,
        {
          method: category == null ? "POST" : "PUT",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(savedCategoryData),
        }
      );

      let updatedRecords;
      if (category == null) {
        // create
        updatedRecords = [...records, savedCategory];
      } else {
        // update
        updatedRecords = records.map((record) => {
          if (record.id === savedCategory.id) {
            return savedCategory;
          }
          return record;
        });
      }
      setRecords(updatedRecords);

      setSelectedRecordIds([]);
      setCategory(null);
      setShowCategoryModal(false);
    } catch (error) {
      handleApiError(error, navigate, setError);
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
        await fetchJson(
          `http://localhost:8080/api/${sectionName}/${recordId}`,
          { method: "DELETE" }
        );
      }

      const updatedRecords = records.filter(
        (record) =>!selectedRecordIds.includes(record.id)
      );
      setRecords(updatedRecords);
      setSelectedRecordIds([]);

    } catch (error) {
      handleApiError(error, navigate, setError);
    }
  }

  function formatHeaderValue(headerName) {
    headerName = capitalize(headerName);

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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">{capitalize(sectionName)}</h4>
      </div>

      <div className="d-flex align-items-center gap-2 mb-4">
        <button
          type="button"
          className="btn btn-outline-dark"
          onClick={handleCreate}
        >
          + New {capitalize(sectionName).slice(0, -1).replace("ie", "y")}
        </button>

        <button
          type="button"
          className="btn btn-outline-dark"
          disabled={selectedRecordIds.length !== 1}
          onClick={handleEdit}
        >
          Edit
        </button>

        <button
          type="button"
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

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th></th>
              {columns.map((column) =>
                <th key={column}>
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
                  <td key={column}>
                    {formatValue(record, column)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* Modal to create/edit a collection */}
      <CollectionForm
        collection={collection}
        show={showCollectionModal}
        onClose={() => {
            setShowCollectionModal(false);
            setCollection(null);
            setError("");
        }}
        onSave={handleSaveCollection}
        error={error}
      />


      {/* Modal to create/edit a category*/}
      <CategoryForm
        category={category}
        show={showCategoryModal}
        onClose={() => {
            setShowCategoryModal(false);
            setCategory(null);
            setError("");
        }}
        onSave={handleSaveCategory}
        error={error}
      />

    </div>
  );
}

export default AdminTable;