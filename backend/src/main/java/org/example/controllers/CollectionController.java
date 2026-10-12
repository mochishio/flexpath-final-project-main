package org.example.controllers;

import org.example.models.Collection;
import org.example.models.Note;
import org.example.services.CollectionService;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api/collections")
public class CollectionController {

    private final CollectionService collectionService;

    public CollectionController(CollectionService collectionService) {
        this.collectionService = collectionService;
    }

    @GetMapping
    public List<Collection> getAll() {
        return collectionService.getAll();
    }

    @GetMapping("/{id}")
    public Collection getById(@PathVariable int id) {
        return collectionService.getById(id);
    }

    @GetMapping("user/{username}")
    public List<Collection> getByUsername(@PathVariable String username) {
        return collectionService.getByUsername(username);
    }

    @GetMapping("/public")
    public List<Collection> getPublicCollections() {
        return collectionService.getPublicCollections();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public Collection create(@RequestBody Collection collection) {
        return collectionService.create(collection);
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public Collection update(
            @PathVariable int id,
            @RequestBody Collection collection,
            Authentication authentication) {

        return collectionService.update(id, collection, authentication);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public int delete(
            @PathVariable int id,
            Authentication authentication) {
        return collectionService.delete(id, authentication);
    }

    // ======================
    // CollectionNote
    // ======================
    @GetMapping("{collectionId}/notes")
    public List<Note> getAllNotes(@PathVariable int collectionId) {
        return collectionService.getAllNotes(collectionId);
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("{collectionId}/notes/{noteId}")
    @PreAuthorize("isAuthenticated()")
    public List<Note> addNoteToCollection(
            @PathVariable int collectionId,
            @PathVariable int noteId,
            Authentication authentication) {
        return collectionService.addNoteToCollection(
                collectionId, noteId, authentication);
    }

    @DeleteMapping("{collectionId}/notes/{noteId}")
    @PreAuthorize("isAuthenticated()")
    public int removeNoteFromCollection(
            @PathVariable int collectionId,
            @PathVariable int noteId,
            Authentication authentication) {
        return collectionService.removeNoteFromCollection(
                collectionId,
                noteId,
                authentication);
    }
}