package org.example;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.example.daos.CategoryDao;
import org.example.models.Category;
import org.example.services.CategoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class CategoryServiceTest {

    private CategoryDao categoryDao;
    private CategoryService categoryService;
    private String CATEGORY_NAME = "React";
    private Category category;

    @BeforeEach
    void setUp() {
        category = new Category();
        category.setId(1);
        category.setName(CATEGORY_NAME);

        categoryDao = Mockito.mock(CategoryDao.class);
        categoryService = new CategoryService(categoryDao);
    }

    @Test
    void getAll_shouldReturnAllCategories() {
        Category existingCategory = new Category();
        existingCategory.setId(2);
        existingCategory.setName("Java");

        when(categoryDao.getAll()).thenReturn(
            List.of(category, existingCategory)
        );

        List<Category> result = categoryService.getAll();
        assertEquals(2, result.size());
        assertEquals(1, result.get(0).getId());
        assertEquals(CATEGORY_NAME, result.get(0).getName());
        assertEquals(2, result.get(1).getId());
        assertEquals("Java", result.get(1).getName());
        verify(categoryDao).getAll();
    }

    @Test
    void getById_shouldReturnCategory_whenCategoryExists() {
        when(categoryDao.getById(1)).thenReturn(
            Optional.ofNullable(category)
        );

        Category result = categoryService.getById(1);
        assertEquals(1, result.getId());
        assertEquals(CATEGORY_NAME, result.getName());
        verify(categoryDao).getById(1);
    }

    @Test
    void getById_shouldThrowNotFound_whenCategoryDoesNotExist() {
        when(categoryDao.getById(100)).thenReturn(
            Optional.empty()
        );

        ResponseStatusException result = assertThrows(
            ResponseStatusException.class,
            () -> categoryService.getById(100)
        );
        assertEquals(HttpStatus.NOT_FOUND, result.getStatusCode());
        verify(categoryDao).getById(100);
    }

    @Test
    void create_shouldCreateCategory_whenNameIsValid() {
        when(categoryDao.getByName(CATEGORY_NAME)).thenReturn(Optional.empty());
        when(categoryDao.create(category)).thenReturn(category);

        Category result = categoryService.create(category);
        assertEquals(1, result.getId());
        assertEquals(CATEGORY_NAME, result.getName());
        verify(categoryDao).create(category);
    }

    @Test
    void create_shouldThrowConfilict_whenNameAlreadyExists() {
        Category existingCategory = new Category();
        existingCategory.setId(1);
        existingCategory.setName(CATEGORY_NAME);

        when(categoryDao.getByName(CATEGORY_NAME)).thenReturn(
            Optional.ofNullable(existingCategory)
        );

        ResponseStatusException result = assertThrows(
            ResponseStatusException.class,
            () -> categoryService.create(category)
        );
        assertEquals(HttpStatus.CONFLICT, result.getStatusCode());
        verify(categoryDao).getByName(CATEGORY_NAME);
        verify(categoryDao, never()).create(category);
    }

    @Test
    void update_shouldReturnUpdatedCategory_whenCategoryExists() {
        Category updatedCategory = new Category();
        updatedCategory.setId(1);
        updatedCategory.setName("Java");

        when(categoryDao.getById(1)).thenReturn(Optional.of(category));
        when(categoryDao.update(1, updatedCategory)).thenReturn(updatedCategory);

        Category result = categoryService.update(1, updatedCategory);
        assertEquals(1, result.getId());
        assertEquals("Java", result.getName());

        verify(categoryDao).getById(1);
        verify(categoryDao).update(1, updatedCategory);
    }

    @Test
    void update_shouldThrowNotFound_whenCategoryDoesNotExist() {
        Category updatedCategory = new Category();
        updatedCategory.setName("Java");

        when(categoryDao.getById(100)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> categoryService.update(100, updatedCategory)
        );
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(categoryDao).getById(100);
        verify(categoryDao, never()).update(100, updatedCategory);
    }

    @Test
    void delete_shouldReturnDeletedRowCount_whenCategoryExists() {
        when(categoryDao.delete(1)).thenReturn(1);

        int deletedCount = categoryService.delete(1);
        assertEquals(1, deletedCount);
        verify(categoryDao).delete(1);
    }

    @Test
    void delete_shouldThrowNotFound_whenCategoryDoesNotExist() {
        when(categoryDao.delete(100)).thenReturn(0);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> categoryService.delete(100)
        );
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(categoryDao).delete(100);
    }
}