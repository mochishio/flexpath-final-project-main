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

  setError(error.message);
}