package org.example;

import java.util.List;
import org.example.models.Note;
import org.example.services.NoteService;
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
class NoteEndpointTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private NoteService noteService;

    private String adminToken;
    private String userToken;
    private String noUserToken;
    private Note note;
    private String NOTE_TITLE = "Create Database";

    @BeforeEach
    void setUp() throws Exception {
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
        when(noteService.getAll()).thenReturn(List.of());
        mockMvc.perform(get("/api/notes"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void getById_shouldReturnOk() throws Exception {
        when(noteService.getById(1)).thenReturn(note);
        mockMvc.perform(get("/api/notes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value(NOTE_TITLE))
                .andExpect(jsonPath("$.content").value(""))
                .andExpect(jsonPath("$.isPublic").value(true))
                .andExpect(jsonPath("$.username").value("user2"))
                .andExpect(jsonPath("$.categoryId").value(1));
    }

    @Test
    void getById_shouldReturnNotFound_whenNoteDoesNotExist() throws Exception {
        when(noteService.getById(100)).thenThrow(
                new ResponseStatusException(HttpStatus.NOT_FOUND));
        mockMvc.perform(get("/api/notes/100"))
                .andExpect(status().isNotFound());
    }

    @Test
    void create_shouldReturnOk() throws Exception {
        when(noteService.create(any(Note.class))).thenReturn(note);

        String requestBody = objectMapper.writeValueAsString(java.util.Map.of(
                "id", 1,
                "title", NOTE_TITLE,
                "content", "",
                "isPublic", true,
                "username", "user2",
                "categoryId", 1));
        mockMvc.perform(post("/api/notes")
                .header("Authorization", userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void update_shouldReturnOk_whenNoteUserIsSameAsRequestUser() throws Exception {
        Note updatedNote = new Note();
        updatedNote.setId(1);
        updatedNote.setTitle("React Router");
        updatedNote.setContent("");
        updatedNote.setIsPublic(false);
        updatedNote.setUsername("user2");
        updatedNote.setCategoryId(1);

        when(noteService.update(
                eq(1),
                any(Note.class),
                any(Authentication.class))).thenReturn(updatedNote);

        mockMvc.perform(put("/api/notes/1")
                .header("Authorization", userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedNote)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("React Router"))
                .andExpect(jsonPath("$.content").value(""))
                .andExpect(jsonPath("$.isPublic").value(false))
                .andExpect(jsonPath("$.username").value("user2"));
    }

    @Test
    void update_shouldReturnOk_whenRequestUserIsAdmin() throws Exception {
        Note updatedNote = new Note();
        updatedNote.setId(1);
        updatedNote.setTitle("React Router");
        updatedNote.setContent("");
        updatedNote.setIsPublic(false);
        updatedNote.setUsername("user2");
        updatedNote.setCategoryId(1);

        when(noteService.update(
                eq(1),
                any(Note.class),
                any(Authentication.class))).thenReturn(updatedNote);

        mockMvc.perform(put("/api/notes/1")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedNote)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("React Router"))
                .andExpect(jsonPath("$.content").value(""))
                .andExpect(jsonPath("$.isPublic").value(false))
                .andExpect(jsonPath("$.username").value("user2"));
    }

    @Test
    void update_shouldReturnUnauthorized_whenUserIsNotLogin() throws Exception {
        Note updatedNote = new Note();
        updatedNote.setId(1);
        updatedNote.setTitle("React Router");
        updatedNote.setContent("");
        updatedNote.setIsPublic(false);
        // updatedNote.setUsername("");
        updatedNote.setCategoryId(1);

        mockMvc.perform(put("/api/notes/1")
                .header("Authorization", noUserToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedNote)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void delete_shouldReturnOk_whenNoteUserIsSameAsRequestUser() throws Exception {
        when(noteService.delete(eq(1), any(Authentication.class))).thenReturn(1);
        mockMvc.perform(delete("/api/notes/1")
                .header("Authorization", userToken))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void delete_shouldReturnOk_whenRequestUserIsAdmin() throws Exception {
        when(noteService.delete(eq(1), any(Authentication.class))).thenReturn(1);
        mockMvc.perform(delete("/api/notes/1")
                .header("Authorization", adminToken))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void delete_shouldReturnUnauthorized_whenUserIsNotLogin() throws Exception {
        mockMvc.perform(delete("/api/notes/1")
                .header("Authorization", noUserToken))
                .andExpect(status().isUnauthorized());
    }
}