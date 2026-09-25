package org.example.daos;

import org.example.models.Collection;
import org.example.mappers.CollectionRowMapper;
import org.example.mappers.NoteRowMapper;
import org.example.models.Note;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Component
public class NoteDao implements Dao<Note> {

    private final JdbcTemplate jdbcTemplate;
    private final NoteRowMapper noteRowMapper = new NoteRowMapper();
    private final CollectionRowMapper collectionRowMapper = new CollectionRowMapper();

    public NoteDao(DataSource dataSource) {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

    @Override
    public List<Note> getAll() {
        String sql = "SELECT * FROM notes";

        return jdbcTemplate.query(
                sql,
                noteRowMapper);
    }

    @Override
    public Optional<Note> getById(int id) {
        String sql = "SELECT * FROM notes WHERE ID = ?";

        try {
            Note note = jdbcTemplate.queryForObject(
                    sql,
                    noteRowMapper,
                    id);

            return Optional.ofNullable(note);

        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<Collection> getCollections(int id) {
        String sql = """
                SELECT c.* FROM collections c JOIN collection_notes cn ON c.id = cn.collection_id WHERE cn.note_id = ?
                """;
        return jdbcTemplate.query(
                sql,
                collectionRowMapper,
                id);
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
            ps.setObject(5, note.getCategoryId());

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