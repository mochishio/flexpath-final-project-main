package org.example.services;

import org.example.daos.CollectionDao;
import org.example.daos.NoteDao;
import org.example.models.Collection;
import org.example.models.Note;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CollectionService {

    private final CollectionDao collectionDao;
    private final NoteDao noteDao;
    private final AuthorizationService authorizationService;

    public CollectionService(
            CollectionDao collectionDao,
            NoteDao noteDao,
            AuthorizationService authorizationService) {
        this.collectionDao = collectionDao;
        this.noteDao = noteDao;
        this.authorizationService = authorizationService;
    }

    private void validateName(Collection collection) {
        if (collection.getName() == null || collection.getName().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Name is required");
        }
    }

    private void validateUsername(Collection collection) {
        if (collection.getUsername() == null || collection.getUsername().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Username is required");
        }
    }

    /**
     * Gets all collections.
     *
     * @return A list of all collections.
     */
    public List<Collection> getAll() {
        return collectionDao.getAll();
    }

    /**
     * Gets a collection by id.
     *
     * @param id The id of the collection.
     * @return The collection.
     */
    public Collection getById(int id) {
        return collectionDao.getById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Collection not found"));
    }

    /**
     * Gets a collection by username.
     *
     * @param username The username of the collection.
     * @return A list of collections.
     */
    public List<Collection> getByUsername(String username) {
        return collectionDao.getByUsername(username);
    }

    /**
     * Gets public collections except mine.
     *
     * @return A list of public collections.
     */
    public List<Collection> getPublicCollections() {
        return collectionDao.getPublicCollections();
    }

    /**
     * Creates a new collection.
     *
     * @param collection The collection to create.
     * @return The created collection.
     */
    public Collection create(Collection collection) {
        validateName(collection);
        validateUsername(collection);
        return collectionDao.create(collection);
    }

    /**
     * Updates a collection.
     *
     * @param id         The id of the collection.
     * @param collection The new collection information.
     * @return The updated collection.
     */
    public Collection update(
            int id,
            Collection collection,
            Authentication authentication) {
        getById(id);
        validateName(collection);
        authorizationService.checkOwnerOrAdmin(
                collection.getUsername(),
                authentication);
        return collectionDao.update(id, collection);
    }

    /**
     * Deletes a collection.
     *
     * @param id The id of the collection.
     * @return The number of deleted rows.
     */
    public int delete(int id, Authentication authentication) {
        Collection collection = getById(id);
        authorizationService.checkOwnerOrAdmin(
                collection.getUsername(),
                authentication);

        int rows = collectionDao.delete(id);

        if (rows == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Collection not found");
        }

        return rows;
    }

    // ======================
    // CollectionNote
    // ======================
    /**
     * Gets all notes in a collection.
     *
     * @return A list of all notes.
     */
    public List<Note> getAllNotes(int collectionId) {
        getById(collectionId);
        return collectionDao.getAllNotes(collectionId);
    }

    /**
     * Adds a note to a collection.
     *
     * @param collectionId The collection id.
     * @param noteId       The note id.
     * @return A list of notes inside the collection.
     */
    public List<Note> addNoteToCollection(
            int collectionId,
            int noteId,
            Authentication authentication) {
        // Collection existence check
        Collection collection = getById(collectionId);
        authorizationService.checkOwnerOrAdmin(
                collection.getUsername(),
                authentication);

        // Note existence check
        noteDao.getById(noteId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Note not found"));

        if (collectionDao.existsNoteInCollection(collectionId, noteId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Note is already in the collection");
        }
        return collectionDao.addNoteToCollection(collectionId, noteId);
    }

    /**
     * Removes a note from a collection.
     *
     * @param collectionId The collection id.
     * @param noteId       The note id.
     * @return The number of deleted rows.
     */
    public int removeNoteFromCollection(
            int collectionId,
            int noteId,
            Authentication authentication) {

        Collection collection = getById(collectionId);
        authorizationService.checkOwnerOrAdmin(
                collection.getUsername(),
                authentication);

        int rows = collectionDao.removeNoteFromCollection(
                collectionId,
                noteId);
        if (rows == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Note is not in the collection");
        }
        return rows;
    }

}