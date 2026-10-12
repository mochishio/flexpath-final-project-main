package org.example;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.example.daos.CollectionDao;
import org.example.daos.NoteDao;
import org.example.models.Collection;
import org.example.models.Note;
import org.example.services.AuthorizationService;
import org.example.services.CollectionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

class CollectionServiceTest {

    private CollectionDao collectionDao;
    private NoteDao noteDao;
    private CollectionService collectionService;
    private String COLLECTION_NAME = "Read Later";
    private String NOTE_TITLE = "Create Database";
    private Collection collection;
    private Note note;
    private Authentication authentication;
    private AuthorizationService authorizationService;

    @BeforeEach
    void setUp() {
        collection = new Collection();
        collection.setId(1);
        collection.setName(COLLECTION_NAME);
        collection.setDescription("");
        collection.setIsPublic(true);
        collection.setUsername("user");

        note = new Note();
        note.setId(1);
        note.setTitle(NOTE_TITLE);
        note.setContent("");
        note.setIsPublic(true);
        note.setUsername("user");
        note.setCategoryId(1);

        collectionDao = Mockito.mock(CollectionDao.class);
        noteDao = Mockito.mock(NoteDao.class);
        authentication = Mockito.mock(Authentication.class);
        authorizationService = Mockito.mock(AuthorizationService.class);

        collectionService = new CollectionService(
                collectionDao,
                noteDao,
                authorizationService);
    }

    @Test
    void getAll_shouldReturnAllCollections() {
        Collection existingCollection = new Collection();
        existingCollection.setId(2);
        existingCollection.setName("My Best 2026");
        existingCollection.setDescription("description");
        existingCollection.setUsername("admin");

        when(collectionDao.getAll()).thenReturn(
                List.of(collection, existingCollection));

        List<Collection> result = collectionService.getAll();
        assertEquals(2, result.size());
        // 1
        assertEquals(1, result.get(0).getId());
        assertEquals(COLLECTION_NAME, result.get(0).getName());
        assertEquals("", result.get(0).getDescription());
        assertTrue(result.get(0).getIsPublic());
        assertEquals("user", result.get(0).getUsername());
        // 2
        assertEquals(2, result.get(1).getId());
        assertEquals("My Best 2026", result.get(1).getName());
        assertEquals("description", result.get(1).getDescription());
        assertFalse(result.get(1).getIsPublic());
        assertEquals("admin", result.get(1).getUsername());

        verify(collectionDao).getAll();
    }

    @Test
    void getById_shouldReturnCollection_whenCollectionExists() {
        when(collectionDao.getById(1)).thenReturn(
                Optional.ofNullable(collection));

        Collection result = collectionService.getById(1);
        assertEquals(1, result.getId());
        assertEquals(COLLECTION_NAME, result.getName());
        assertEquals("", result.getDescription());
        assertEquals(true, result.getIsPublic());
        assertEquals("user", result.getUsername());

        verify(collectionDao).getById(1);
    }

    @Test
    void getById_shouldThrowNotFound_whenCollectionDoesNotExist() {
        when(collectionDao.getById(100)).thenReturn(
                Optional.empty());

        ResponseStatusException result = assertThrows(
                ResponseStatusException.class,
                () -> collectionService.getById(100));
        assertEquals(HttpStatus.NOT_FOUND, result.getStatusCode());
        verify(collectionDao).getById(100);
    }

    @Test
    void getByUsername_shouldReturnAllCollections() {
        Collection existingCollection = new Collection();
        existingCollection.setId(2);
        existingCollection.setName("My Best 2026");
        existingCollection.setDescription("description");
        existingCollection.setUsername("user");

        when(collectionDao.getByUsername(collection.getUsername())).thenReturn(
                List.of(collection, existingCollection));

        List<Collection> result = collectionService.getByUsername(collection.getUsername());
        assertEquals(2, result.size());
        // 1
        assertEquals(1, result.get(0).getId());
        assertEquals(COLLECTION_NAME, result.get(0).getName());
        assertEquals("", result.get(0).getDescription());
        assertTrue(result.get(0).getIsPublic());
        assertEquals("user", result.get(0).getUsername());
        // 2
        assertEquals(2, result.get(1).getId());
        assertEquals("My Best 2026", result.get(1).getName());
        assertEquals("description", result.get(1).getDescription());
        assertFalse(result.get(1).getIsPublic());
        assertEquals("user", result.get(1).getUsername());

        verify(collectionDao).getByUsername(collection.getUsername());
    }

