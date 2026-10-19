import {jest, describe, test, expect, beforeEach, afterEach} from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";

const mockFetchJson = jest.fn();
const mockNavigate = jest.fn();
const mockHandleApiError = jest.fn();

jest.unstable_mockModule(
    "../../components/category/CategoryForm",
    () => ({
        CategoryForm: ({ category, show, onSave, onClose }) =>
            React.createElement("div", {
                id: "mock-category-form",
                category,
                show,
                onSave,
                onClose,
            }),
    })
);

jest.unstable_mockModule(
    "../../components/collection/CollectionForm",
    () => ({
        CollectionForm: ({ collection, show, onSave, onClose }) =>
            React.createElement("div", {
                id: "mock-collection-form",
                collection,
                show,
                onSave,
                onClose,
            }),
    })
);

jest.unstable_mockModule(
    "../../services/fetch",
    () => ({fetchJson: mockFetchJson})
);

jest.unstable_mockModule(
    "../../services/handleApiError",
    () => ({handleApiError: mockHandleApiError})
);

jest.unstable_mockModule(
    "../../context/AuthContext",
    () => ({
        useAuth: () => ({currentUser: { username: "admin" }}),
    })
);

jest.unstable_mockModule(
    "react-router-dom",
    () => ({useNavigate: () => mockNavigate})
);

const { AdminTable } = await import(
    "../../components/admin/AdminTable.jsx"
);

