import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function NoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [category, setCategory] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // wip
  const currentUsername = "user";

  useEffect(() => {
    async function loadNote() {
      try {
        const response = await fetch(
          `http://localhost:8080/api/notes/${id}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Note not found");
          }
          throw new Error("Failed to load note");
        }

        const data = await response.json();
        setNote(data);

        if (data.categoryId != null) {
          const categoryResponse = await fetch(
            `http://localhost:8080/api/categories/${data.categoryId}`
          );

          if (categoryResponse.ok) {
            const categoryData = await categoryResponse.json();
            setCategory(categoryData);
          }
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadNote();
  }, [id]);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/notes/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  }

  function formatDateTime(dateTime) {
    return new Date(dateTime).toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (loading) {
    return (
      <main className="container mt-4">
        <p>Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mt-4">
        <div className="alert alert-danger">
          {error}
        </div>
      </main>
    );
  }

  if (!note) {
    return null;
  }

  const isOwner = note.username === currentUsername;

  return (
    <main className="container mt-4">

      <button
        className="btn mb-4"
        type="button"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="card shadow-sm">
        <div className="card-body p-4">

          {/* Title */}
          <h2 className="mb-4">
            {note.title}
          </h2>

          {/* Buttons */}
          <div className="d-flex gap-2 mb-4">

            {isOwner && (
              <>
                <Link
                  className="btn btn-outline-primary"
                  to={`/notes/${note.id}/edit`}
                >
                  Edit
                </Link>

                <button
                  className="btn btn-outline-danger"
                  type="button"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </>
            )}

            <button
              className="btn btn-outline-secondary"
              type="button"
            >
              + Add to Collection
            </button>

          </div>

          {/* Note information */}
          <div className="mb-4">
            <div>
              <strong>Category: </strong>
              {category ? category.name : "None"}
            </div>

            <div>
              <strong>Visibility: </strong>
              {note.isPublic ? "Public" : "Private"}
            </div>

            <div>
              <strong>Author: </strong>
              {note.username}
            </div>

            <div>
              <strong>Created at: </strong>
              {formatDateTime(note.createdAt)}
            </div>

            <div>
              <strong>Updated at: </strong>
              {formatDateTime(note.updatedAt)}
            </div>
          </div>

          {/* Content */}
          <div className="mb-4">
            <h5>Content</h5>

            <p style={{ whiteSpace: "pre-wrap" }}>
              {note.content}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default NoteDetailPage;