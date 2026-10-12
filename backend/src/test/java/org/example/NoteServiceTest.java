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

import org.example.daos.NoteDao;
import org.example.models.Collection;
import org.example.models.Note;
import org.example.services.AuthorizationService;
import org.example.services.NoteService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

class NoteServiceTest {

    private NoteDao noteDao;
    private NoteService noteService;
    private Authentication authentication;
    private AuthorizationService authorizationService;
    private String NOTE_TITLE = "Create Database";
    private Note note;

    @BeforeEach
    void setUp() {
        note = new Note();
        note.setId(1);
        note.setTitle(NOTE_TITLE);
        note.setContent("");
        note.setIsPublic(true);
        note.setUsername("user");
        note.setCategoryId(1);

        noteDao = Mockito.mock(NoteDao.class);
        authentication = Mockito.mock(Authentication.class);
        authorizationService = Mockito.mock(AuthorizationService.class);

        noteService = new NoteService(noteDao, authorizationService);
    }

    @Test
    void getAll_shouldReturnAllNotes() {
        Note existingNote = new Note();
        existingNote.setId(2);
        existingNote.setTitle("React Router");
        existingNote.setContent("content");
        existingNote.setUsername("admin");
        existingNote.setCategoryId(2);

        when(noteDao.getAll()).thenReturn(
                List.of(note, existingNote));

        List<Note> result = noteService.getAll();
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
        assertEquals(2, result.get(1).getCategoryId());

        verify(noteDao).getAll();
    }

    @Test
    void getById_shouldReturnNote_whenNoteExists() {
        when(noteDao.getById(1)).thenReturn(
                Optional.ofNullable(note));

        Note result = noteService.getById(1);
        assertEquals(1, result.getId());
        assertEquals(NOTE_TITLE, result.getTitle());
        assertEquals("", result.getContent());
        assertEquals(true, result.getIsPublic());
        assertEquals("user", result.getUsername());
        assertEquals(1, result.getCategoryId());

        verify(noteDao).getById(1);
    }

    @Test
    void getById_shouldThrowNotFound_whenNoteDoesNotExist() {
        when(noteDao.getById(100)).thenReturn(
                Optional.empty());

        ResponseStatusException result = assertThrows(
                ResponseStatusException.class,
                () -> noteService.getById(100));
        assertEquals(HttpStatus.NOT_FOUND, result.getStatusCode());
        verify(noteDao).getById(100);
    }

    @Test
    void getByUsername_shouldReturnAllNotes() {
        Note existingNote = new Note();
        existingNote.setId(2);
        existingNote.setTitle("React Router");
        existingNote.setContent("content");
        existingNote.setUsername("user");
        existingNote.setCategoryId(2);

        when(noteDao.getByUsername(note.getUsername())).thenReturn(
                List.of(note, existingNote));

        List<Note> result = noteService.getByUsername(note.getUsername());
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
        assertEquals("user", result.get(1).getUsername());
        assertEquals(2, result.get(1).getCategoryId());

        verify(noteDao).getByUsername(note.getUsername());
    }

    @Test
    void getCollections_shouldReturnAllCollections() {
        Collection collection = new Collection();
        collection.setId(1);
        collection.setName("Read Later");
        collection.setDescription("");
        collection.setIsPublic(true);
        collection.setUsername("user");

        Collection existingCollection = new Collection();
        existingCollection.setId(2);
        existingCollection.setName("My Best 2026");
        existingCollection.setDescription("description");
        existingCollection.setUsername("user");

        when(noteDao.getById(note.getId()))
                .thenReturn(Optional.of(note));
        when(noteDao.getCollections(note.getId()))
                .thenReturn(List.of(collection, existingCollection));

        List<Collection> result = noteDao.getCollections(note.getId());
        assertEquals(2, result.size());
        // 1
        assertEquals(1, result.get(0).getId());
        assertEquals("Read Later", result.get(0).getName());
        assertEquals("", result.get(0).getDescription());
        assertTrue(result.get(0).getIsPublic());
        assertEquals("user", result.get(0).getUsername());
        // 2
        assertEquals(2, result.get(1).getId());
        assertEquals("My Best 2026", result.get(1).getName());
        assertEquals("description", result.get(1).getDescription());
        assertFalse(result.get(1).getIsPublic());
        assertEquals("user", result.get(1).getUsername());

        verify(noteDao).getCollections(note.getId());
    }

    @Test
    void getCollections_shouldReturnEmptyList_whenNoteHasNoCollections() {
        when(noteDao.getById(note.getId()))
                .thenReturn(Optional.of(note));
        when(noteDao.getCollections(note.getId()))
                .thenReturn(List.of());

        List<Collection> result = noteService.getCollections(note.getId());
        assertTrue(result.isEmpty());
        verify(noteDao).getById(note.getId());
        verify(noteDao).getCollections(note.getId());
    }

    @Test
    void getCollections_shouldThrowNotFound_whenNoteDoesNotExist() {
        ResponseStatusException result = assertThrows(
                ResponseStatusException.class,
                () -> noteService.getCollections(100));
        assertEquals(HttpStatus.NOT_FOUND, result.getStatusCode());
        verify(noteDao).getById(100);
        verify(noteDao, never()).getCollections(100);
    }

