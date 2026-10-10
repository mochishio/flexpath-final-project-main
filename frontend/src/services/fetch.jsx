export async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = options.timeout ?? 10000;  // ms
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  const accessToken = localStorage.getItem("accessToken")

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(accessToken && {Authorization: accessToken}),
        ...options.headers,
      },
    });


    if (!response.ok) {
      const errorText = await response.text();
      let errorBody = errorText;
      try {
        errorBody = JSON.parse(errorText);
      } catch {
        // Keep the original text
      }
      const error = new Error(
        `HTTP ${response.status} ${response.statusText}\n${JSON.stringify(errorBody)}`
      );
      error.status = response.status;
      error.body = errorBody;
      throw error;
    }

    // throw new Error(`error test (response: ${response.ok})`);
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return await response.json();
    }
    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}