    @Test
    void getPublicCollections_shouldReturnAllPublicCollections() {
        Collection existingCollection = new Collection();
        existingCollection.setId(2);
        existingCollection.setName("My Best 2026");
        existingCollection.setDescription("description");
        existingCollection.setIsPublic(true);
        existingCollection.setUsername("admin");

        when(collectionDao.getPublicCollections()).thenReturn(
                List.of(collection, existingCollection));

        List<Collection> result = collectionService.getPublicCollections();
        assertEquals(2, result.size());
        // 1
        assertEquals(1, result.get(0).getId());
        assertEquals(COLLECTION_NAME, result.get(0).getName());
        assertEquals("", result.get(0).getDescription());
        assertTrue(result.get(0).getIsPublic());
        assertEquals("user", result.get(0).getUsername());
        // 2
        assertEquals(2, result.get(1).getId());
        assertEquals("My Best 2026", result.get(1).getName());
        assertEquals("description", result.get(1).getDescription());
        assertTrue(result.get(1).getIsPublic());
        assertEquals("admin", result.get(1).getUsername());

        verify(collectionDao).getPublicCollections();
    }

    @Test
    void create_shouldCreateCollection_whenInputIsValid() {
        when(collectionDao.create(collection)).thenReturn(collection);

        Collection result = collectionService.create(collection);
        assertEquals(1, result.getId());
        assertEquals(COLLECTION_NAME, result.getName());
        assertEquals("", result.getDescription());
        assertEquals(true, result.getIsPublic());
        assertEquals("user", result.getUsername());

        verify(collectionDao).create(collection);
    }

    @Test
    void create_shouldThrowBadRequest_whenNameIsBlank() {
        Collection emptyNameCollection = new Collection();
        emptyNameCollection.setId(2);
        emptyNameCollection.setName("");
        emptyNameCollection.setUsername("user");

        ResponseStatusException result = assertThrows(
                ResponseStatusException.class,
                () -> collectionService.create(emptyNameCollection));
        assertEquals(HttpStatus.BAD_REQUEST, result.getStatusCode());
        verify(collectionDao, never()).create(emptyNameCollection);
    }

    @Test
    void create_shouldThrowBadRequest_whenUsernameIsBlank() {
        Collection emptyUsernameCollection = new Collection();
        emptyUsernameCollection.setId(2);
        emptyUsernameCollection.setName("My Best 2026");
        emptyUsernameCollection.setUsername("");

        ResponseStatusException result = assertThrows(
                ResponseStatusException.class,
                () -> collectionService.create(emptyUsernameCollection));
        assertEquals(HttpStatus.BAD_REQUEST, result.getStatusCode());
        verify(collectionDao, never()).create(emptyUsernameCollection);
    }

    @Test
    void update_shouldReturnUpdatedCollection_whenCollectionExists() {
        Collection updatedCollection = new Collection();
        updatedCollection.setId(1);
        updatedCollection.setName("My Best 2026");
        updatedCollection.setDescription("description");
        updatedCollection.setIsPublic(false);
        updatedCollection.setUsername("admin");

        when(collectionDao.getById(1)).thenReturn(Optional.of(collection));
        when(collectionDao.update(1, updatedCollection)).thenReturn(updatedCollection);
        when(authentication.getName()).thenReturn("admin");

        Collection result = collectionService.update(1, updatedCollection, authentication);
        assertEquals(1, result.getId());
        assertEquals("My Best 2026", result.getName());
        assertEquals("description", result.getDescription());
        assertFalse(result.getIsPublic());
        assertEquals("admin", result.getUsername());

        verify(collectionDao).getById(1);
        verify(collectionDao).update(1, updatedCollection);
    }