    @Test
    void create_shouldCreateNote_whenInputIsValid() {
        when(noteDao.create(note)).thenReturn(note);

        Note result = noteService.create(note);
        assertEquals(1, result.getId());
        assertEquals(NOTE_TITLE, result.getTitle());
        assertEquals("", result.getContent());
        assertEquals(true, result.getIsPublic());
        assertEquals("user", result.getUsername());
        assertEquals(1, result.getCategoryId());

        verify(noteDao).create(note);
    }

    @Test
    void create_shouldThrowBadRequest_whenTitleIsBlank() {
        Note nullContentNote = new Note();
        nullContentNote.setId(2);
        nullContentNote.setTitle("");
        nullContentNote.setContent("content");
        nullContentNote.setUsername("user");
        nullContentNote.setCategoryId(1);

        ResponseStatusException result = assertThrows(
                ResponseStatusException.class,
                () -> noteService.create(nullContentNote));
        assertEquals(HttpStatus.BAD_REQUEST, result.getStatusCode());
        verify(noteDao, never()).create(nullContentNote);
    }

    @Test
    void create_shouldThrowBadRequest_whenContentIsNull() {
        Note nullContentNote = new Note();
        nullContentNote.setId(2);
        nullContentNote.setTitle("React Router");
        nullContentNote.setContent(null);
        nullContentNote.setUsername("user");
        nullContentNote.setCategoryId(1);

        ResponseStatusException result = assertThrows(
                ResponseStatusException.class,
                () -> noteService.create(nullContentNote));
        assertEquals(HttpStatus.BAD_REQUEST, result.getStatusCode());
        verify(noteDao, never()).create(nullContentNote);
    }

    @Test
    void create_shouldThrowBadRequest_whenUsernameIsBlank() {
        Note emptyUsernameNote = new Note();
        emptyUsernameNote.setId(2);
        emptyUsernameNote.setTitle("React Router");
        emptyUsernameNote.setContent("content");
        emptyUsernameNote.setUsername("");
        emptyUsernameNote.setCategoryId(1);

        ResponseStatusException result = assertThrows(
                ResponseStatusException.class,
                () -> noteService.create(emptyUsernameNote));
        assertEquals(HttpStatus.BAD_REQUEST, result.getStatusCode());
        verify(noteDao, never()).create(emptyUsernameNote);
    }

    @Test
    void update_shouldReturnUpdatedNote_whenNoteExists() {
        Note updatedNote = new Note();
        updatedNote.setId(1);
        updatedNote.setTitle("React Router");
        updatedNote.setContent("content");
        updatedNote.setIsPublic(false);
        updatedNote.setUsername("admin");
        updatedNote.setCategoryId(1);

        when(noteDao.getById(1)).thenReturn(Optional.of(note));
        when(noteDao.update(1, updatedNote)).thenReturn(updatedNote);
        when(authentication.getName()).thenReturn("admin");

        Note result = noteService.update(1, updatedNote, authentication);
        assertEquals(1, result.getId());
        assertEquals("React Router", result.getTitle());
        assertEquals("content", result.getContent());
        assertFalse(result.getIsPublic());
        assertEquals("admin", result.getUsername());
        assertEquals(1, result.getCategoryId());

        verify(noteDao).getById(1);
        verify(noteDao).update(1, updatedNote);
    }

    @Test
    void update_shouldThrowNotFound_whenNoteDoesNotExist() {
        Note updatedNote = new Note();
        updatedNote.setTitle("React Router");

        when(noteDao.getById(100)).thenReturn(Optional.empty());
        when(authentication.getName()).thenReturn("user");

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> noteService.update(100, updatedNote, authentication));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(noteDao).getById(100);
        verify(noteDao, never()).update(100, updatedNote);
    }

    @Test
    void update_shouldThrowBadRequest_whenTitleIsBlank() {
        when(noteDao.getById(1)).thenReturn(Optional.of(note));
        when(authentication.getName()).thenReturn("user");

        Note updatedEmptyNameNote = new Note();
        updatedEmptyNameNote.setId(1);
        updatedEmptyNameNote.setTitle("");
        updatedEmptyNameNote.setContent("content");
        updatedEmptyNameNote.setIsPublic(false);
        updatedEmptyNameNote.setUsername("user");
        updatedEmptyNameNote.setCategoryId(1);

        ResponseStatusException result = assertThrows(
                ResponseStatusException.class,
                () -> noteService.update(1, updatedEmptyNameNote, authentication));
        assertEquals(HttpStatus.BAD_REQUEST, result.getStatusCode());

        verify(noteDao).getById(1);
        verify(noteDao, never()).update(1, updatedEmptyNameNote);
    }

    @Test
    void delete_shouldReturnDeletedRowCount_whenNoteExists() {
        when(noteDao.getById(1)).thenReturn(Optional.of(note));
        when(noteDao.delete(1)).thenReturn(1);
        when(authentication.getName()).thenReturn("user");

        int deletedCount = noteService.delete(1, authentication);
        assertEquals(1, deletedCount);
        verify(noteDao).delete(1);
    }

    @Test
    void delete_shouldThrowNotFound_whenNoteDoesNotExist() {
        when(noteDao.delete(100)).thenReturn(0);
        when(authentication.getName()).thenReturn("user");

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> noteService.delete(100, authentication));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(noteDao, never()).delete(100);
    }
}