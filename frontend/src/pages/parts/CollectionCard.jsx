import { Link } from "react-router-dom";
import { formatDateTime } from "../../utils/date";

export function CollectionCard({ collection, notes, onNoteRemoved }) {
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
      console.log(error.message);
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

          <Link
            className="btn btn-outline-dark align-self-start"
            to={`/collections/${collection.id}`}
          >
            Detail
          </Link>
        </div>

        <hr />
        <div>
          {notes.map((note) => (
            <div
              key={note.id}
              className="row py-2 border-bottom"
            >
              {/* Title */}
              <div className="col-6">
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
              <div className="col-2">
                <button
                  className="btn btn-sm btn-outline-secondary align-self-start"
                  onClick={() => handleRemove(note.id)}>
                    Remove
                  </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default CollectionCard;