package org.example.controllers;

import org.example.models.Collection;
import org.example.models.Note;
import org.example.services.AuditLogService;
import org.example.services.NoteService;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService noteService;
    private final AuditLogService auditLogService;

    public NoteController(NoteService noteService, AuditLogService auditLogService) {
        this.noteService = noteService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<Note> getAll() {
        return noteService.getAll();
    }

    @GetMapping("/{id}")
    public Note getById(@PathVariable int id) {
        return noteService.getById(id);
    }

    @GetMapping("/user/{username}")
    public List<Note> getByUsername(@PathVariable String username) {
        return noteService.getByUsername(username);
    }

    @GetMapping("/{id}/collections")
    public List<Collection> getCollections(@PathVariable int id) {
        return noteService.getCollections(id);
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public Note create(@RequestBody Note note, Authentication authentication) {
        Note createdNote = noteService.create(note);
        auditLogService.log(
            authentication.getName(),
            "CREATE",
            "NOTE",
            createdNote.getId()
        );
        return createdNote;
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public Note update(
            @PathVariable int id,
            @RequestBody Note note,
            Authentication authentication) {
        return noteService.update(id, note, authentication);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public int delete(
            @PathVariable int id,
            Authentication authentication) {
        return noteService.delete(id, authentication);
    }
}