package org.example.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.example.models.Collection;
import org.springframework.jdbc.core.RowMapper;

public class CollectionRowMapper implements RowMapper<Collection> {

    @Override
    public Collection mapRow(ResultSet rset, int rowNum) throws SQLException {
        Collection collection = new Collection();
        collection.setId(rset.getInt("ID"));
        collection.setCreatedAt(
                rset.getTimestamp("CREATED_AT").toLocalDateTime());
        collection.setUpdatedAt(
                rset.getTimestamp("UPDATED_AT").toLocalDateTime());
        collection.setName(rset.getString("NAME"));
        collection.setDescription(rset.getString("DESCRIPTION"));
        collection.setIsPublic(rset.getBoolean("IS_PUBLIC"));
        collection.setUsername(rset.getString("USERNAME"));
        return collection;
    }
}