package org.example.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.example.models.Note;
import org.springframework.jdbc.core.RowMapper;

public class NoteRowMapper implements RowMapper<Note> {

    @Override
    public Note mapRow(ResultSet rset, int rowNum) throws SQLException {
        Note note = new Note();
        note.setId(rset.getInt("ID"));
        note.setCreatedAt(
                rset.getTimestamp("CREATED_AT").toLocalDateTime());
        note.setUpdatedAt(
                rset.getTimestamp("UPDATED_AT").toLocalDateTime());
        note.setTitle(rset.getString("TITLE"));
        note.setContent(rset.getString("CONTENT"));
        note.setIsPublic(rset.getBoolean("IS_PUBLIC"));
        note.setUsername(rset.getString("USERNAME"));
        note.setCategoryId(rset.getInt("CATEGORY_ID"));
        return note;
    }
}