import {jest, describe, test, expect, beforeEach} from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";

const mockFetchJson = jest.fn();
const mockNavigate = jest.fn();
const mockUseParams = jest.fn();
const mockHandleApiError = jest.fn();

jest.unstable_mockModule("../../services/fetch", () => ({
    fetchJson: mockFetchJson,
}));

jest.unstable_mockModule(
    "../../services/handleApiError",
    () => ({handleApiError: mockHandleApiError})
);

jest.unstable_mockModule("../../context/AuthContext", () => ({
    useAuth: () => ({currentUser: { username: "user2" }})
}));

jest.unstable_mockModule("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
    useParams: mockUseParams,
}));

const { default: NoteFormPage } = await import("../../pages/NoteFormPage.jsx");

describe("NoteFormPage", () => {
    let renderer;

    const categories = [
        { id: 1, name: "CSS" },
        { id: 2, name: "HTML" },
        { id: 3, name: "Java" },
    ];

    const existingNote = {
        id: 1,
        title: "CSS",
        content: "CSS note content",
        isPublic: true,
        username: "user2",
        categoryId: 1,
        createdAt: "2026-10-01T20:00:00",
        updatedAt: "2026-10-02T20:00:00",
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Create mode
        mockUseParams.mockReturnValue({});

        mockFetchJson.mockImplementation((url) => {
            if (url === "http://localhost:8080/api/categories") {
                return Promise.resolve(categories);
            }

            return Promise.reject(
                new Error(`Unexpected API URL: ${url}`)
            );
        });
    });

    async function renderPage() {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(NoteFormPage)
            );
        });
        return renderer.root;
    }

    async function changeInput(root, id, value) {
        await act(async () => {
            root.findByProps({ id }).props.onChange({
                target: { value },
            });
        });
    }

    async function submitForm(root) {
        await act(async () => {
            await root.findByType("form").props.onSubmit({
                preventDefault: jest.fn(),
            });
        });
    }

    test("should render create note form", async () => {
        const root = await renderPage();
        expect(root.findByType("h2").children).toContain("Create Note");
        expect(root.findByProps({ id: "title" })).toBeDefined();
        expect(root.findByProps({ id: "category" })).toBeDefined();
        expect(root.findByProps({ id: "content" })).toBeDefined();
        expect(root.findByProps({ id: "private" })).toBeDefined();
        expect(root.findByProps({ id: "public" })).toBeDefined();
        expect(root.findByProps({ id: "private" }).props.checked).toBe(true);
        expect(root.findByProps({ id: "public" }).props.checked).toBe(false);
    });

    test("should create a note successfully", async () => {
        mockFetchJson.mockImplementation((url, options) => {
            if (url === "http://localhost:8080/api/categories") {
                return Promise.resolve(categories);
            }
            if (
                url === "http://localhost:8080/api/notes" &&
                options?.method === "POST"
            ) {
                return Promise.resolve({ id: 2 });
            }
        });

        const root = await renderPage();
        await changeInput(root, "title", "React");
        await changeInput(root, "category", "1");
        await changeInput(root, "content", "React note content");
        await act(async () => {
            root.findByProps({ id: "public" }).props.onChange();
        });
        await submitForm(root);

        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/notes",
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    title: "React",
                    content: "React note content",
                    isPublic: true,
                    username: "user2",
                    categoryId: 1,
                }),
            }
        );
        expect(mockNavigate).toHaveBeenCalledWith("/notes/2");
    });

    test("should handle create note error", async () => {
        mockFetchJson.mockImplementation((url, options) => {
            if (url === "http://localhost:8080/api/categories") {
                return Promise.resolve(categories);
            }
            if (
                url === "http://localhost:8080/api/notes" &&
                options?.method === "POST"
            ) {
                return Promise.reject(new Error("Failed to create note"));
            }
        });

        const root = await renderPage();
        await changeInput(root, "title", "React");
        await changeInput(root, "content", "React note content");
        await submitForm(root);

        expect(mockHandleApiError).toHaveBeenCalledWith(
            expect.objectContaining({message: "Failed to create note"}),
            mockNavigate,
            expect.any(Function)
        );
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("should render edit note form", async () => {
        mockUseParams.mockReturnValue({ id: "1" });
        mockFetchJson.mockImplementation((url) => {
            if (url === "http://localhost:8080/api/categories") {
                return Promise.resolve(categories);
            }
            if (url === "http://localhost:8080/api/notes/1") {
                return Promise.resolve(existingNote);
            }
        });

        const root = await renderPage();
        expect(root.findByType("h2").children).toContain("Edit Note");
        expect(root.findByProps({ id: "title" }).props.value).toBe("CSS");
        expect(root.findByProps({ id: "content" }).props.value).toBe("CSS note content");
        expect(root.findByProps({ id: "category" }).props.value).toBe(1);
        expect(root.findByProps({ id: "public" }).props.checked).toBe(true);
        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/notes/1"
        );
    });

    test("should update a note successfully", async () => {
        mockUseParams.mockReturnValue({ id: "1" });
        mockFetchJson.mockImplementation((url, options) => {
            if (url === "http://localhost:8080/api/categories") {
                return Promise.resolve(categories);
            }
            if (
                url === "http://localhost:8080/api/notes/1" && !options
            ) {
                return Promise.resolve(existingNote);
            }
            if (
                url === "http://localhost:8080/api/notes/1" && options?.method === "PUT"
            ) {
                return Promise.resolve({ id: 1 });
            }
            return Promise.reject(new Error("Unexpected API URL"));
        });

        const root = await renderPage();
        await changeInput(root, "title", "Updated CSS");
        await submitForm(root);

        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/notes/1",
            {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    title: "Updated CSS",
                    content: "CSS note content",
                    isPublic: true,
                    username: "user2",
                    categoryId: 1,
                }),
            }
        );
        expect(mockNavigate).toHaveBeenCalledWith("/notes/1");
    });
});
