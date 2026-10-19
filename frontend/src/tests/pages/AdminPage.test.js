import {jest, describe, test, expect, beforeEach} from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";

let mockAuth = {currentUserRoles: ["ADMIN"], loading: false};

jest.unstable_mockModule(
    "../../context/AuthContext",
    () => ({useAuth: () => mockAuth,})
);

jest.unstable_mockModule(
    "react-router-dom",
    () => ({
        Navigate: ({ to, replace }) =>
            React.createElement("div", {
                id: "mock-navigate",
                to,
                replace,
            }),
    })
);

jest.unstable_mockModule(
    "../../components/admin/AdminTable",
    () => ({
        default: ({ sectionName, columns }) =>
            React.createElement("div", {
                id: "mock-admin-table",
                sectionName,
                columns,
            }),
    })
);

const { default: AdminPage } = await import(
    "../../pages/AdminPage.jsx"
);

describe("AdminPage", () => {
    let renderer;
    beforeEach(() => {
        mockAuth = {
            currentUserRoles: ["ADMIN"],
            loading: false,
        };
    });

    async function renderPage() {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(AdminPage)
            );
        });
        return renderer.root;
    }

    function getAdminTable(root) {
        return root.findByProps({
            id: "mock-admin-table",
        });
    }

    function findButton(root, text) {
        return root.findAllByType("button").find(
            (button) => button.children.includes(text)
        );
    }

    test("should redirect non-admin user to 404", async () => {
        mockAuth = {
            currentUserRoles: ["USER"],
            loading: false,
        };
        const root = await renderPage();
        const redirect = root.findByProps({id: "mock-navigate"});

        expect(redirect.props.to).toBe("/404");
        expect(redirect.props.replace).toBe(true);
        expect(
            root.findAllByProps({ id: "mock-admin-table" })
        ).toHaveLength(0);
    });

    test("should render admin page for admin user", async () => {
        const root = await renderPage();
        expect(root.findByType("h2").children).toContain("Admin");
        expect(findButton(root, "Notes")).toBeDefined();
        expect(findButton(root, "Categories")).toBeDefined();
        expect(findButton(root, "Collections")).toBeDefined();
        expect(getAdminTable(root)).toBeDefined();
    });

    test("should show notes section by default", async () => {
        const root = await renderPage();
        const table = getAdminTable(root);
        expect(table.props.sectionName).toBe("notes");
        expect(table.props.columns).toEqual([
            "id",
            "title",
            "username",
            "createdAt",
            "updatedAt",
        ]);
        expect(
            findButton(root, "Notes").props.className
        ).toBe("btn btn-dark");
    });

    test("should switch to categories section", async () => {
        const root = await renderPage();
        await act(async () => {
            findButton(root, "Categories").props.onClick();
        });
        const table = getAdminTable(root);
        expect(table.props.sectionName).toBe("categories");
        expect(table.props.columns).toEqual([
            "id",
            "name",
            "createdAt",
            "updatedAt",
        ]);

        expect(
            findButton(root, "Categories").props.className
        ).toBe("btn btn-dark");
        expect(
            findButton(root, "Notes").props.className
        ).toBe("btn btn-outline-dark");
    });

    test("should switch to collections section", async () => {
        const root = await renderPage();
        await act(async () => {
            findButton(root, "Collections").props.onClick();
        });
        const table = getAdminTable(root);

        expect(table.props.sectionName).toBe("collections");
        expect(table.props.columns).toEqual([
            "id",
            "name",
            "username",
            "createdAt",
            "updatedAt",
        ]);
        expect(
            findButton(root, "Collections").props.className
        ).toBe("btn btn-dark");
    });

    test("should exclude isPublic column in all sections", async () => {
        const root = await renderPage();
        const sections = [
            "Notes",
            "Categories",
            "Collections",
        ];

        for (const section of sections) {
            await act(async () => {
                findButton(root, section).props.onClick();
            });
            const table = getAdminTable(root);
            expect(table.props.columns).not.toContain("isPublic");
        }
    });

    test("should switch back to notes section", async () => {
        const root = await renderPage();
        await act(async () => {
            findButton(root, "Categories").props.onClick();
        });
        expect(getAdminTable(root).props.sectionName).toBe("categories");
        await act(async () => {
            findButton(root, "Notes").props.onClick();
        });
        expect(getAdminTable(root).props.sectionName).toBe("notes");
    });
});
