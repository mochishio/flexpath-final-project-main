package org.example.models;

import java.time.LocalDateTime;

public class Note {
    private int id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String title;
    private String content;
    private boolean isPublic;
    private String username;
    private Integer categoryId;

    public Note() {
    }

    // getters
    public int getId() {
        return this.id;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return this.updatedAt;
    }

    public String getTitle() {
        return this.title;
    }

    public String getContent() {
        return this.content;
    }

    public boolean getIsPublic() {
        return this.isPublic;
    }

    public String getUsername() {
        return this.username;
    }

    public Integer getCategoryId() {
        return this.categoryId;
    }

    // setters
    public void setId(int id) {
        this.id = id;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setIsPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }
}
