import { CollectionCard } from "../pages/parts/CollectionCard"
import { useEffect, useState } from "react";

// wip
const currentUsername = "user";

function CollectionsPage() {
  const [myCollections, setMyCollections] = useState([]);
  const [publicCollections, setPublicCollections] = useState([]);

  const [displayedMyCollections, setDisplayedMyCollections] = useState([]);
  const [displayedPublicCollections, setDisplayedPublicCollections] = useState([]);
  const [notesByCollection, setNotesByCollection] = useState({});

  // Search / Filter / Sort
  const [keyword, setKeyword] = useState("");
  const [usernameFilter, setUsernameFilter] = useState("");
  const [sortBy, setSortBy] = useState("updated");
  const [sortDirection, setSortDirection] = useState("desc");

  const [error, setError] = useState("");

  // Load Collections
  useEffect(() => {
    async function loadCollections() {
      try {
        setError("");

        // get collections
        const myResponse = await fetch(
          `http://localhost:8080/api/collections/user/${currentUsername}`
        );
        const publicResponse = await fetch(
          "http://localhost:8080/api/collections/public"
        );

        if (!myResponse.ok || !publicResponse.ok) {
          throw new Error(
            "Failed to load collections"
          );
        }

        const myData = await myResponse.json();
        const publicData = await publicResponse.json();
        const otherPublicCollections =
          publicData.filter(
            (collection) =>
              collection.username !==
              currentUsername
          );

        setMyCollections(myData);
        setPublicCollections(otherPublicCollections);
        setDisplayedMyCollections(myData);
        setDisplayedPublicCollections(otherPublicCollections);

        // get collection notes
        const notesByCollectionData = {};
        const allCollections = [...myData, ...otherPublicCollections];
        for (const collection of allCollections) {
          const reponse = await fetch(
            `http://localhost:8080/api/collections/${collection.id}/notes`
          );
          if (!reponse.ok) {
            throw new Error(
              "Failed to load collection notes"
            );
          }
          const notes = await reponse.json();
          notesByCollectionData[collection.id] = notes;
        }
        setNotesByCollection(notesByCollectionData);
      } catch (error) {
        setError(error.message);
      }
    }
    loadCollections();
  }, []);

  function handleSearch() {
    let myResult = [...myCollections];
    let publicResult = [...publicCollections];

    // Keyword
    if (keyword.trim() !== "") {
      const searchKeyword = keyword.toLowerCase();

      // search in name and description
      myResult = myResult.filter(
        (collection) =>
          collection.name.toLowerCase().includes(searchKeyword) ||
          (collection.description ?? "").toLowerCase().includes(searchKeyword)
      );
      publicResult = publicResult.filter(
        (collection) =>
          collection.name.toLowerCase().includes(searchKeyword) ||
          (collection.description ?? "").toLowerCase().includes(searchKeyword)
      );
    }

    // Username - applies to public collections only
    if (usernameFilter.trim() !== "") {
      const searchUsername = usernameFilter.toLowerCase();
      publicResult = publicResult.filter(
        (collection) => collection.username.toLowerCase().includes(searchUsername)
      );
    }

    myResult = sortCollections(myResult);
    publicResult = sortCollections(publicResult);
    setDisplayedMyCollections(myResult);
    setDisplayedPublicCollections(publicResult);
  }

  function sortCollections(collections) {
    return collections.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      }
      if (sortBy === "created") {
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === "updated") {
        comparison = new Date(a.updatedAt) - new Date(b.updatedAt);
      }

      return sortDirection === "asc"
        ? comparison
        : -comparison;
    });
  }

  function handleSortDirection() {
    const newDirection =
      sortDirection === "asc"
        ? "desc"
        : "asc";

    setSortDirection(newDirection);
    setDisplayedMyCollections(
      [...displayedMyCollections].reverse()
    );
    setDisplayedPublicCollections(
      [...displayedPublicCollections].reverse()
    );
  }

  function handleClear() {
    setKeyword("");
    setUsernameFilter("");
    setSortBy("updated");
    setSortDirection("desc");

    const myResult =
      [...myCollections].sort(
        (a, b) =>
          new Date(b.updatedAt) -
          new Date(a.updatedAt)
      );

    const publicResult =
      [...publicCollections].sort(
        (a, b) =>
          new Date(b.updatedAt) -
          new Date(a.updatedAt)
      );

    setDisplayedMyCollections(myResult);
    setDisplayedPublicCollections(publicResult);
  }

  function handleNoteRemoved(collectionId, noteId) {
    const updatedNotesByCollection = {...notesByCollection};
    const targetCollectionNotes = updatedNotesByCollection[collectionId];
    const updatedTargetCollectionNotes =
      targetCollectionNotes.filter(
        (note) => note.id !== noteId
      );
    updatedNotesByCollection[collectionId] = updatedTargetCollectionNotes;
    setNotesByCollection(updatedNotesByCollection);
  }

  return (
    <main className="container mt-4">
      <div className="row g-3">

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
            <option value="name">Name</option>
          </select>
        </div>

        {/* Username */}
        <div className="col-md">
          <label
            htmlFor="username"
            className="form-label"
          >
            Username*
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
          <p className="text-muted">*applies to public collections only</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div className="d-flex gap-2">
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
        </div>

        <div>
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
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="row g-4">
        {/* My Collections */}
        <div className="col-md-6">
          <div className="d-flex align-items-center gap-3 mb-2">
            <h4>
              My Collections
            </h4>
            <span className="text-muted">
              {displayedMyCollections.length} collection(s)
            </span>
          </div>

          <div className="d-flex flex-column gap-3">
            {displayedMyCollections.map(
              (collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  notes={notesByCollection[collection.id] ?? []}
                  onNoteRemoved={handleNoteRemoved}
                />
              )
            )}
          </div>

          {displayedMyCollections.length === 0 && (
            <div className="alert alert-secondary">
              No notes found.
            </div>
          )}
        </div>

        {/* Public Collections */}
        <div className="col-md-6">
          <div className="d-flex align-items-center gap-3 mb-2">
            <h4>
            Public Collections
            </h4>
            <span className="text-muted">
              {displayedPublicCollections.length} collection(s)
            </span>
          </div>

          <div className="d-flex flex-column gap-3">
            {displayedPublicCollections.map(
              (collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  notes={notesByCollection[collection.id] ?? []}
                  onNoteRemoved={handleNoteRemoved}
                />
              )
            )}
          </div>

          {displayedPublicCollections.length === 0 && (
            <div className="alert alert-secondary">
              No notes found.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default CollectionsPage;