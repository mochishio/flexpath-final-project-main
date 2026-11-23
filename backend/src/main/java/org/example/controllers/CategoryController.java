package org.example.controllers;

import org.example.models.Category;
import org.example.services.AuditLogService;
import org.example.services.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final AuditLogService auditLogService;

    public CategoryController(
            CategoryService categoryService,
            AuditLogService auditLogService) {
        this.categoryService = categoryService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<Category> getAll() {
        return categoryService.getAll();
    }

    @GetMapping("/{id}")
    public Category getById(@PathVariable int id) {
        return categoryService.getById(id);
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public Category create(
            @RequestBody Category category,
            Authentication authentication) {
        Category createdCategory = categoryService.create(category);
        auditLogService.log(
                authentication.getName(),
                "CREATE",
                "CATEGORY",
                createdCategory.getId(),
                "");
        return createdCategory;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public Category update(
            @PathVariable int id,
            @RequestBody Category category,
            Authentication authentication) {
        auditLogService.log(
                authentication.getName(),
                "UPDATE",
                "CATEGORY",
                id,
                "");
        return categoryService.update(id, category);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public int delete(
            @PathVariable int id,
            Authentication authentication) {
        auditLogService.log(
                authentication.getName(),
                "DELETE",
                "CATEGORY",
                id,
                "");
        return categoryService.delete(id);
    }
}