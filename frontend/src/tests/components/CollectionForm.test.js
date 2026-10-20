import {jest, describe, test, expect, beforeEach, afterEach} from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { CollectionForm } from "../../components/collection/CollectionForm.jsx";

describe("CollectionForm", () => {
    let renderer;
    let mockOnSave;
    let mockOnClose;
    let mockOnDelete;

    const existingCollection = {
        id: 1,
        name: "Frontend",
        description: "HTML and CSS notes",
        isPublic: true,
        username: "user2",
    };

    beforeEach(() => {
        mockOnSave = jest.fn();
        mockOnClose = jest.fn();
        mockOnDelete = jest.fn();
        renderer = null;
    });

    afterEach(() => {
        if (renderer) {
            act(() => {renderer.unmount()});
            renderer = null;
        }
    });

    async function renderForm({
        collection = null,
        show = true,
        error = "",
    } = {}) {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(CollectionForm, {
                    collection,
                    show,
                    onSave: mockOnSave,
                    onClose: mockOnClose,
                    onDelete: mockOnDelete,
                    error,
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

    async function changeField(root, id, value) {
        await act(async () => {
            root.findByProps({ id }).props.onChange({
                target: { value },
            });
        });
    }

    async function submitForm(root) {
        const mockPreventDefault = jest.fn();
        await act(async () => {
            root.findByType("form").props.onSubmit({
                preventDefault: mockPreventDefault,
            });
        });
        return mockPreventDefault;
    }

    test("should not render when show is false", async () => {
        const root = await renderForm({
            show: false,
        });
        expect(root.findAllByType("form")).toHaveLength(0);
        expect(root.findAllByType("div")).toHaveLength(0);
    });

    test("should render new collection form", async () => {
        const root = await renderForm();
        const title = root.findByProps({
            className: "modal-title",
        });
        expect(title.children).toContain("New Collection");
        expect(root.findByProps({id: "collection-name"}).props.value).toBe("");
        expect(
            root.findByProps({id: "collection-description"}).props.value
        ).toBe("");
        expect(
            root.findByProps({id: "collection-private"}).props.checked
        ).toBe(true);
        expect(findButton(root, "Create")).toBeDefined();
        expect(findButton(root, "Delete")).toBeUndefined();
    });

    test("should render edit collection form", async () => {
        const root = await renderForm({
            collection: existingCollection,
        });
        expect(
            root.findByProps({className: "modal-title"}).children
        ).toContain("Edit Collection");
        expect(
            root.findByProps({id: "collection-name"}).props.value
        ).toBe("Frontend");
        expect(
            root.findByProps({id: "collection-description"}).props.value
        ).toBe("HTML and CSS notes");
        expect(
            root.findByProps({id: "collection-public",}).props.checked
        ).toBe(true);
        expect(findButton(root, "Save")).toBeDefined();
        expect(findButton(root, "Delete")).toBeDefined();
    });

    test("should update description", async () => {
        const root = await renderForm();
        await changeField(
            root,
            "collection-description",
            "React study notes"
        );
        expect(
            root.findByProps({id: "collection-description"}).props.value
        ).toBe("React study notes");
    });

    test("should change visibility to public", async () => {
        const root = await renderForm();
        await act(async () => {
            root.findByProps({id: "collection-public",}).props.onChange();
        });
        expect(
            root.findByProps({id: "collection-public"}).props.checked
        ).toBe(true);
        expect(
            root.findByProps({id: "collection-private"}).props.checked
        ).toBe(false);
    });

    test("should change visibility to private", async () => {
        const root = await renderForm({
            collection: existingCollection,
        });
        await act(async () => {
            root.findByProps({id: "collection-private",
            }).props.onChange();
        });
        expect(
            root.findByProps({id: "collection-private"}).props.checked
        ).toBe(true);
        expect(
            root.findByProps({id: "collection-public"}).props.checked
        ).toBe(false);
    });

    test("should call onSave when creating collection", async () => {
        const root = await renderForm();
        await changeField(root, "collection-name", "Backend");
        await changeField(
            root,
            "collection-description",
            "Java and Spring notes"
        );
        await act(async () => {
            root.findByProps({id: "collection-public"}).props.onChange();
        });
        const preventDefault = await submitForm(root);
        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(mockOnSave).toHaveBeenCalledWith({
            name: "Backend",
            description: "Java and Spring notes",
            isPublic: true,
            username: "",
        });
        expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    test("should call onSave when editing collection", async () => {
        const root = await renderForm({
            collection: existingCollection,
        });
        await changeField(
            root,
            "collection-name",
            "Updated Frontend"
        );
        await submitForm(root);
        expect(mockOnSave).toHaveBeenCalledWith({
            name: "Updated Frontend",
            description: "HTML and CSS notes",
            isPublic: true,
            username: "user2",
        });
        expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    test("should call onDelete when delete is clicked", async () => {
        const root = await renderForm({
            collection: existingCollection,
        });
        await act(async () => {
            findButton(root, "Delete").props.onClick();
        });
        expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    test("should call onClose when cancel or close is clicked", async () => {
        const root = await renderForm();
        await act(async () => {
            findButton(root, "Cancel").props.onClick();
        });
        expect(mockOnClose).toHaveBeenCalledTimes(1);
        await act(async () => {
            root.findByProps({className: "btn-close"}).props.onClick();
        });
        expect(mockOnClose).toHaveBeenCalledTimes(2);
    });

    test("should display error message", async () => {
        const root = await renderForm({
            error: "Failed to save collection",
        });
        const errorMessage = root.findByProps({
            className: "alert alert-danger mx-3 mt-3",
        });
        expect(errorMessage.children).toContain(
            "Failed to save collection"
        );
    });
});
