package org.example;

import java.util.List;

import org.example.daos.CollectionDao;
import org.example.daos.NoteDao;
import org.example.models.Collection;
import org.example.models.Note;
import org.example.services.CollectionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
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
class CollectionEndpointTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CollectionDao collectionDao;

    @MockBean
    private NoteDao noteDao;

    @MockBean
    private CollectionService collectionService;

    private String COLLECTION_NAME = "Read Later";
    private String NOTE_TITLE = "Create Database";
    private Collection collection;
    private Note note;

    private String adminToken;
    private String userToken;
    private String noUserToken;

    @BeforeEach
    void setUp() throws Exception {
        collection = new Collection();
        collection.setId(1);
        collection.setName(COLLECTION_NAME);
        collection.setDescription("");
        collection.setIsPublic(true);
        collection.setUsername("user2");

        note = new Note();
        note.setId(1);
        note.setTitle(NOTE_TITLE);
        note.setContent("");
        note.setIsPublic(true);
        note.setUsername("user2");
        note.setCategoryId(1);

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
        when(collectionService.getAll()).thenReturn(List.of());
        mockMvc.perform(get("/api/collections"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void getById_shouldReturnOk() throws Exception {
        when(collectionService.getById(1)).thenReturn(collection);
        mockMvc.perform(get("/api/collections/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value(COLLECTION_NAME))
                .andExpect(jsonPath("$.description").value(""))
                .andExpect(jsonPath("$.isPublic").value(true))
                .andExpect(jsonPath("$.username").value("user2"));
    }

    @Test
    void getById_shouldReturnNotFound_whenCollectionDoesNotExist() throws Exception {
        when(collectionService.getById(100)).thenThrow(
                new ResponseStatusException(HttpStatus.NOT_FOUND));
        mockMvc.perform(get("/api/collections/100"))
                .andExpect(status().isNotFound());
    }

    @Test
    void create_shouldReturnOk() throws Exception {
        when(collectionService.create(any(Collection.class))).thenReturn(collection);

        Collection newCollection = new Collection();
        newCollection.setId(2);
        newCollection.setName("new");
        newCollection.setDescription("description");
        newCollection.setIsPublic(false);
        newCollection.setUsername("user2");

        mockMvc.perform(post("/api/collections")
                .header("Authorization", userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newCollection)))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void update_shouldReturnOk_whenCollectionUserIsSameAsRequestUser() throws Exception {
        Collection updatedCollection = new Collection();
        updatedCollection.setId(1);
        updatedCollection.setName("updated");
        updatedCollection.setDescription("description");
        updatedCollection.setIsPublic(false);
        updatedCollection.setUsername("user2");

        when(collectionService.update(
                eq(1),
                any(Collection.class),
                any(Authentication.class))).thenReturn(updatedCollection);

        mockMvc.perform(put("/api/collections/1")
                .header("Authorization", userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedCollection)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("updated"))
                .andExpect(jsonPath("$.description").value("description"))
                .andExpect(jsonPath("$.isPublic").value(false))
                .andExpect(jsonPath("$.username").value("user2"));
    }

    @Test
    void update_shouldReturnOk_whenRequestUserIsAdmin() throws Exception {
        Collection updatedCollection = new Collection();
        updatedCollection.setId(1);
        updatedCollection.setName("updated");
        updatedCollection.setDescription("description");
        updatedCollection.setIsPublic(false);
        updatedCollection.setUsername("user2");

        when(collectionService.update(
                eq(1),
                any(Collection.class),
                any(Authentication.class))).thenReturn(updatedCollection);

        mockMvc.perform(put("/api/collections/1")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedCollection)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("updated"))
                .andExpect(jsonPath("$.description").value("description"))
                .andExpect(jsonPath("$.isPublic").value(false))
                .andExpect(jsonPath("$.username").value("user2"));
    }

    @Test
    void update_shouldReturnUnauthorized_whenUserIsNotLogin() throws Exception {
        Collection updatedCollection = new Collection();
        updatedCollection.setId(1);
        updatedCollection.setName("updated");
        updatedCollection.setDescription("description");
        updatedCollection.setIsPublic(false);
        updatedCollection.setUsername("user2");

        mockMvc.perform(put("/api/collections/1")
                .header("Authorization", noUserToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedCollection)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void delete_shouldReturnOk_whenCollectionUserIsSameAsRequestUser() throws Exception {
        when(collectionService.delete(eq(1), any(Authentication.class))).thenReturn(1);
        mockMvc.perform(delete("/api/collections/1")
                .header("Authorization", userToken))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void delete_shouldReturnOk_whenRequestUserIsAdmin() throws Exception {
        when(collectionService.delete(eq(1), any(Authentication.class))).thenReturn(1);
        mockMvc.perform(delete("/api/collections/1")
                .header("Authorization", adminToken))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void delete_shouldReturnUnauthorized_whenUserIsNotLogin() throws Exception {
        mockMvc.perform(delete("/api/collections/1")
                .header("Authorization", noUserToken))
                .andExpect(status().isUnauthorized());
    }

    // ======================
    // CollectionNote
    // ======================
    @Test
    void getAllNotes_shouldReturnOk() throws Exception {
        when(collectionService.getAllNotes(1)).thenReturn(List.of());
        mockMvc.perform(get("/api/collections/1/notes"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void addNoteToCollection_shouldReturnOk_whenCollectionUserIsSameAsRequestUser() throws Exception {
        when(collectionService.addNoteToCollection(
                eq(1), eq(1), any(Authentication.class))).thenReturn(List.of());
        mockMvc.perform(post("/api/collections/1/notes/1")
                .header("Authorization", userToken))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void addNoteToCollection_shouldReturnOk_whenCollectionUserIsAdmin() throws Exception {
        when(collectionService.addNoteToCollection(
                eq(1), eq(1), any(Authentication.class))).thenReturn(List.of());
        mockMvc.perform(post("/api/collections/1/notes/1")
                .header("Authorization", adminToken))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void addNoteToCollection_shouldReturnUnauthorized_whenUserIsNotLogin() throws Exception {
        mockMvc.perform(post("/api/collections/1/notes/1")
                .header("Authorization", noUserToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void removeNoteFromCollection_shouldReturnOk_whenCollectionUserIsSameAsRequestUser() throws Exception {
        when(collectionService.removeNoteFromCollection(
                eq(1), eq(1), any(Authentication.class))).thenReturn(1);
        mockMvc.perform(delete("/api/collections/1/notes/1")
                .header("Authorization", userToken))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void removeNoteFromCollection_shouldReturnOk_whenCollectionUserIsAdmin() throws Exception {
        when(collectionService.removeNoteFromCollection(
                eq(1), eq(1), any(Authentication.class))).thenReturn(1);
        mockMvc.perform(delete("/api/collections/1/notes/1")
                .header("Authorization", adminToken))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void removeNoteFromCollection_shouldReturnUnauthorized_whenUserIsNotLogin() throws Exception {
        mockMvc.perform(delete("/api/collections/1/notes/1")
                .header("Authorization", noUserToken))
                .andExpect(status().isUnauthorized());
    }
}