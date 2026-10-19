import {jest, describe, test, expect, beforeEach} from "@jest/globals";
import React from "react";
import TestRenderer, {act} from "react-test-renderer";

const mockNavigate = jest.fn();
const mockFetchJson = jest.fn();
const mockSetCurrentUser = jest.fn();
const mockSetCurrentUserRoles = jest.fn();

jest.unstable_mockModule("../../services/fetch.jsx", () => ({
    fetchJson: mockFetchJson
}))

jest.unstable_mockModule("../../context/AuthContext.jsx", () => ({
    useAuth: () => ({
        setCurrentUser: mockSetCurrentUser,
        setCurrentUserRoles: mockSetCurrentUserRoles,
    })
}))

jest.unstable_mockModule("react-router-dom", () => ({
    useNavigate: () => mockNavigate
}))

const {default: LoginPage} = await import ("../../pages/LoginPage");
describe("LoginPage", () => {
    let renderer;

    beforeEach(() => {
        jest.clearAllMocks();
        globalThis.localStorage = {
            getItem: jest.fn(() => null),
            setItem: jest.fn(),
            removeItem: jest.fn(),
        }
    })

    async function renderPage() {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(LoginPage)
            );
        });
        return renderer.root;
    }

    async function enterCredentials(root) {
        await act(async () => {
            root.findByProps({id: "username"}).props.onChange({
                target: {value: "user2"},
            });

            root.findByProps({id: "password"}).props.onChange({
                target: {value: "user2"},
            });
        })
    }

    async function submitForm(root) {
        await act(async () => {
            root.findByType("form").props.onSubmit({
                preventDefault: jest.fn(),
            });
        })
    }

    test("should render login form", async () => {
        const root = await renderPage();
        expect(root.findByProps({id: "username"})).toBeDefined();
        expect(root.findByProps({id: "password"})).toBeDefined();

        const button = root.findByType("button");
        expect(button.children).toContain("Login");
        expect(button.props.disabled).toBe(false);
    });

    test("should login", async () => {
        mockFetchJson
            .mockResolvedValueOnce({accessToken: {token: "test"}})
            .mockResolvedValueOnce({username: "user2"})
            .mockResolvedValueOnce(["USER"]);

        const root = await renderPage();
        await enterCredentials(root);
        await submitForm(root);

        expect(mockFetchJson).toHaveBeenCalledWith(
            "http://localhost:8080/auth/login",
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    username: "user2",
                    password: "user2",
                }),
            }
        );

        expect(localStorage.setItem).toHaveBeenCalledWith(
            "accessToken", "test"
        );

        expect(mockSetCurrentUser).toHaveBeenCalledWith(
            {username: "user2"}
        );

        expect(mockSetCurrentUserRoles).toHaveBeenCalledWith(
            ["USER"]
        );
    });
})