import { useEffect, useState } from "react";

export function CategoryForm({
  category,
  show,
  onClose,
  onSave,
  error
}) {
  const [name, setName] = useState("");
  const isEditMode = category != null;

  useEffect(() => {
    if (!show) { return; }
    if (isEditMode) { setName(category.name) } else { setName(""); }
  }, [show, category, isEditMode]);

  function handleSave() {
    const categoryData = { name: name };
    onSave(categoryData);
  }

  if (!show) { return null; }

  return (
    <>
      <div
        className="modal show d-block"
        tabIndex="-1"
      >
        <div className="modal-dialog">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">
                {isEditMode
                  ? "Edit Category"
                  : "New Category"}
              </h5>

              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              />
            </div>

            {error && (
              <div className="alert alert-danger mx-3 mt-3">
                {error}
              </div>
            )}

            <div className="modal-body px-4">

              {/* Name */}
              <div className="mb-3">
                <label
                  htmlFor="category-name"
                  className="form-label"
                >
                  Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  id="category-name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  maxLength={255}
                  required
                />

                <div className="form-text text-end">
                  {name.length} / 255
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
              >
                {isEditMode ? "Save" : "Create"}
              </button>
            </div>

          </div>
        </div>
      </div>

      <div className="modal-backdrop show" />
    </>
  );
}

export default CategoryForm;