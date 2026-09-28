package org.example.daos;

import org.example.mappers.CollectionRowMapper;
import org.example.mappers.NoteRowMapper;
import org.example.models.Collection;
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
public class CollectionDao implements Dao<Collection> {

    private final JdbcTemplate jdbcTemplate;
    private final NoteRowMapper noteRowMapper = new NoteRowMapper();
    private final CollectionRowMapper collectionRowMapper = new CollectionRowMapper();

    public CollectionDao(DataSource dataSource) {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

    @Override
    public List<Collection> getAll() {
        String sql = "SELECT * FROM collections";

        return jdbcTemplate.query(
                sql,
                collectionRowMapper);
    }

    @Override
    public Optional<Collection> getById(int id) {
        String sql = "SELECT * FROM collections WHERE ID = ?";

        try {
            Collection collection = jdbcTemplate.queryForObject(
                    sql,
                    collectionRowMapper,
                    id);

            return Optional.ofNullable(collection);

        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<Collection> getByUsername(String username) {
        String sql = "SELECT * FROM collections WHERE username = ?";

        return jdbcTemplate.query(
                sql,
                collectionRowMapper,
                username);
    }

    public List<Collection> getPublicCollections() {
        String sql = "SELECT * FROM collections WHERE is_public = true";
        return jdbcTemplate.query(
                sql,
                collectionRowMapper);
    }

    @Override
    public Collection create(Collection collection) {
        String sql = "INSERT INTO collections (name, description, is_public, username) VALUES (?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    sql,
                    Statement.RETURN_GENERATED_KEYS);

            ps.setString(1, collection.getName());
            ps.setString(2, collection.getDescription());
            ps.setBoolean(3, collection.getIsPublic());
            ps.setString(4, collection.getUsername());

            return ps;
        }, keyHolder);

        if (keyHolder.getKey() == null) {
            throw new IllegalStateException(
                    "Failed to retrieve generated collection ID");
        }

        int id = keyHolder.getKey().intValue();

        return getById(id)
                .orElseThrow(() -> new IllegalStateException(
                        "Created collection could not be retrieved"));
    }

    @Override
    public Collection update(int id, Collection collection) {
        String sql = "UPDATE collections SET name = ?, description = ?, is_public = ? WHERE ID = ?";

        jdbcTemplate.update(
                sql,
                collection.getName(),
                collection.getDescription(),
                collection.getIsPublic(),
                id);

        return getById(id)
                .orElseThrow(() -> new IllegalStateException(
                        "Updated collection could not be retrieved"));
    }

    @Override
    public int delete(int id) {
        String sql = "DELETE FROM collections WHERE ID = ?";

        return jdbcTemplate.update(sql, id);
    }

    // ======================
    // CollectionNote
    // ======================
    public boolean existsNoteInCollection(int collectionId, int noteId) {
        String sql = """
                SELECT COUNT(*) FROM collection_notes WHERE collection_id = ? AND note_id = ?
                """;
        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                collectionId,
                noteId);
        return count != null && count > 0;
    }

    public List<Note> getAllNotes(int collectionId) {
        String sql = """
                SELECT n.* FROM notes n JOIN collection_notes cn ON n.id = cn.note_id WHERE cn.collection_id = ?
                """;
        return jdbcTemplate.query(
                sql,
                noteRowMapper,
                collectionId);
    }

    public List<Note> addNoteToCollection(int collectionId, int noteId) {
        String sql = "INSERT INTO collection_notes (collection_id, note_id) VALUES (?, ?)";
        jdbcTemplate.update(sql, collectionId, noteId);
        return getAllNotes(collectionId);
    }

    public int removeNoteFromCollection(int collectionId, int noteId) {
        String sql = "DELETE FROM collection_notes WHERE collection_id = ? AND note_id = ?";
        return jdbcTemplate.update(sql, collectionId, noteId);
    }
}