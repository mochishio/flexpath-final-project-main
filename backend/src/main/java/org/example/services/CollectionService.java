package org.example.services;

import org.example.daos.CollectionDao;
import org.example.models.Collection;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CollectionService {

    private final CollectionDao collectionDao;

    private void validateName(Collection collection) {
        if (collection.getName() == null || collection.getName().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Name is required");
        }
    }

    private void validateUsername(Collection collection) {
        if (collection.getUsername() == null || collection.getUsername().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Username is required");
        }
    }

    public CollectionService(CollectionDao collectionDao) {
        this.collectionDao = collectionDao;
    }

    /**
     * Gets all collections.
     *
     * @return A list of all collections.
     */
    public List<Collection> getAll() {
        return collectionDao.getAll();
    }

    /**
     * Gets a collection by id.
     *
     * @param id The id of the collection.
     * @return The collection.
     */
    public Collection getById(int id) {
        return collectionDao.getById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Collection not found"));
    }

    /**
     * Creates a new collection.
     *
     * @param collection The collection to create.
     * @return The created collection.
     */
    public Collection create(Collection collection) {
        validateName(collection);
        validateUsername(collection);
        return collectionDao.create(collection);
    }

    /**
     * Updates a collection.
     *
     * @param id         The id of the collection.
     * @param collection The new collection information.
     * @return The updated collection.
     */
    public Collection update(int id, Collection collection) {
        getById(id);
        validateName(collection);
        return collectionDao.update(id, collection);
    }

    /**
     * Deletes a collection.
     *
     * @param id The id of the collection.
     * @return The number of deleted rows.
     */
    public int delete(int id) {
        int rows = collectionDao.delete(id);

        if (rows == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Collection not found");
        }

        return rows;
    }
}