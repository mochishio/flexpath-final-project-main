import { Link } from "react-router-dom";
import { formatDateTime } from "../../utils/date";

export function CollectionCard({ collection, notes }) {
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
              <div className="col-9">
                <div
                  className="text-truncate"
                  title={note.title}
                >
                  {note.title}
                </div>
              </div>

              {/* Username */}
              <div className="col-3">
                <div
                  className="text-truncate text-muted"
                  title={note.username}
                >
                  {note.username}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default CollectionCard;