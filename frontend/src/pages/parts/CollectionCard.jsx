import { Link } from "react-router-dom";
import { formatDateTime } from "../../utils/date";
import { useState } from "react";

// wip
const currentUsername = "user";

export function CollectionCard({
  collection, notes, onNoteRemoved, onCollectionUpdated
}) {
  const isOwner = collection.username === currentUsername;

  // update collection
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [description, setDescription] = useState("");
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  const [error, setError] = useState("");

  async function handleRemove(noteId) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this note from the collection?"
    );
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/collections/${collection.id}/notes/${noteId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error(
          "Failed to remove note from collection"
        );
      }

      onNoteRemoved(collection.id, noteId);
    } catch (error) {
      setError(error.message);
    }
  }

  function handleOpenCollectionModal() {
    setName(collection.name);
    setIsPublic(collection.isPublic);
    setDescription(collection.description ?? "");

    setShowCollectionModal(true);
  }

  async function handleSaveCollection() {
    try {
      setError("");

      const collectionData = {
        name: name,
        description: description,
        isPublic: isPublic,
      };
      const response = await fetch(
        `http://localhost:8080/api/collections/${collection.id}`,
        {
          method: "PUT",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(collectionData),
        }
      );
      if (!response.ok) {
        throw new Error(
          "Failed to update the collection"
        );
      }
      const updatedCollection = await response.json();
      onCollectionUpdated(updatedCollection);
      setShowCollectionModal(false);
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between">
          <div>
            <h5>
              {collection.name}{" "}
              {collection.isPublic
                ? "🌐"
                : "🔒"}
            </h5>

            <div className="mb-2">
              by {collection.username}
            </div>

            <p className="mb-2">
              {collection.description}
            </p>

            <span className="text-muted">
              Updated{" "}
              {formatDateTime(
                collection.updatedAt
              )}
            </span>
          </div>

          {isOwner &&
            <button
              className="btn btn-outline-dark align-self-start"
              onClick={handleOpenCollectionModal}
            >
              Edit
            </button>
          }
        </div>

        <hr />
        <div>
          {notes.map((note) => (
            <div
              key={note.id}
              className="row py-2 border-bottom"
            >
              {/* Title */}
              <div className={isOwner ? "col-6": "col-8"}>
                <div
                  className="text-truncate"
                  title={note.title}
                >
                  {note.title}
                </div>
              </div>

              {/* Username */}
              <div className="col-2">
                <div
                  className="text-truncate text-muted"
                  title={note.username}
                >
                  {note.username}
                </div>
              </div>

              {/* View note */}
              <div className="col-2">
                <Link
                  className="btn btn-sm btn-secondary align-self-start"
                  to={`/notes/${note.id}`}
                >
                  View
                </Link>
              </div>

              {/* Remove from collection */}
              {isOwner &&
                <div className="col-2">
                  <button
                    className="btn btn-sm btn-outline-secondary align-self-start"
                    onClick={() => handleRemove(note.id)}>
                      Remove
                    </button>
                </div>
              }
            </div>
          ))}
        </div>
      </div>


      {/* Modal to edit a collection */}
      {showCollectionModal && (
        <>
          <div
            className="modal show d-block"
            tabIndex="-1"
          >
            <div className="modal-dialog">
              <div className="modal-content">

                <div className="modal-header">
                  <h5 className="modal-title">
                    Edit a collection
                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCollectionModal(false)}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="alert alert-danger">
                    {error}
                  </div>
                )}

                <div className="modal-body">
                  <div
                    className="form-check mb-2 px-4"
                    key={collection.id}
                  >
                    {/* Name */}
                    <div className="mb-3">
                      <label
                        htmlFor="name"
                        className="form-label"
                      >
                        Name
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        id="name"
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
                          name="visibility"
                          id="private"
                          checked={!isPublic}
                          onChange={() => setIsPublic(false)}
                        />

                        <label
                          className="form-check-label"
                          htmlFor="private"
                        >
                          Private
                        </label>
                      </div>

                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="visibility"
                          id="public"
                          checked={isPublic}
                          onChange={() => setIsPublic(true)}
                        />

                        <label
                          className="form-check-label"
                          htmlFor="public"
                        >
                          Public
                        </label>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-3">
                      <label
                        htmlFor="description"
                        className="form-label"
                      >
                        Description
                      </label>

                      <textarea
                        className="form-control"
                        id="description"
                        rows="5"
                        value={description}
                        onChange={(event) =>
                          setDescription(event.target.value)
                        }
                        required
                      />
                    </div>

                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      setShowCollectionModal(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSaveCollection}
                  >
                    Save
                  </button>
                </div>

              </div>
            </div>
          </div>

          <div className="modal-backdrop show" />
        </>
      )}

    </div>
  );
}

export default CollectionCard;