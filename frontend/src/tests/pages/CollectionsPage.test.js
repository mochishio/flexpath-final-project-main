import {jest, describe, test, expect, beforeEach,} from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";

const mockFetchJson = jest.fn();

jest.unstable_mockModule(
    "../../components/collection/CollectionCard",
    () => ({
        CollectionCard: ({ collection, notes }) =>
            React.createElement(
                "div",
                {
                    className: "mock-collection-card",
                    "data-id": collection.id,
                    "data-username": collection.username,
                    "data-note-count": notes.length,
                },
                collection.name
            ),
    })
);

jest.unstable_mockModule("../../services/fetch", () => ({
    fetchJson: mockFetchJson,
}));

jest.unstable_mockModule("../../context/AuthContext", () => ({
    useAuth: () => ({currentUser: { username: "user2" }}),
}));

const { default: CollectionsPage } = await import(
    "../../pages/CollectionsPage.jsx"
);

describe("CollectionsPage", () => {
    let renderer;

    const myCollections = [
        {
            id: 1,
            name: "My Best in 2026",
            description: "",
            username: "user2",
            isPublic: true,
            createdAt: "2026-10-01T10:00:00",
            updatedAt: "2026-10-01T10:00:00",
        },
        {
            id: 2,
            name: "Read Later",
            description: "",
            username: "user2",
            isPublic: false,
            createdAt: "2026-10-02T10:00:00",
            updatedAt: "2026-10-02T10:00:00",
        },
    ];

    const publicCollections = [
        {
            id: 1,
            name: "My Best in 2026",
            description: "",
            username: "user2",
            isPublic: true,
            createdAt: "2026-10-01T10:00:00",
            updatedAt: "2026-10-01T10:00:00",
        },
        {
            id: 3,
            name: "Java Notes",
            description: "Java programming",
            username: "user3",
            isPublic: true,
            createdAt: "2026-10-03T10:00:00",
            updatedAt: "2026-10-03T10:00:00",
        },
        {
            id: 4,
            name: "React Notes",
            description: "React components",
            username: "user4",
            isPublic: true,
            createdAt: "2026-10-04T10:00:00",
            updatedAt: "2026-10-04T10:00:00",
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        mockFetchJson.mockImplementation((url) => {
            if (url === "http://localhost:8080/api/collections/user/user2") {
                return Promise.resolve(myCollections);
            }
            if (url === "http://localhost:8080/api/collections/public") {
                return Promise.resolve(publicCollections);
            }
            if (url.endsWith("/notes")) {
                return Promise.resolve([{ id: 1, title: "Example Note" }]);
            }
        });
    });

    async function renderPage() {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(CollectionsPage)
            );
        });
        return renderer.root;
    }

    function getCards(root) {
        return root.findAllByProps({
            className: "mock-collection-card",
        });
    }

    function getCollectionNames(root) {
        return getCards(root).map((card) => card.children[0]);
    }

    function findButton(root, text) {
        return root.findAllByType("button").find(
            (button) => button.children.includes(text)
        );
    }

    async function changeInput(root, id, value) {
        await act(async () => {
            root.findByProps({ id }).props.onChange({
                target: { value },
            });
        });
    }

    test("should render collections page", async () => {
        const root = await renderPage();

        expect(root.findByProps({ id: "keyword" })).toBeDefined();
        expect(root.findByProps({ id: "sortBy" })).toBeDefined();
        expect(root.findByProps({ id: "username" })).toBeDefined();
        expect(findButton(root, "Search")).toBeDefined();
        expect(findButton(root, "Clear")).toBeDefined();

        const headings = root.findAllByType("h4").map(
            (element) => element.children[0]
        );

        expect(headings).toContain("My Collections");
        expect(headings).toContain("Public Collections");
    });

    test("should fetch collections and their notes", async () => {
        await renderPage();

        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/collections/user/user2"
        );
        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/collections/public"
        );
        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/collections/1/notes"
        );
        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/collections/2/notes"
        );
        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/collections/3/notes"
        );
        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/collections/4/notes"
        );
    });

    test("should display my and other public collections", async () => {
        const root = await renderPage();
        const names = getCollectionNames(root);

        expect(names).toContain("Read Later");
        expect(names).toContain("My Best in 2026");
        expect(names).toContain("Java Notes");
        expect(names).toContain("React Notes");
        expect(getCards(root)).toHaveLength(4);
    });

    test("should exclude my collections from public section", async () => {
        const root = await renderPage();
        const cards = getCards(root);
        const frontendCards = cards.filter(
            (card) => card.children[0] === "Read Later"
        );
        expect(frontendCards).toHaveLength(1);
    });

    test("should pass notes to collection cards", async () => {
        const root = await renderPage();
        const cards = getCards(root);
        for (const card of cards) {
            expect(card.props["data-note-count"]).toBe(1);
        }
    });

    test("should filter collections by keyword", async () => {
        const root = await renderPage();
        await changeInput(root, "keyword", "Java");
        await act(async () => {findButton(root, "Search").props.onClick()});
        expect(getCollectionNames(root)).toEqual(["Java Notes"]);
    });

    test("should filter public collections by username", async () => {
        const root = await renderPage();
        await changeInput(root, "username", "user3");
        await act(async () => {
            findButton(root, "Search").props.onClick();
        });
        const names = getCollectionNames(root);

        expect(names).toContain("Read Later");
        expect(names).toContain("My Best in 2026");
        expect(names).toContain("Java Notes");
        expect(names).not.toContain("React Notes");
        expect(getCards(root)).toHaveLength(3);
    });

    test("should sort collections by name", async () => {
        const root = await renderPage();
        await changeInput(root, "sortBy", "name");
        await act(async () => {findButton(root, "Search").props.onClick()});
        expect(getCollectionNames(root)).toEqual([
            "Read Later",
            "My Best in 2026",
            "React Notes",
            "Java Notes",
        ]);
    });

    test("should reverse sort direction", async () => {
        const root = await renderPage();
        const sortButton = root.findByProps({
            title: "Descending",
        });
        await act(async () => {sortButton.props.onClick()});

        expect(root.findByProps({ title: "Ascending" })).toBeDefined();
        expect(getCollectionNames(root)).toEqual([
            "My Best in 2026",
            "Read Later",
            "Java Notes",
            "React Notes",
        ]);
    });

    test("should clear search filters", async () => {
        const root = await renderPage();
        await changeInput(root, "keyword", "Java");
        await act(async () => {
            findButton(root, "Search").props.onClick();
        });

        expect(getCollectionNames(root)).toEqual(["Java Notes"]);

        await act(async () => {
            findButton(root, "Clear").props.onClick();
        });

        expect(root.findByProps({ id: "keyword" }).props.value).toBe("");
        expect(root.findByProps({ id: "username" }).props.value).toBe("");
        expect(root.findByProps({ id: "sortBy" }).props.value).toBe("updated");
        expect(getCards(root)).toHaveLength(4);
    });

    test("should display error when API fails", async () => {
        mockFetchJson.mockRejectedValue(
            new Error("Failed to load collections")
        );
        const root = await renderPage();
        const errorMessage = root.findByProps({
            className: "alert alert-danger",
        });
        expect(errorMessage.children).toContain(
            "Failed to load collections"
        );
    });
});