describe("AdminTable", () => {
    let renderer;

    const notes = [
        {
            id: 1,
            title: "CSS",
            username: "user2",
            isPublic: true,
            createdAt: "2026-10-01T10:00:00",
            updatedAt: "2026-10-01T10:00:00",
        },
        {
            id: 2,
            title: "Java",
            username: "user3",
            isPublic: false,
            createdAt: "2026-10-02T10:00:00",
            updatedAt: "2026-10-02T10:00:00",
        },
    ];

    const categories = [
        {
            id: 1,
            name: "Read Later",
            createdAt: "2026-10-01T10:00:00",
            updatedAt: "2026-10-01T10:00:00",
        },
        {
            id: 2,
            name: "My Best in 2026",
            createdAt: "2026-10-02T10:00:00",
            updatedAt: "2026-10-02T10:00:00",
        },
    ];

    const collections = [
        {
            id: 1,
            name: "HTML",
            username: "user2",
            isPublic: true,
            createdAt: "2026-10-01T10:00:00",
            updatedAt: "2026-10-01T10:00:00",
        },
    ];

    const columns = {
        notes: ["id", "title", "username"],
        categories: ["id", "name"],
        collections: ["id", "name", "username"],
    };

    beforeEach(() => {
        jest.clearAllMocks();

        globalThis.window = {
            confirm: jest.fn(() => true),
        };

        mockFetchJson.mockImplementation((url) => {
            if (url === "http://localhost:8080/api/notes") {
                return Promise.resolve(notes);
            }
            if (url === "http://localhost:8080/api/categories") {
                return Promise.resolve(categories);
            }
            if (url === "http://localhost:8080/api/collections") {
                return Promise.resolve(collections);
            }
        });
    });

    afterEach(() => {
        if (renderer) {
            act(() => renderer.unmount());
            renderer = null;
        }
    });

    async function renderTable(sectionName = "notes") {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(AdminTable, {
                    sectionName,
                    columns: columns[sectionName],
                })
            );
        });
        return renderer.root;
    }

    function findButton(root, text) {
        return root.findAllByType("button").find(
            (button) => button.children.includes(text)
        );
    }

    function getCheckboxes(root) {
        return root.findAllByType("input").filter(
            (input) => input.props.type === "checkbox"
        );
    }

    async function selectRecord(root, index = 0) {
        await act(async () => {
            getCheckboxes(root)[index].props.onChange();
        });
    }
    test("should fetch notes", async () => {
        const root = await renderTable("notes");
        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/notes"
        );
        expect(root.findAllByType("tbody")[0]
            .findAllByType("tr")).toHaveLength(2);
    });

    test("should fetch categories", async () => {
        const root = await renderTable("categories");
        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/categories"
        );
        expect(root.findAllByType("tbody")[0]
            .findAllByType("tr")).toHaveLength(2);
    });

    test("should disable edit and delete without selection", async () => {
        const root = await renderTable();
        expect(findButton(root, "Edit").props.disabled).toBe(true);
        expect(
            findButton(root, "Delete Selected").props.disabled
        ).toBe(true);
    });

    test("should enable edit and delete after selecting one record", async () => {
        const root = await renderTable();
        await selectRecord(root);
        expect(findButton(root, "Edit").props.disabled).toBe(false);
        expect(
            findButton(root, "Delete Selected").props.disabled
        ).toBe(false);
    });

    test("should disable edit when two records are selected", async () => {
        const root = await renderTable();
        await selectRecord(root, 0);
        await selectRecord(root, 1);
        expect(findButton(root, "Edit").props.disabled).toBe(true);
        expect(
            findButton(root, "Delete Selected").props.disabled
        ).toBe(false);
    });

    test("should navigate to create note page", async () => {
        const root = await renderTable("notes");
        await act(async () => {
            findButton(root, "Note").props.onClick();
        });
        expect(mockNavigate).toHaveBeenCalledWith(
            "/notes/new"
        );
    });

    test("should navigate to edit note page", async () => {
        const root = await renderTable("notes");
        await selectRecord(root);
        await act(async () => {
            findButton(root, "Edit").props.onClick();
        });
        expect(mockNavigate).toHaveBeenCalledWith(
            "/notes/1/edit"
        );
    });

    test("should open create category modal", async () => {
        const root = await renderTable("categories");
        await act(async () => {
            findButton(root, "Category").props.onClick();
        });
        const form = root.findByProps({
            id: "mock-category-form",
        });
        expect(form.props.show).toBe(true);
        expect(form.props.category).toBe(null);
    });

    test("should create category successfully", async () => {
        const root = await renderTable("categories");
        await act(async () => {
            findButton(root, "Category").props.onClick();
        });
        const savedCategory = {id: 3, name: "Java"};

        mockFetchJson.mockResolvedValueOnce(savedCategory);

        await act(async () => {
            await root.findByProps({id: "mock-category-form"})
                .props.onSave({name: "Java"});
        });

        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/categories",
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    name: "Java",
                    username: "admin",
                }),
            }
        );

        expect(root.findAllByType("tbody")[0]
            .findAllByType("tr")).toHaveLength(3);
        expect(root.findByProps({id: "mock-category-form"}).props.show).toBe(false);
    });

    test("should edit category successfully", async () => {
        const root = await renderTable("categories");
        await selectRecord(root);
        await act(async () => {
            findButton(root, "Edit").props.onClick();
        });
        expect(root.findByProps({id: "mock-category-form"}).props.category.id).toBe(1);

        mockFetchJson.mockResolvedValueOnce({
            id: 1,
            name: "Updated Read Later",
        });

        await act(async () => {
            await root.findByProps({id: "mock-category-form"})
                .props.onSave({name: "Updated Read Later"});
        });

        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/categories/1",
            {
                method: "PUT",
                headers: {"Content-Type": "application/json",},
                body: JSON.stringify({
                    name: "Updated Read Later",
                }),
            }
        );
    });

    test("should create collection successfully", async () => {
        const root = await renderTable("collections");
        await act(async () => {
            findButton(root, "Collection").props.onClick();
        });
        expect(root.findByProps({id: "mock-collection-form"}).props.show).toBe(true);

        mockFetchJson.mockResolvedValueOnce({
            id: 2,
            name: "React",
            username: "admin",
        });

        await act(async () => {
            await root.findByProps({id: "mock-collection-form"}).props.onSave({
                name: "React",
                isPublic: true,
            });
        });

        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/collections",
            {
                method: "POST",
                headers: {"Content-Type": "application/json",},
                body: JSON.stringify({
                    name: "React",
                    isPublic: true,
                    username: "admin",
                }),
            }
        );
        expect(root.findAllByType("tbody")[0]
            .findAllByType("tr")).toHaveLength(2);
    });

    test("should delete selected record", async () => {
        const root = await renderTable("notes");
        await selectRecord(root);
        mockFetchJson.mockResolvedValueOnce(undefined);
        await act(async () => {
            await findButton(root, "Delete Selected").props.onClick();
        });

        expect(window.confirm).toHaveBeenCalledWith(
            "Are you sure you want to delete 1 record(s)?"
        );
        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/notes/1",
            { method: "DELETE" }
        );
        expect(root.findAllByType("tbody")[0]
            .findAllByType("tr")).toHaveLength(1);
    });

    test("should not delete when confirmation is canceled", async () => {
        window.confirm.mockReturnValue(false);
        const root = await renderTable("notes");
        await selectRecord(root);
        await act(async () => {
            await findButton(
                root,
                "Delete Selected"
            ).props.onClick();
        });
        expect(mockFetchJson).not.toHaveBeenCalledWith(
            "http://localhost:8080/api/notes/1",
            { method: "DELETE" }
        );
        expect(root.findAllByType("tbody")[0]
            .findAllByType("tr")).toHaveLength(2);
    });

    test("should display error when fetching fails", async () => {
        mockFetchJson.mockRejectedValue(
            new Error("Failed to load records")
        );
        const root = await renderTable();
        const errorMessage = root.findByProps({
            className: "alert alert-danger",
        });
        expect(errorMessage.children).toContain(
            "Failed to load records"
        );
    });

    test("should call error handler when saving fails", async () => {
        const root = await renderTable("categories");
        await act(async () => {
            findButton(root, "Category").props.onClick();
        });
        mockFetchJson.mockRejectedValueOnce(
            new Error("Failed to save category")
        );
        await act(async () => {
            await root.findByProps({id: "mock-category-form"})
                .props.onSave({name: "Java"});
        });
        expect(mockHandleApiError).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Failed to save category",
            }),
            mockNavigate,
            expect.any(Function)
        );
    });
});