    @Test
    void update_shouldThrowNotFound_whenCollectionDoesNotExist() {
        Collection updatedCollection = new Collection();
        updatedCollection.setName("My Best 2026");

        when(collectionDao.getById(100)).thenReturn(Optional.empty());
        when(authentication.getName()).thenReturn("user");

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> collectionService.update(100, updatedCollection, authentication));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(collectionDao).getById(100);
        verify(collectionDao, never()).update(100, updatedCollection);
    }

    @Test
    void update_shouldThrowBadRequest_whenNameIsBlank() {
        when(collectionDao.getById(1)).thenReturn(Optional.of(collection));
        when(authentication.getName()).thenReturn("user");

        Collection updatedEmptyNameCollection = new Collection();
        updatedEmptyNameCollection.setId(1);
        updatedEmptyNameCollection.setName("");
        updatedEmptyNameCollection.setDescription("description");
        updatedEmptyNameCollection.setIsPublic(false);
        updatedEmptyNameCollection.setUsername("user");

        ResponseStatusException result = assertThrows(
                ResponseStatusException.class,
                () -> collectionService.update(1, updatedEmptyNameCollection, authentication));
        assertEquals(HttpStatus.BAD_REQUEST, result.getStatusCode());

        verify(collectionDao).getById(1);
        verify(collectionDao, never()).update(1, updatedEmptyNameCollection);
    }

    @Test
    void delete_shouldReturnDeletedRowCount_whenCollectionExists() {
        when(collectionDao.getById(1)).thenReturn(Optional.of(collection));
        when(collectionDao.delete(1)).thenReturn(1);
        when(authentication.getName()).thenReturn("user");

        int deletedCount = collectionService.delete(1, authentication);
        assertEquals(1, deletedCount);
        verify(collectionDao).delete(1);
    }

    @Test
    void delete_shouldThrowNotFound_whenCollectionDoesNotExist() {
        when(collectionDao.getById(100)).thenReturn(Optional.empty());
        when(collectionDao.delete(100)).thenReturn(0);
        when(authentication.getName()).thenReturn("user");

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> collectionService.delete(100, authentication));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(collectionDao).getById(100);
        verify(collectionDao, never()).delete(100);
    }

    // ======================
    // CollectionNote
    // ======================
    @Test
    void getAllNotes_shouldReturnAllNotesInCollection() {
        Note existingNote = new Note();
        existingNote.setId(2);
        existingNote.setTitle("React Router");
        existingNote.setContent("content");
        existingNote.setUsername("admin");
        existingNote.setCategoryId(1);

        when(collectionDao.getById(collection.getId()))
                .thenReturn(Optional.of(collection));
        when(collectionDao.getAllNotes(collection.getId()))
                .thenReturn(List.of(note, existingNote));

        List<Note> result = collectionService.getAllNotes(collection.getId());
        assertEquals(2, result.size());
        // 1
        assertEquals(1, result.get(0).getId());
        assertEquals(NOTE_TITLE, result.get(0).getTitle());
        assertEquals("", result.get(0).getContent());
        assertTrue(result.get(0).getIsPublic());
        assertEquals("user", result.get(0).getUsername());
        assertEquals(1, result.get(0).getCategoryId());
        // 2
        assertEquals(2, result.get(1).getId());
        assertEquals("React Router", result.get(1).getTitle());
        assertEquals("content", result.get(1).getContent());
        assertFalse(result.get(1).getIsPublic());
        assertEquals("admin", result.get(1).getUsername());
        assertEquals(1, result.get(1).getCategoryId());

        verify(collectionDao).getById(collection.getId());
        verify(collectionDao).getAllNotes(collection.getId());
    }

    @Test
    void getAllNotes_shouldThrowNotFound_whenCollectionDoesNotExist() {
        when(collectionDao.getById(100)).thenReturn(Optional.empty());

        ResponseStatusException result = assertThrows(
                ResponseStatusException.class,
                () -> collectionService.getAllNotes(100));

        assertEquals(HttpStatus.NOT_FOUND, result.getStatusCode());
        verify(collectionDao).getById(100);
        verify(collectionDao, never()).getAllNotes(100);
    }

    @Test
    void addNoteToCollection_shouldAddNote_whenInputIsValid() {
        Note existingNote = new Note();
        existingNote.setId(2);
        existingNote.setTitle("React Router");
        existingNote.setContent("content");
        existingNote.setUsername("admin");
        existingNote.setCategoryId(1);

        when(collectionDao.getById(collection.getId()))
                .thenReturn(Optional.of(collection));
        when(noteDao.getById(note.getId()))
                .thenReturn(Optional.of(note));
        when(collectionDao.existsNoteInCollection(
                collection.getId(),
                note.getId())).thenReturn(false);
        when(collectionDao.addNoteToCollection(
                collection.getId(),
                note.getId())).thenReturn(List.of(note, existingNote));
        when(authentication.getName()).thenReturn("user");

        List<Note> result = collectionService.addNoteToCollection(
                collection.getId(),
                note.getId(),
                authentication);
        assertEquals(2, result.size());
        // 1
        assertEquals(1, result.get(0).getId());
        assertEquals(NOTE_TITLE, result.get(0).getTitle());
        assertEquals("", result.get(0).getContent());
        assertTrue(result.get(0).getIsPublic());
        assertEquals("user", result.get(0).getUsername());
        assertEquals(1, result.get(0).getCategoryId());
        // 2
        assertEquals(2, result.get(1).getId());
        assertEquals("React Router", result.get(1).getTitle());
        assertEquals("content", result.get(1).getContent());
        assertFalse(result.get(1).getIsPublic());
        assertEquals("admin", result.get(1).getUsername());
        assertEquals(1, result.get(1).getCategoryId());

        verify(collectionDao).getById(collection.getId());
        verify(noteDao).getById(note.getId());
        verify(collectionDao)
                .existsNoteInCollection(collection.getId(), note.getId());
        verify(collectionDao)
                .addNoteToCollection(collection.getId(), note.getId());
    }

    @Test
    void addNoteToCollection_shouldThrowConflict_whenNoteIsAlreadyInCollection() {
        when(collectionDao.getById(collection.getId()))
                .thenReturn(Optional.of(collection));
        when(noteDao.getById(note.getId()))
                .thenReturn(Optional.of(note));
        when(collectionDao.existsNoteInCollection(
                collection.getId(),
                note.getId()))
                .thenReturn(true);
        when(authentication.getName()).thenReturn("user");

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> collectionService.addNoteToCollection(
                        collection.getId(),
                        note.getId(),
                        authentication));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(collectionDao, never())
                .addNoteToCollection(collection.getId(), note.getId());
    }

    @Test
    void addNoteToCollection_shouldThrowNotFound_whenCollectionDoesNotExist() {
        when(collectionDao.getById(100))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> collectionService.addNoteToCollection(
                        100,
                        note.getId(),
                        authentication));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(collectionDao).getById(100);
        verify(collectionDao, never())
                .addNoteToCollection(100, note.getId());
        when(authentication.getName()).thenReturn("user");
    }

    @Test
    void addNoteToCollection_shouldThrowNotFound_whenNoteDoesNotExist() {
        when(collectionDao.getById(collection.getId()))
                .thenReturn(Optional.of(collection));
        when(noteDao.getById(100))
                .thenReturn(Optional.empty());
        when(authentication.getName()).thenReturn("user");

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> collectionService.addNoteToCollection(
                        collection.getId(), 100, authentication));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(collectionDao).getById(collection.getId());
        verify(noteDao).getById(100);
        verify(collectionDao, never())
                .addNoteToCollection(collection.getId(), 100);
    }

    @Test
    void removeNoteFromCollection_shouldReturnDeletedRowCount_whenNoteIsInCollection() {
        when(collectionDao.getById(collection.getId()))
                .thenReturn(Optional.of(collection));
        when(collectionDao.removeNoteFromCollection(
                collection.getId(),
                note.getId()))
                .thenReturn(1);
        when(authentication.getName()).thenReturn("user");

        int result = collectionService.removeNoteFromCollection(
                collection.getId(),
                note.getId(),
                authentication);

        assertEquals(1, result);
        verify(collectionDao).getById(collection.getId());
        verify(collectionDao).removeNoteFromCollection(
                collection.getId(),
                note.getId());
    }

    @Test
    void removeNoteFromCollection_shouldThrowNotFound_whenCollectionDoesNotExist() {
        when(collectionDao.getById(100)).thenReturn(Optional.empty());
        when(authentication.getName()).thenReturn("user");

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> collectionService.removeNoteFromCollection(
                        100,
                        note.getId(),
                        authentication));

        assertEquals(
                HttpStatus.NOT_FOUND,
                exception.getStatusCode());
        verify(collectionDao).getById(100);
        verify(collectionDao, never())
                .removeNoteFromCollection(100, note.getId());
    }

    @Test
    void removeNoteFromCollection_shouldThrowNotFound_whenNoteIsNotInCollection() {
        when(collectionDao.getById(collection.getId()))
                .thenReturn(Optional.of(collection));
        when(collectionDao.removeNoteFromCollection(
                collection.getId(),
                100))
                .thenReturn(0);
        when(authentication.getName()).thenReturn("user");

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> collectionService.removeNoteFromCollection(
                        collection.getId(), 100, authentication));

        assertEquals(
                HttpStatus.NOT_FOUND,
                exception.getStatusCode());
        verify(collectionDao).getById(collection.getId());
        verify(collectionDao).removeNoteFromCollection(
                collection.getId(), 100);
    }
}