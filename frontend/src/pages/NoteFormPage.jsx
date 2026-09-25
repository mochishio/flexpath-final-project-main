import { formatDateTime } from "../utils/date";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function NoteFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);
  const [categories, setCategories] = useState([]);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [content, setContent] = useState("");
  const [createdAt, setCreatedAt] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // wip
  const currentUsername = "user";

  useEffect(() => {
    async function loadData() {
      try {
        setError("");

        // Categories
        const categoriesResponse = await fetch(
          "http://localhost:8080/api/categories"
        );
        if (!categoriesResponse.ok) {
          throw new Error("Failed to get categories");
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        // Note
        if (isEditMode) {
          const noteResponse = await fetch(
            `http://localhost:8080/api/notes/${id}`
          );
          if (!noteResponse.ok) {
            if (noteResponse.status === 404) {
              throw new Error("Note not found");
            }
            throw new Error("Failed to load note");
          }
          const noteData = await noteResponse.json();
          setTitle(noteData.title);
          setCategoryId(noteData.categoryId ?? "");
          setIsPublic(noteData.isPublic);
          setContent(noteData.content);
          setCreatedAt(noteData.createdAt);
          setUpdatedAt(noteData.updatedAt);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, isEditMode]);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError("");

      const noteData = {
        title: title,
        content: content,
        isPublic: isPublic,
        username: currentUsername,
        categoryId:
          categoryId === ""
            ? null
            : Number(categoryId),
      };

      const url = isEditMode
        ? `http://localhost:8080/api/notes/${id}`
        : "http://localhost:8080/api/notes";

      const method = isEditMode
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        throw new Error(
          isEditMode
            ? "Failed to update note"
            : "Failed to create note"
        );
      }

      const savedNote = await response.json();

      navigate(`/notes/${savedNote.id}`);

    } catch (error) {
      setError(error.message);
    }
  }

  if (loading) {
    return (
      <main className="container mt-4">
        <p>Loading...</p>
      </main>
    );
  }

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

          <h2 className="mb-4">
            {isEditMode
              ? "Edit Note"
              : "Create Note"}
          </h2>

          {isEditMode && (
            <div className="mb-4 text-muted">
              <div>
                <strong>Created at: </strong>
                {formatDateTime(createdAt)}
              </div>

              <div>
                <strong>Updated at: </strong>
                {formatDateTime(updatedAt)}
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Title */}
            <div className="mb-3">
              <label
                htmlFor="title"
                className="form-label"
              >
                Title
              </label>

              <input
                type="text"
                className="form-control"
                id="title"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                maxLength={255}
                required
              />
              <div className="form-text text-end">
                {title.length} / 255
              </div>
            </div>

            {/* Category */}
            <div className="mb-3">
              <label
                htmlFor="category"
                className="form-label"
              >
                Category
              </label>

              <select
                className="form-select"
                id="category"
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(event.target.value)
                }
              >
                <option value="">
                  None
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
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

            {/* Content */}
            <div className="mb-4">
              <label
                htmlFor="content"
                className="form-label"
              >
                Content
              </label>

              <textarea
                className="form-control"
                id="content"
                rows="10"
                value={content}
                onChange={(event) =>
                  setContent(event.target.value)
                }
                required
              />
            </div>

            {/* Buttons */}
            <div className="d-flex gap-2">
              <button
                className="btn btn-primary"
                type="submit"
              >
                {isEditMode
                  ? "Save Changes"
                  : "Create Note"}
              </button>

              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default NoteFormPage;