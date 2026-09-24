package org.example.services;

import org.example.models.Collection;
import org.example.daos.NoteDao;
import org.example.models.Note;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class NoteService {

    private final NoteDao noteDao;

    private void validateTitle(Note note) {
        if (note.getTitle() == null || note.getTitle().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Name is required");
        }
    }

    private void validateContent(Note note) {
        if (note.getContent() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Content is required");
        }
    }

    private void validateUsername(Note note) {
        if (note.getUsername() == null || note.getUsername().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Username is required");
        }
    }

    public NoteService(NoteDao noteDao) {
        this.noteDao = noteDao;
    }

    /**
     * Gets all notes.
     *
     * @return A list of all notes.
     */
    public List<Note> getAll() {
        return noteDao.getAll();
    }

    /**
     * Gets a note by id.
     *
     * @param id The id of the note.
     * @return The note.
     */
    public Note getById(int id) {
        return noteDao.getById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Note not found"));
    }

    /**
     * Gets all collections where the note belongs to.
     *
     * @return A list of collections.
     */
    public List<Collection> getCollections(int id) {
        getById(id);
        return noteDao.getCollections(id);
    }

    /**
     * Creates a new note.
     *
     * @param note The note to create.
     * @return The created note.
     */
    public Note create(Note note) {
        validateTitle(note);
        validateContent(note);
        validateUsername(note);
        return noteDao.create(note);
    }

    /**
     * Updates a note.
     *
     * @param id   The id of the note.
     * @param note The new note information.
     * @return The updated note.
     */
    public Note update(int id, Note note) {
        getById(id);
        validateTitle(note);
        validateContent(note);
        return noteDao.update(id, note);
    }

    /**
     * Deletes a note.
     *
     * @param id The id of the note.
     * @return The number of deleted rows.
     */
    public int delete(int id) {
        int rows = noteDao.delete(id);

        if (rows == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Note not found");
        }

        return rows;
    }
}