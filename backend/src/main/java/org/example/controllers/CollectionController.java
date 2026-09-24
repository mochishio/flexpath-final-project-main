package org.example.controllers;

import org.example.models.Collection;
import org.example.models.Note;
import org.example.services.CollectionService;
import org.springframework.http.HttpStatus;
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

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public Collection create(@RequestBody Collection collection) {
        return collectionService.create(collection);
    }

    @PutMapping("/{id}")
    public Collection update(
            @PathVariable int id,
            @RequestBody Collection collection) {

        return collectionService.update(id, collection);
    }

    @DeleteMapping("/{id}")
    public int delete(@PathVariable int id) {
        return collectionService.delete(id);
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
    public List<Note> addNoteToCollection(
            @PathVariable int collectionId,
            @PathVariable int noteId) {
        return collectionService.addNoteToCollection(collectionId, noteId);
    }

    @DeleteMapping("{collectionId}/notes/{noteId}")
    public int removeNoteFromCollection(@PathVariable int collectionId, @PathVariable int noteId) {
        return collectionService.removeNoteFromCollection(collectionId, noteId);
    }
}