package org.example.daos;

import java.util.List;
import java.util.Optional;

public interface Dao<T> {
    List<T> getAll();

    Optional<T> getById(int id);

    T create(T t);

    T update(int id, T t);

    int delete(int id);
}
