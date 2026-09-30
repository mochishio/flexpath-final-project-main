import { addVisibilityIcon } from "../utils/visibilityIcon";
import { CollectionForm } from "../components/collection/CollectionForm";
import { formatDateTime } from "../utils/date";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function NoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [category, setCategory] = useState(null);

  const [userCollections, setUserCollections] = useState([]);
  const [existingCollectionIds, setExistingCollectionIds] = useState([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState([]);

  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // wip
  const currentUsername = "user";

  useEffect(() => {
    async function loadNote() {
      try {
        // load notes
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

        // load categories
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

  async function handleAddToCollection() {
    try {
      setError("");

      // get user's collections
      const collectionsResponse = await fetch(
        `http://localhost:8080/api/collections/user/${currentUsername}`
      );
      if (!collectionsResponse.ok) {
        throw new Error("Failed to get collections");
      }
      const collections =
        await collectionsResponse.json();
      setUserCollections(collections);

      // get collections where the note already belongs to
      const noteCollectionsResponse = await fetch(
        `http://localhost:8080/api/notes/${note.id}/collections`
      );
      if (!noteCollectionsResponse.ok) {
        throw new Error(
          "Failed to get note collections"
        );
      }
      const noteCollections = await noteCollectionsResponse.json();
      const ids = noteCollections.map(
        (collection) => collection.id
      );
      setExistingCollectionIds(ids);
      setSelectedCollectionIds(ids);

      setShowCollectionModal(true);

    } catch (error) {
      setError(error.message);
    }
  }

  function handleCollectionCheck(collectionId) {
    setSelectedCollectionIds((currentIds) => {
      if (currentIds.includes(collectionId)) {
        return currentIds.filter(
          (id) => id !== collectionId
        );
      }
      return [...currentIds, collectionId];
    });
  }

  async function handleSaveCollections() {
    try {
      setError("");

      const collectionIdsToAdd = selectedCollectionIds.filter(
        (id) => !existingCollectionIds.includes(id)
      );
      const collectionIdsToRemove = existingCollectionIds.filter(
        (id) => !selectedCollectionIds.includes(id)
      );

      // Add
      for (const collectionId of collectionIdsToAdd) {
        const response = await fetch(
          `http://localhost:8080/api/collections/${collectionId}/notes/${note.id}`,
          {
            method: "POST",
          }
        );
        if (!response.ok) {
          throw new Error(
            "Failed to add note to collection"
          );
        }
      }

      // Remove
      for (const collectionId of collectionIdsToRemove) {
        const response = await fetch(
          `http://localhost:8080/api/collections/${collectionId}/notes/${note.id}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          throw new Error(
            "Failed to remove note from collection"
          );
        }
      }

      setShowCollectionModal(false);

    } catch (error) {
      setError(error.message);
    }
  }

  function handleOpenCreateNewCollectionModal() {
    // close add to collection modal
    // open create new collection modal
    setError("");
    setShowCollectionModal(false);
    setShowNewCollectionModal(true);
  }

  function handleReturnToAddToCollectionModal() {
    // close create new collection modal
    // open add to collection modal
    setError("");
    setShowNewCollectionModal(false);
    setShowCollectionModal(true);
  }

  async function handleCreateCollection(collectionData) {
    try {
      setError("");

      const newCollectionData = {
        ...collectionData,
        username: currentUsername,
      };

      const response = await fetch(
        "http://localhost:8080/api/collections",
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(newCollectionData),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to create the collection"
        );
      }

      const newCollection = await response.json();
      setUserCollections([...userCollections, newCollection]);
      setSelectedCollectionIds([...selectedCollectionIds, newCollection.id]);

      handleReturnToAddToCollectionModal();
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
            {addVisibilityIcon(note.isPublic, note.title)}
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
              className="btn btn-outline-dark"
              type="button"
              onClick={handleAddToCollection}
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


      {/* Modal for adding a note to collections */}
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
                    Add to Collection
                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCollectionModal(false)}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="alert alert-danger mx-3 mt-3">
                    {error}
                  </div>
                )}

                <div className="modal-body">
                  {userCollections.map((collection) => (
                    <div
                      className="form-check mb-2"
                      key={collection.id}
                    >
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`collection-${collection.id}`}
                        checked={selectedCollectionIds.includes(
                          collection.id
                        )}
                        onChange={() =>
                          handleCollectionCheck(collection.id)
                        }
                      />

                      <label
                        className="form-check-label"
                        htmlFor={`collection-${collection.id}`}
                      >
                        {addVisibilityIcon(collection.isPublic, collection.name, true)}
                      </label>
                    </div>
                  ))}

                  {userCollections.length === 0 && (
                    <p className="text-muted">
                      No collections found.
                    </p>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-primary me-auto"
                    onClick={
                      handleOpenCreateNewCollectionModal
                    }
                  >
                    + New Collection
                  </button>

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
                    onClick={handleSaveCollections}
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


      {/* New Collection Modal */}
      <CollectionForm
        collection={null}
        show={showNewCollectionModal}
        onClose={handleReturnToAddToCollectionModal}
        onSave={handleCreateCollection}
        error={error}
      />

    </main>
  );
}

export default NoteDetailPage;