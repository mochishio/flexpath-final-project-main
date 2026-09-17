package org.example.daos;

import org.example.models.Note;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Component
public class NoteDao implements Dao<Note> {

    private final JdbcTemplate jdbcTemplate;

    public NoteDao(DataSource dataSource) {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

    private Note mapNote(ResultSet rset) throws SQLException {
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

    @Override
    public List<Note> getAll() {
        String sql = "SELECT * FROM notes";

        return jdbcTemplate.query(
                sql,
                (rset, rowNum) -> mapNote(rset));
    }

    @Override
    public Optional<Note> getById(int id) {
        String sql = "SELECT * FROM notes WHERE ID = ?";

        try {
            Note note = jdbcTemplate.queryForObject(
                    sql,
                    (rset, rowNum) -> mapNote(rset),
                    id);

            return Optional.ofNullable(note);

        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Note create(Note note) {
        String sql = "INSERT INTO notes (title, content, is_public, username, category_id) VALUES (?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    sql,
                    Statement.RETURN_GENERATED_KEYS);

            ps.setString(1, note.getTitle());
            ps.setString(2, note.getContent());
            ps.setBoolean(3, note.getIsPublic());
            ps.setString(4, note.getUsername());
            ps.setInt(5, note.getCategoryId());

            return ps;
        }, keyHolder);

        if (keyHolder.getKey() == null) {
            throw new IllegalStateException(
                    "Failed to retrieve generated note ID");
        }

        int id = keyHolder.getKey().intValue();

        return getById(id)
                .orElseThrow(() -> new IllegalStateException(
                        "Created note could not be retrieved"));
    }

    @Override
    public Note update(int id, Note note) {
        String sql = """
                UPDATE notes
                SET title = ?, content = ?, is_public = ?, category_id = ?
                WHERE id = ?
                """;

        jdbcTemplate.update(
                sql,
                note.getTitle(),
                note.getContent(),
                note.getIsPublic(),
                note.getCategoryId(),
                id);

        return getById(id)
                .orElseThrow(() -> new IllegalStateException(
                        "Updated note could not be retrieved"));
    }

    @Override
    public int delete(int id) {
        String sql = "DELETE FROM notes WHERE ID = ?";

        return jdbcTemplate.update(sql, id);
    }
}