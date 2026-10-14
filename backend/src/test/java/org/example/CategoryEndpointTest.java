package org.example;

import java.util.List;
import org.example.models.Category;
import org.example.services.CategoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class CategoryEndpointTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CategoryService categoryService;

    private String adminToken;
    private String userToken;
    private String noUserToken;
    private Category category;

    @BeforeEach
    void setUp() throws Exception {
        category = new Category();
        category.setId(1);
        category.setName("CSS");

        adminToken = login("admin2", "admin2");
        userToken = login("user2", "user2");
        noUserToken = "";
    }

    private String login(String username, String password) throws Exception {
        String requestBody = objectMapper.writeValueAsString(java.util.Map.of(
                "username", username, "password", password));
        MvcResult loginResult = mockMvc.perform(
                post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode loginResponse = objectMapper.readTree(
                loginResult.getResponse().getContentAsString());
        return loginResponse.path("accessToken").path("token").asText();
    }

    @Test
    void getAll_shouldReturnOk() throws Exception {
        when(categoryService.getAll()).thenReturn(List.of());
        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void getById_shouldReturnOk() throws Exception {
        when(categoryService.getById(1)).thenReturn(category);
        mockMvc.perform(get("/api/categories/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("CSS"));
    }

    @Test
    void getById_shouldReturnError_whenCategoryDoesNotExist() throws Exception {
        when(categoryService.getById(100)).thenThrow(
                new ResponseStatusException(HttpStatus.NOT_FOUND));
        mockMvc.perform(get("/api/categories/100"))
                .andExpect(status().isNotFound());
    }

    @Test
    void create_shouldReturnOk() throws Exception {
        when(categoryService.create(any(Category.class))).thenReturn(category);
        mockMvc.perform(post("/api/categories")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"name": "CSS"}
                        """))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void create_shouldReturnConflict_whenNameAlreadyExists() throws Exception {
        when(categoryService.create(any(Category.class))).thenThrow(
                new ResponseStatusException(HttpStatus.CONFLICT));
        mockMvc.perform(post("/api/categories")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"name": "CSS"}
                        """))
                .andExpect(status().isConflict());
    }

    @Test
    void create_shouldReturnError_whenUserIsNotAdmin() throws Exception {
        when(categoryService.create(any(Category.class))).thenReturn(category);
        mockMvc.perform(post("/api/categories")
                .header("Authorization", userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"name": "CSS"}
                        """))
                .andExpect(status().isForbidden());
    }

    @Test
    void create_shouldReturnError_whenUserIsNotLogin() throws Exception {
        when(categoryService.create(any(Category.class))).thenReturn(category);
        mockMvc.perform(post("/api/categories")
                .header("Authorization", noUserToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"name": "CSS"}
                        """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void update_shouldReturnOk() throws Exception {
        when(categoryService.update(1, category)).thenReturn(category);
        mockMvc.perform(put("/api/categories/1")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"name": "CSS updated"}
                        """))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void update_shouldReturnError_whenCategoryDoesNotExist() throws Exception {
        when(categoryService.update(eq(100), any(Category.class))).thenThrow(
                new ResponseStatusException(HttpStatus.NOT_FOUND));
        mockMvc.perform(put("/api/categories/100")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"name": "CSS updated"}
                        """))
                .andExpect(status().isNotFound());
    }

    @Test
    void update_shouldReturnConflictError_whenNameAlreadyExists() throws Exception {
        when(categoryService.update(eq(1), any(Category.class))).thenThrow(
                new ResponseStatusException(HttpStatus.CONFLICT));
        mockMvc.perform(put("/api/categories/1")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"name": "CSS"}
                        """))
                .andExpect(status().isConflict());
    }

    @Test
    void update_shouldReturnError() throws Exception {
        mockMvc.perform(put("/api/categories/1")
                .header("Authorization", userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"name": "CSS"}
                        """))
                .andExpect(status().isForbidden());
    }

    @Test
    void update_shouldReturnError_whenUserIsNotLogin() throws Exception {
        mockMvc.perform(put("/api/categories/1")
                .header("Authorization", noUserToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"name": "CSS"}
                        """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void delete_shouldReturnOk() throws Exception {
        when(categoryService.delete(1)).thenReturn(1);
        mockMvc.perform(delete("/api/categories/1")
                .header("Authorization", adminToken))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void delete_shouldReturnError_whenCategoryDoesNotExist() throws Exception {
        when(categoryService.delete(100)).thenThrow(
                new ResponseStatusException(HttpStatus.NOT_FOUND));
        mockMvc.perform(delete("/api/categories/100")
                .header("Authorization", adminToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void delete_shouldReturnError() throws Exception {
        mockMvc.perform(delete("/api/categories/1")
                .header("Authorization", userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void delete_shouldReturnError_whenUserIsNotLogin() throws Exception {
        mockMvc.perform(delete("/api/categories/1")
                .header("Authorization", noUserToken))
                .andExpect(status().isUnauthorized());
    }
}