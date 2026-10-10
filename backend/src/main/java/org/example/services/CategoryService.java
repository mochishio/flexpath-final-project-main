package org.example.services;

import org.example.daos.CategoryDao;
import org.example.models.Category;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryDao categoryDao;

    public CategoryService(CategoryDao categoryDao) {
        this.categoryDao = categoryDao;
    }

    /**
     * Gets all categories.
     *
     * @return A list of all categories.
     */
    public List<Category> getAll() {
        return categoryDao.getAll();
    }

    /**
     * Gets a category by id.
     *
     * @param id The id of the category.
     * @return The category.
     */
    public Category getById(int id) {
        return categoryDao.getById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Category not found"));
    }

    /**
     * Creates a new category.
     *
     * @param category The category to create.
     * @return The created category.
     */
    public Category create(Category category) {
        String name = category.getName();
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Name is empty");
        }
        if (categoryDao.getByName(name).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Category already exists");

        }
        return categoryDao.create(category);
    }

    /**
     * Updates a category.
     *
     * @param id       The id of the category.
     * @param category The new category information.
     * @return The updated category.
     */
    public Category update(int id, Category category) {
        // Check whether the category exists.
        getById(id);

        if (categoryDao.getByName(category.getName()).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Category already exists");

        }
        return categoryDao.update(id, category);
    }

    /**
     * Deletes a category.
     *
     * @param id The id of the category.
     * @return The number of deleted rows.
     */
    public int delete(int id) {
        int rows = categoryDao.delete(id);

        if (rows == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Category not found");
        }

        return rows;
    }
}