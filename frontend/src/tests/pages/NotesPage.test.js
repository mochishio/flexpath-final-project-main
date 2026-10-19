import {jest, describe, test, expect, beforeEach} from "@jest/globals";
import React from "react";
import TestRenderer, {act} from "react-test-renderer";

const mockFetchJson = jest.fn();
const mockUseLocation= jest.fn();

jest.unstable_mockModule("../../services/fetch.jsx", () => ({
    fetchJson: mockFetchJson
}))

jest.unstable_mockModule("../../context/AuthContext.jsx", () => ({
    useAuth: () => ({
        currentUser: {username: "user2"},
    })
}))

jest.unstable_mockModule("react-router-dom", () => ({
    useLocation: mockUseLocation,
    Link: ({to, children, ...props}) => React.createElement("a", {href: to, ...props}, children)
}))

const {default: NotesPage} = await import ("../../pages/NotesPage");
describe("NotesPage", () => {
    let renderer;

    const notes = [
        {
            "id": 1,
            "createdAt": "2026-10-01T20:00:00",
            "updatedAt": "2026-10-01T20:00:00",
            "title": "CSS",
            "content": "CSS note content",
            "isPublic": true,
            "username": "user2",
            "categoryId": 1
        },
        {
            "id": 2,
            "createdAt": "2026-10-01T22:00:00",
            "updatedAt": "2026-10-01T22:00:00",
            "title": "HTML",
            "content": "HTML note content",
            "isPublic": false,
            "username": "user2",
            "categoryId": 2
        },
        {
            "id": 3,
            "createdAt": "2026-10-01T23:00:00",
            "updatedAt": "2026-10-01T23:00:00",
            "title": "Java",
            "content": "Java note content",
            "isPublic": true,
            "username": "user",
            "categoryId": 3
        },
    ];

    const categories = [
        {"id": 1, "name": "CSS"},
        {"id": 2, "name": "HTML"},
        {"id": 3, "name": "Java"}
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        mockUseLocation.mockReturnValue({pathname: "/public"})

        mockFetchJson.mockImplementation((url) => {
            if (url === "http://localhost:8080/api/notes") {
              return Promise.resolve(notes);
            }
            if (url === "http://localhost:8080/api/categories") {
              return Promise.resolve(categories);
            }
            return Promise.reject(new Error("Unexpected API URL"));
          });
    })

    async function renderPage() {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(NotesPage)
            );
        });
        return renderer.root;
    }

    test("should render public notes page", async () => {
        const root = await renderPage();
        expect(root.findByProps({id: "keyword"})).toBeDefined();
        expect(root.findByProps({id: "category"})).toBeDefined();
        expect(root.findByProps({id: "username"})).toBeDefined();
        expect(root.findByProps({id: "sortBy"})).toBeDefined();
        expect(
            root.findAllByProps({ id: "visibility" })
          ).toHaveLength(0);

        expect(root.findByProps({id: "search"})).toBeDefined();
        expect(root.findByProps({id: "clear"})).toBeDefined();
        expect(root.findByProps({id: "newNote"})).toBeDefined();
        expect(root.findByProps({id: "sortDirection"})).toBeDefined();
    });

    test("should fetch all notes and catefories", async () => {
        await renderPage();
        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/notes"
        );
        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/api/categories"
        );
    });

    test("should display only public notes", async () => {
        const root = await renderPage();
        const titles = root.findAllByType("h5").map(
            (element) => element.props.title
          );
          expect(titles).toContain("CSS");
          expect(titles).toContain("Java");
          expect(titles).not.toContain("HTML");
          expect(titles).toHaveLength(2);
      });

      test("should filter notes by keyword", async () => {
        const root = await renderPage();
        const keywordInput = root.findByProps({id: "keyword"});

        await act(async () => {
          keywordInput.props.onChange({target: { value: "Java" }});
        });
        await act(async () => {
          root.findByProps({ id: "search" }).props.onClick();
        });
        const titles = root.findAllByType("h5").map(
          (element) => element.props.title
        );
        expect(titles).toEqual(["Java"]);
      });

      test("should render visibility filter in private mode", async () => {
        mockUseLocation.mockReturnValue({pathname: "/private"});
        mockFetchJson.mockImplementation((url) => {
          if (url === "http://localhost:8080/api/notes/user/user2") {
            return Promise.resolve(notes);
          }
          if (url === "http://localhost:8080/api/categories") {
            return Promise.resolve(categories);
          }
          return Promise.reject(new Error("Unexpected API URL"));
        });

        const root = await renderPage();
        expect(root.findByProps({ id: "visibility" })).toBeDefined();
        expect(root.findAllByProps({ id: "username" })).toHaveLength(0);
        expect(mockFetchJson).toHaveBeenCalledWith(
          "http://localhost:8080/api/notes/user/user2"
        );
      });

      test("should show error message when API fails", async () => {
        mockFetchJson.mockRejectedValue(new Error("Failed to load notes"));
        const root = await renderPage();
        const errorMessage = root.findByProps({
          className: "alert alert-danger",
        });
        expect(errorMessage.children).toContain(
          "Failed to load notes"
        );
      });
})