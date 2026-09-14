package org.example.models;

import java.time.LocalDateTime;

public class CollectionNote {
    private int id;
    private LocalDateTime createdAt;
    private int collectionId;
    private int noteId;

    public CollectionNote(int collectionId, int noteId) {
        this.collectionId = collectionId;
        this.noteId = noteId;
    }

    // getters
    public int getId() {
        return this.id;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    public int getCollectionId() {
        return this.collectionId;
    }

    public int getNoteId() {
        return this.noteId;
    }

    // setters
    public void setCollectionId(int collectionId) {
        this.collectionId = collectionId;
    }

    public void setNoteId(int noteId) {
        this.noteId = noteId;
    }
}
