import { useEffect, useState } from "react";

export function CollectionForm({
  collection,
  show,
  onClose,
  onSave,
  error
}) {
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [description, setDescription] = useState("");

  const isEditMode = collection != null;

  useEffect(() => {
    if (!show) {
      return;
    }

    if (isEditMode) {
      // Edit
      setName(collection.name);
      setIsPublic(collection.isPublic);
      setDescription(collection.description ?? "");
    } else {
      // Create
      setName("");
      setIsPublic(false);
      setDescription("");
    }
  }, [show, collection, isEditMode]);

  function handleSave() {
    const collectionData = {
      name: name,
      description: description,
      isPublic: isPublic,
    };

    onSave(collectionData);
  }

  if (!show) {
    return null;
  }

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
                  ? "Edit Collection"
                  : "New Collection"}
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
                  htmlFor="collection-name"
                  className="form-label"
                >
                  Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  id="collection-name"
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

              {/* Visibility */}
              <div className="mb-3">
                <label className="form-label d-block">
                  Visibility
                </label>

                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="collection-visibility"
                    id="collection-private"
                    checked={!isPublic}
                    onChange={() =>
                      setIsPublic(false)
                    }
                  />

                  <label
                    className="form-check-label"
                    htmlFor="collection-private"
                  >
                    Private
                  </label>
                </div>

                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="collection-visibility"
                    id="collection-public"
                    checked={isPublic}
                    onChange={() =>
                      setIsPublic(true)
                    }
                  />

                  <label
                    className="form-check-label"
                    htmlFor="collection-public"
                  >
                    Public
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="mb-3">
                <label
                  htmlFor="collection-description"
                  className="form-label"
                >
                  Description
                </label>

                <textarea
                  className="form-control"
                  id="collection-description"
                  rows="5"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                />
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

export default CollectionForm;