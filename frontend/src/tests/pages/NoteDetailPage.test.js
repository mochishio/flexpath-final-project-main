
import {jest, describe, test, expect, beforeEach} from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";

const mockFetchJson = jest.fn();
const mockNavigate = jest.fn();
const mockUseParams = jest.fn();

let mockCurrentUser = { username: "user2" };

jest.unstable_mockModule("../../services/fetch", () => ({
    fetchJson: mockFetchJson,
}));

jest.unstable_mockModule("../../context/AuthContext", () => ({
    useAuth: () => ({currentUser: mockCurrentUser}),
}));

jest.unstable_mockModule("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
    useParams: mockUseParams,
    Link: ({ to, children, ...props }) =>
        React.createElement("a", { href: to, ...props }, children),
}));

jest.unstable_mockModule(
    "../../components/collection/CollectionForm",
    () => ({
        CollectionForm: ({ show }) => show
            ? React.createElement("div", {id: "newCollectionModal"})
            : null,
    })
);

const { default: NoteDetailPage } = await import(
    "../../pages/NoteDetailPage.jsx"
);

describe("NoteDetailPage", () => {
    let renderer;

    const note = {
        id: 1,
        title: "CSS",
        content: "CSS note content",
        isPublic: true,
        username: "user2",
        categoryId: 1,
        createdAt: "2026-10-01T20:00:00",
        updatedAt: "2026-10-02T20:00:00",
    };
    const category = {id: 1, name: "CSS"};
    const collections = [
        { id: 1, name: "My Best 2026", isPublic: true },
        { id: 2, name: "Read Later", isPublic: false },
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        mockCurrentUser = { username: "user2" };
        mockUseParams.mockReturnValue({ id: "1" });

        globalThis.window = {confirm: jest.fn(() => true)};

        mockFetchJson.mockImplementation((url) => {
            if (url === "http://localhost:8080/api/notes/1") {
                return Promise.resolve(note);
            }
            if (url === "http://localhost:8080/api/categories/1") {
                return Promise.resolve(category);
            }
            if (
                url === "http://localhost:8080/api/collections/user/user2"
            ) {
                return Promise.resolve(collections);
            }
            if (
                url === "http://localhost:8080/api/notes/1/collections"
            ) {
                return Promise.resolve([]);
            }
        });
    });

    async function renderPage() {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(NoteDetailPage)
            );
        });
        return renderer.root;
    }

    function findButton(root, text) {
        return root.findAllByType("button").find(
            (button) => button.children.includes(text)
        );
    }

    test("should render note details", async () => {
        const root = await renderPage();

        expect(root.findByType("h2")).toBeDefined();
        expect(root.findByType("h5").children).toContain("Content");
        expect(root.findAllByType("p").some((element) =>
            element.children.includes("CSS note content")
        )).toBe(true);
        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/notes/1"
        );
        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/categories/1"
        );
    });

    test("should show edit and delete for owner", async () => {
        const root = await renderPage();
        const editLink = root.findAllByType("a").find(
            (link) => link.children.includes("Edit")
        );
        expect(editLink).toBeDefined();
        expect(editLink.props.href).toBe("/notes/1/edit");
        expect(findButton(root, "Delete")).toBeDefined();
    });

    test("should hide edit and delete for non-owner", async () => {
        mockCurrentUser = { username: "user" };
        const root = await renderPage();
        const editLinks = root.findAllByType("a").filter(
            (link) => link.children.includes("Edit")
        );
        expect(editLinks).toHaveLength(0);
        expect(findButton(root, "Delete")).toBeUndefined();
    });

    test("should delete note successfully", async () => {
        const root = await renderPage();
        mockFetchJson.mockResolvedValueOnce(undefined);
        await act(async () => {
            await findButton(root, "Delete").props.onClick();
        });
        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/notes/1",
            { method: "DELETE" }
        );
        expect(mockNavigate).toHaveBeenCalledWith("/private");
    });

    test("should open add to collection modal", async () => {
        const root = await renderPage();
        await act(async () => {
            await findButton(root, "+ Add to Collection"
            ).props.onClick();
        });

        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/collections/user/user2"
        );
        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/notes/1/collections"
        );
        expect(root.findByProps({className: "modal show d-block"})).toBeDefined();
        expect(root.findByProps({id: "collection-1"})).toBeDefined();
    });

    test("should add note to collection", async () => {
        const root = await renderPage();
        await act(async () => {
            await findButton(root, "+ Add to Collection").props.onClick();
        });
        await act(async () => {
            root.findByProps({id: "collection-1"}).props.onChange();
        });

        mockFetchJson.mockImplementation((url, options) => {
            if (
                url === "http://localhost:8080/api/collections/1/notes/1" &&
                options?.method === "POST"
            ) {
                return Promise.resolve({});
            }
        });

        await act(async () => {
            await findButton(root, "Save").props.onClick();
        });
        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/collections/1/notes/1",
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
            }
        );
        expect(
            root.findAllByProps({className: "modal show d-block"})
        ).toHaveLength(0);
    });
});
