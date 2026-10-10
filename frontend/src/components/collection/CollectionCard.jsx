import { addVisibilityIcon } from "../../utils/formatText";
import { CollectionForm } from "../collection/CollectionForm";
import { fetchJson } from "../../services/fetch";
import { handleApiError } from "../../services/handleApiError";
import { Link } from "react-router-dom";
import { formatDateTime } from "../../utils/date";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

export function CollectionCard({
  collection, notes, onNoteRemoved, onCollectionUpdated, onCollectionDeleted
}) {
  const { currentUser } = useAuth();
  const currentUsername = currentUser?.username;

  const isOwner = collection.username === currentUsername;

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
      await fetchJson(
        `http://localhost:8080/api/collections/${collection.id}/notes/${noteId}`,
        { method: "DELETE" }
      );

      onNoteRemoved(collection.id, noteId);
    } catch (error) {
      handleApiError(error, navigate, setError);
    }
  }

  function handleOpenCollectionModal() {
    setError("");
    setShowCollectionModal(true);
  }

  async function handleSaveCollection(collectionData) {
    try {
      setError("");

      const updatedCollection = await fetchJson(
        `http://localhost:8080/api/collections/${collection.id}`,
        {
          method: "PUT",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(collectionData),
        }
      );

      onCollectionUpdated(updatedCollection);
      setShowCollectionModal(false);
    } catch (error) {
      handleApiError(error, navigate, setError);
    }
  }

  async function handleDeleteCollection() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this collection?"
    );
    if (!confirmed) { return; }

    try {
      setError("");

      await fetchJson(
        `http://localhost:8080/api/collections/${collection.id}`,
        { method: "DELETE" }
      );

      onCollectionDeleted(collection.id);
      setShowCollectionModal(false);
    } catch (error) {
      handleApiError(error, navigate, setError);
    }
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between">
          <div>
            <h5>
              {addVisibilityIcon(collection.isPublic, collection.name)}
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
              <div className={isOwner ? "col-5": "col-8"}>
                <div
                  className="text-truncate"
                  title={note.title}
                >
                  {addVisibilityIcon(note.isPublic, note.title)}
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
                <div className="col-3">
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
      <CollectionForm
        collection={collection}
        show={showCollectionModal}
        onDelete={handleDeleteCollection}
        onClose={() =>
          setShowCollectionModal(false)
        }
        onSave={handleSaveCollection}
        error={error}
      />

    </div>
  );
}

export default CollectionCard;