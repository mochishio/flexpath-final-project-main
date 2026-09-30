import { addVisibilityIcon } from "../../utils/visibilityIcon";
import { useEffect, useState } from "react";

export function AdminNotes() {
  const [notes, setNotes] = useState([]);
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotes() {
      try {
        setError("");

        const response = await fetch(
          "http://localhost:8080/api/notes"
        );
        if (!response.ok) {
          throw new Error("Failed to load notes");
        }

        const data = await response.json();
        setNotes(data);

      } catch (error) {
        setError(error.message);

      } finally {
        setLoading(false);
      }
    }

    loadNotes();
  }, []);

  function handleNoteCheck(noteId) {
    if (selectedNoteIds.includes(noteId)) {
      const updatedIds = selectedNoteIds.filter((id) => id !== noteId);
      setSelectedNoteIds(updatedIds);
    } else {
      const updatedIds = [...selectedNoteIds, noteId];
      setSelectedNoteIds(updatedIds);
    }
  }

  async function handleDeleteSelected() {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedNoteIds.length} note(s)?`
    );
    if (!confirmed) { return; }

    try {
      setError("");

      for (const noteId of selectedNoteIds) {
        const response = await fetch(
          `http://localhost:8080/api/notes/${noteId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete notes");
        }
      }

      const updatedNotes = notes.filter(
        (note) =>!selectedNoteIds.includes(note.id)
      );
      setNotes(updatedNotes);
      setSelectedNoteIds([]);

    } catch (error) {
      setError(error.message);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">{error}</div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Notes</h4>
      </div>

      <div className="mb-4 d-flex justify-content-between align-items-center">
        <button
          className="btn btn-danger"
          disabled={selectedNoteIds.length === 0}
          onClick={handleDeleteSelected}
        >
          Delete Selected
        </button>
        <span className="text-muted">{selectedNoteIds.length} / {notes.length} note(s)</span>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>Title</th>
              <th>Username</th>
            </tr>
          </thead>

          <tbody>
            {notes.map((note) => (
              <tr key={note.id}>
                <td>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={selectedNoteIds.includes(note.id)}
                    onChange={() =>handleNoteCheck(note.id)}
                  />
                </td>
                <td>{note.id}</td>
                <td>{addVisibilityIcon(note.isPublic, note.title)}</td>
                <td>{note.username}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminNotes;