package org.example.daos;

import org.example.models.Category;
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
public class CategoryDao implements Dao<Category> {

    private final JdbcTemplate jdbcTemplate;

    public CategoryDao(DataSource dataSource) {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

    private Category mapCategory(ResultSet rset) throws SQLException {
        Category category = new Category();
        category.setId(rset.getInt("ID"));
        category.setName(rset.getString("NAME"));
        category.setCreatedAt(
                rset.getTimestamp("CREATED_AT").toLocalDateTime());
        category.setUpdatedAt(
                rset.getTimestamp("UPDATED_AT").toLocalDateTime());
        return category;
    }

    @Override
    public List<Category> getAll() {
        String sql = "SELECT * FROM categories";

        return jdbcTemplate.query(
                sql,
                (rset, rowNum) -> mapCategory(rset));
    }

    @Override
    public Optional<Category> getById(int id) {
        String sql = "SELECT * FROM categories WHERE ID = ?";

        try {
            Category category = jdbcTemplate.queryForObject(
                    sql,
                    (rset, rowNum) -> mapCategory(rset),
                    id);

            return Optional.ofNullable(category);

        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<Category> getByName(String name) {
        String sql = "SELECT * FROM categories WHERE name = ?";

        try {
            Category category = jdbcTemplate.queryForObject(
                    sql,
                    (rset, rowNum) -> mapCategory(rset),
                    name);

            return Optional.ofNullable(category);

        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Category create(Category category) {
        String sql = "INSERT INTO categories (NAME) VALUES (?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    sql,
                    Statement.RETURN_GENERATED_KEYS);

            ps.setString(1, category.getName());

            return ps;
        }, keyHolder);

        if (keyHolder.getKey() == null) {
            throw new IllegalStateException(
                    "Failed to retrieve generated category ID");
        }

        int id = keyHolder.getKey().intValue();

        return getById(id)
                .orElseThrow(() -> new IllegalStateException(
                        "Created category could not be retrieved"));
    }

    @Override
    public Category update(int id, Category category) {
        String sql = "UPDATE categories SET NAME = ? WHERE ID = ?";

        jdbcTemplate.update(
                sql,
                category.getName(),
                id);

        return getById(id)
                .orElseThrow(() -> new IllegalStateException(
                        "Updated category could not be retrieved"));
    }

    @Override
    public int delete(int id) {
        String sql = "DELETE FROM categories WHERE ID = ?";

        return jdbcTemplate.update(sql, id);
    }
}