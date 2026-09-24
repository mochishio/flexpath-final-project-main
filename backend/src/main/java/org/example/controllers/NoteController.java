package org.example.controllers;

import org.example.models.Collection;
import org.example.models.Note;
import org.example.services.NoteService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public List<Note> getAll() {
        return noteService.getAll();
    }

    @GetMapping("/{id}")
    public Note getById(@PathVariable int id) {
        return noteService.getById(id);
    }

    @GetMapping("/{id}/collections")
    public List<Collection> getCollections(@PathVariable int id) {
        return noteService.getCollections(id);
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public Note create(@RequestBody Note note) {
        return noteService.create(note);
    }

    @PutMapping("/{id}")
    public Note update(
            @PathVariable int id,
            @RequestBody Note note) {

        return noteService.update(id, note);
    }

    @DeleteMapping("/{id}")
    public int delete(@PathVariable int id) {
        return noteService.delete(id);
    }
}