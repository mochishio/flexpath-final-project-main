import { addVisibilityIcon } from "../utils/formatText";
import { fetchJson } from "../services/fetch";
import { formatDateTime } from "../utils/date";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

// wip
const currentUsername = "user";

function NotesPage() {
  const location = useLocation();
  const isPublicMode = location.pathname === "/public";

  const [notes, setNotes] = useState([]);
  const [displayedNotes, setDisplayedNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  // Search / Filter / Sort
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [usernameFilter, setUsernameFilter] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("");
  const [sortBy, setSortBy] = useState("updated");
  const [sortDirection, setSortDirection] = useState("desc");

  // Load Notes
  useEffect(() => {
    handleClear();

    async function loadNotes() {
      try {
        setError("");

        let data = await fetchJson(
          isPublicMode
          ? "http://localhost:8080/api/notes"
          : `http://localhost:8080/api/notes/user/${currentUsername}`,
        );

        if (isPublicMode) {
          data = data.filter((note) => (note.isPublic === true));
        }

        setNotes(data);
        const sortedData = [...data].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        setDisplayedNotes(sortedData);
      } catch (error) {
        setError(error.message);
      }
    }

    loadNotes();
  }, [isPublicMode]);

  // Load Categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchJson("http://localhost:8080/api/categories");
        setCategories(data);
      } catch (error) {
        setError(error.message);
      }
    }

    loadCategories();
  }, []);

  // Search
  function handleSearch() {
    let result = [...notes];

    // Keyword
    if (keyword.trim() !== "") {
      const searchKeyword = keyword.toLowerCase();

      result = result.filter((note) =>
        note.title.toLowerCase().includes(searchKeyword) ||
        note.content.toLowerCase().includes(searchKeyword)
      );
    }

    // Category
    if (categoryFilter !== "") {
      result = result.filter(
        (note) => note.categoryId === Number(categoryFilter)
      );
    }

    if (isPublicMode) {
      // Username
      if (usernameFilter.trim() !== "") {
        const searchUsername = usernameFilter.toLowerCase();
        result = result.filter((note) =>
          note.username
            .toLowerCase()
            .includes(searchUsername)
        );
      }

    } else {
      // Visibility
      if (visibilityFilter !== "") {
        const isPublic = visibilityFilter === "public";

        result = result.filter(
          (note) => note.isPublic === isPublic
        );
      }
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      }

      if (sortBy === "created") {
        comparison =
          new Date(a.createdAt) - new Date(b.createdAt);
      }

      if (sortBy === "updated") {
        comparison =
          new Date(a.updatedAt) - new Date(b.updatedAt);
      }

      return sortDirection === "asc"
        ? comparison
        : -comparison;
    });

    setDisplayedNotes(result);
  }

  function handleSortDirection() {
    const newDirection =
      sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newDirection);

    const result = [...displayedNotes].reverse();
    setDisplayedNotes(result);
  }

  // Clear
  function handleClear() {
    setKeyword("");
    setCategoryFilter("");
    setUsernameFilter("");
    setVisibilityFilter("");
    setSortBy("updated");
    setSortDirection("desc");

    const result = [...notes].sort(
      (a, b) =>
        new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    setDisplayedNotes(result);
  }

  return (
    <main className="container mt-4">
      <div className="row g-3 mb-4">

        {/* Keyword */}
        <div className="col-md">
          <label
            htmlFor="keyword"
            className="form-label"
          >
            Search
          </label>

          <input
            id="keyword"
            className="form-control"
            type="text"
            placeholder="Search..."
            value={keyword}
            onChange={(event) =>
              setKeyword(event.target.value)
            }
          />
        </div>

        {/* Category */}
        <div className="col-md">
          <label
            htmlFor="category"
            className="form-label"
          >
            Category
          </label>

          <select
            id="category"
            className="form-select"
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
          >
            <option value="">All</option>
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

        {isPublicMode ? (
          <>
            {/* Username */}
            <div className="col-md">
              <label
                htmlFor="username"
                className="form-label"
              >
                Username
              </label>

              <input
                id="username"
                className="form-control"
                type="text"
                placeholder="Username..."
                value={usernameFilter}
                onChange={(event) =>
                  setUsernameFilter(event.target.value)
                }
              />
            </div>
          </>
        ) : (
          <>
            {/* Visibility */}
            <div className="col-md">
              <label
                htmlFor="visibility"
                className="form-label"
              >
                Visibility
              </label>

              <select
                id="visibility"
                className="form-select"
                value={visibilityFilter}
                onChange={(event) =>
                  setVisibilityFilter(event.target.value)
                }
              >
                <option value="">All</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </>
        )}

        {/* Sort */}
        <div className="col-md">
          <label
            htmlFor="sortBy"
            className="form-label"
          >
            Sort By
          </label>

          <select
            id="sortBy"
            className="form-select"
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value)
            }
          >
            <option value="updated">Updated</option>
            <option value="created">Created</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div className="d-flex gap-2 mb-4">
        <button
          className="btn btn-primary"
          type="button"
          onClick={handleSearch}
        >
          Search
        </button>

        <button
          className="btn btn-outline-primary"
          type="button"
          onClick={handleClear}
        >
          Clear
        </button>

        <Link
          className="btn btn-outline-primary"
          to="/notes/new"
        >
          + New Note
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted">
          {displayedNotes.length} note(s)
        </span>

        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={handleSortDirection}
          title={
            sortDirection === "desc"
              ? "Descending"
              : "Ascending"
          }
        >
          {sortDirection === "desc" ? "↓" : "↑"}
        </button>
      </div>

      {/* Notes */}
      <div className="d-flex flex-column gap-3">
        {displayedNotes.map((note) => (
          <div
            className="card shadow-sm"
            key={note.id}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div style={{ width: "350px" }}>
                  <h5
                    className="text-truncate mb-0"
                    title={note.title}
                  >
                    {addVisibilityIcon(note.isPublic, note.title)}
                  </h5>

                  <div>
                    <span>by {note.username}</span>
                  </div>
                </div>

                <div>
                  <div>Created at</div>
                  <span className="text-muted">
                    {formatDateTime(note.createdAt)}
                  </span>
                </div>

                <div>
                  <div>Updated at</div>
                  <span className="text-muted">
                    {formatDateTime(note.updatedAt)}
                  </span>
                </div>

                <Link
                  className="btn btn-outline-dark"
                  to={`/notes/${note.id}`}
                >
                  Detail
                </Link>

              </div>
            </div>
          </div>
        ))}

        {displayedNotes.length === 0 && (
          <div className="alert alert-secondary">
            No notes found.
          </div>
        )}
      </div>
    </main>
  );
}

export default NotesPage;