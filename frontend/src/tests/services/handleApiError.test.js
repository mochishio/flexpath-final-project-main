import {jest, describe, test, expect} from "@jest/globals";
import { handleApiError } from "../../services/handleApiError";

describe("handleApiError", () => {
    test("should navigate to 404 page when status is 404", () => {
        const navigate = jest.fn();
        const setError = jest.fn();
        handleApiError({status: 404}, navigate, setError);
        expect(navigate).toHaveBeenCalledWith("/404");
    });

    test("should navigate to 500 page when status is 500", () => {
        const navigate = jest.fn();
        const setError = jest.fn();
        handleApiError({status: 500}, navigate, setError);
        expect(navigate).toHaveBeenCalledWith("/500");
    });

    test("should set error when status is 401", () => {
        const navigate = jest.fn();
        const setError = jest.fn();
        handleApiError({status: 401}, navigate, setError);
        expect(setError).toHaveBeenCalledWith("Please log in to continue.");
    });

    test("should set error when status is 403", () => {
        const navigate = jest.fn();
        const setError = jest.fn();
        handleApiError({status: 403}, navigate, setError);
        expect(setError).toHaveBeenCalledWith("You don't have permission to perform this action.");
    });

    test("should set error when status is 409", () => {
        const navigate = jest.fn();
        const setError = jest.fn();
        handleApiError({status: 409}, navigate, setError);
        expect(setError).toHaveBeenCalledWith("A category with this name already exists.");
    });
})