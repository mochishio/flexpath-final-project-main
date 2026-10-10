export function handleApiError(
  error,
  navigate,
  setError
) {
  if (error.status === 404) {
    navigate("/404");
    return;
  }

  if (error.status >= 500) {
    navigate("/500");
    return;
  }

  if (error.status === 401) {
    setError("Please log in to continue.");
    return;
  }

  if (error.status === 403) {
    setError("You don't have permission to perform this action.");
    return;
  }

  if (error.status === 409) {
    setError("A category with this name already exists.");
    return;
  }
  setError(error.message);
}