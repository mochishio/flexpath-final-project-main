import {jest, describe, test, expect, beforeEach,} from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";

const mockFetchJson = jest.fn();
const mockHandleApiError = jest.fn();

let mockCurrentUser = {
    username: "user2",
};

jest.unstable_mockModule(
    "../../services/fetch",
    () => ({fetchJson: mockFetchJson})
);

jest.unstable_mockModule(
    "../../services/handleApiError",
    () => ({
        handleApiError: mockHandleApiError,
    })
);

jest.unstable_mockModule(
    "../../context/AuthContext",
    () => ({
        useAuth: () => ({currentUser: mockCurrentUser}),
    })
);

jest.unstable_mockModule(
    "react-router-dom",
    () => ({
        Link: ({ to, children, ...props }) =>
            React.createElement("a", { href: to, ...props }, children),
    })
);

// CollectionForm
jest.unstable_mockModule(
    "../../components/collection/CollectionForm",
    () => ({
        CollectionForm: ({
            collection,
            show,
            onSave,
            onDelete,
            onClose,
            error,
        }) =>
            React.createElement("div", {
                id: "mock-collection-form",
                collection,
                show,
                onSave,
                onDelete,
                onClose,
                error,
            }),
    })
);

const { CollectionCard } = await import(
    "../../components/collection/CollectionCard.jsx"
);

describe("CollectionCard", () => {
    let renderer;

    const collection = {
        id: 1,
        name: "Frontend",
        description: "HTML and CSS notes",
        username: "user2",
        isPublic: true,
        updatedAt: "2026-10-01T10:00:00",
    };

    const notes = [
        {
            id: 1,
            title: "HTML Basics",
            username: "user2",
            isPublic: true,
        },
        {
            id: 2,
            title: "CSS Basics",
            username: "user3",
            isPublic: false,
        },
    ];

    let mockOnNoteRemoved;
    let mockOnCollectionUpdated;
    let mockOnCollectionDeleted;

    beforeEach(() => {
        jest.clearAllMocks();

        mockCurrentUser = {username: "user2"};
        mockOnNoteRemoved = jest.fn();
        mockOnCollectionUpdated = jest.fn();
        mockOnCollectionDeleted = jest.fn();

        globalThis.window = {
            confirm: jest.fn(() => true),
        };

        mockFetchJson.mockResolvedValue({});
    });

    async function renderCard() {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(CollectionCard, {
                    collection,
                    notes,
                    onNoteRemoved: mockOnNoteRemoved,
                    onCollectionUpdated: mockOnCollectionUpdated,
                    onCollectionDeleted: mockOnCollectionDeleted,
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

    function getForm(root) {
        return root.findByProps({
            id: "mock-collection-form",
        });
    }

    test("should render collection details", async () => {
        const root = await renderCard();
        expect(root.findByType("h5")).toBeDefined();
        const description = root.findByProps({
            className: "description mb-2",
        });
        expect(description.children).toContain(
            "HTML and CSS notes"
        );
    });

    test("should render notes and view links", async () => {
        const root = await renderCard();
        const links = root.findAllByType("a");
        expect(links).toHaveLength(2);
        expect(links[0].props.href).toBe("/notes/1");
        expect(links[1].props.href).toBe("/notes/2");
        expect(
            root.findByProps({title: "HTML Basics"})
        ).toBeDefined();
        expect(
            root.findByProps({title: "CSS Basics"})
        ).toBeDefined();
    });

    test("should show edit and remove buttons for owner", async () => {
        const root = await renderCard();
        expect(findButton(root, "Edit")).toBeDefined();
        const removeButtons = root.findAllByType("button").filter(
            (button) => button.children.includes("Remove")
        );
        expect(removeButtons).toHaveLength(2);
    });

    test("should hide edit and remove buttons for non-owner", async () => {
        mockCurrentUser = {username: "user3"};
        const root = await renderCard();
        expect(findButton(root, "Edit")).toBeUndefined();
        expect(findButton(root, "Remove")).toBeUndefined();
        expect(root.findAllByType("a")).toHaveLength(2);
    });

    test("should open edit collection modal", async () => {
        const root = await renderCard();
        await act(async () => {
            findButton(root, "Edit").props.onClick();
        });
        expect(getForm(root).props.show).toBe(true);
        expect(getForm(root).props.collection).toEqual(
            collection
        );
    });

    test("should update collection successfully", async () => {
        const root = await renderCard();
        await act(async () => {
            findButton(root, "Edit").props.onClick();
        });
        const updatedCollection = {
            ...collection,
            name: "Updated Frontend",
        };
        mockFetchJson.mockResolvedValueOnce(updatedCollection);

        await act(async () => {
            await getForm(root).props.onSave({
                name: "Updated Frontend",
                description: "HTML and CSS notes",
                isPublic: true,
            });
        });

        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/collections/1",
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: "Updated Frontend",
                    description: "HTML and CSS notes",
                    isPublic: true,
                }),
            }
        );
        expect(mockOnCollectionUpdated).toHaveBeenCalledWith(
            updatedCollection
        );
        expect(getForm(root).props.show).toBe(false);
    });

    test("should remove note from collection", async () => {
        const root = await renderCard();
        await act(async () => {
            findButton(root, "Remove").props.onClick();
        });

        expect(window.confirm).toHaveBeenCalledWith(
            "Are you sure you want to remove this note from the collection?"
        );
        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/collections/1/notes/1",
            { method: "DELETE" }
        );
        expect(mockOnNoteRemoved).toHaveBeenCalledWith(1, 1);
    });

    test("should not remove note when canceled", async () => {
        window.confirm.mockReturnValue(false);
        const root = await renderCard();
        await act(async () => {
            findButton(root, "Remove").props.onClick();
        });
        expect(mockFetchJson).not.toHaveBeenCalled();
        expect(mockOnNoteRemoved).not.toHaveBeenCalled();
    });

    test("should delete collection successfully", async () => {
        const root = await renderCard();
        await act(async () => {
            findButton(root, "Edit").props.onClick();
        });
        await act(async () => {
            await getForm(root).props.onDelete();
        });
        expect(window.confirm).toHaveBeenCalledWith(
            "Are you sure you want to delete this collection?"
        );
        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/collections/1",
            { method: "DELETE" }
        );
        expect(mockOnCollectionDeleted).toHaveBeenCalledWith(1);
        expect(getForm(root).props.show).toBe(false);
    });

    test("should not delete collection when canceled", async () => {
        window.confirm.mockReturnValue(false);
        const root = await renderCard();
        await act(async () => {
            findButton(root, "Edit").props.onClick();
        });
        await act(async () => {
            await getForm(root).props.onDelete();
        });
        expect(mockFetchJson).not.toHaveBeenCalled();
        expect(mockOnCollectionDeleted).not.toHaveBeenCalled();
    });
});
