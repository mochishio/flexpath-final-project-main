import {jest, describe, test, expect, beforeEach} from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { CategoryForm } from "../../components/category/CategoryForm.jsx";

describe("CategoryForm", () => {
    let renderer;
    let mockOnClose;
    let mockOnSave;

    const existingCategory = {
        id: 1,
        name: "React",
    };

    beforeEach(() => {
        mockOnClose = jest.fn();
        mockOnSave = jest.fn();
        renderer = null;
    });

    async function renderForm({category = null, show = true, error = ""} = {}) {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(CategoryForm, {
                    category,
                    show,
                    onClose: mockOnClose,
                    onSave: mockOnSave,
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

    async function changeName(root, value) {
        await act(async () => {
            root.findByProps({id: "category-name"}).props.onChange({
                target: { value },
            });
        });
    }

    test("should not render when show is false", async () => {
        const root = await renderForm({show: false});
        expect(root.findAllByType("div")).toHaveLength(0);
    });

    test("should render new category form", async () => {
        const root = await renderForm();
        const title = root.findByProps({
            className: "modal-title",
        });

        expect(title.children).toContain("New Category");
        expect(
            root.findByProps({id: "category-name"})
                .props.value).toBe("");
        expect(findButton(root, "Create")).toBeDefined();
    });

    test("should render edit category form", async () => {
        const root = await renderForm({category: existingCategory});
        const title = root.findByProps({
            className: "modal-title",
        });

        expect(title.children).toContain("Edit Category");
        expect(
            root.findByProps({id: "category-name"})
                .props.value).toBe("React");
        expect(findButton(root, "Save")).toBeDefined();
    });

    test("should call onSave when creating category", async () => {
        const root = await renderForm();
        await changeName(root, "Java");
        await act(async () => {
            findButton(root, "Create").props.onClick();
        });
        expect(mockOnSave).toHaveBeenCalledWith({name: "Java"});
        expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    test("should call onSave when editing category", async () => {
        const root = await renderForm({
            category: existingCategory,
        });
        await changeName(root, "Updated React");
        await act(async () => {
            findButton(root, "Save").props.onClick();
        });
        expect(mockOnSave).toHaveBeenCalledWith({
            name: "Updated React",
        });
        expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    test("should call onClose when cancel or close is clicked", async () => {
        const root = await renderForm();
        await act(async () => {
            findButton(root, "Cancel").props.onClick();
        });
        expect(mockOnClose).toHaveBeenCalledTimes(1);
        const closeButton = root.findByProps({
            className: "btn-close",
        });
        await act(async () => {
            closeButton.props.onClick();
        });
        expect(mockOnClose).toHaveBeenCalledTimes(2);
    });

    test("should display error message", async () => {
        const root = await renderForm({
            error: "Failed to save category",
        });
        const errorMessage = root.findByProps({
            className: "alert alert-danger mx-3 mt-3",
        });
        expect(errorMessage.children).toContain(
            "Failed to save category"
        );
    });
});
