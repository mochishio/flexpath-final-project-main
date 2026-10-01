export async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = options.timeout ?? 10000;  // ms
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...options.headers,
      },
    });


    if (!response.ok) {
      let errorBody;

      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }

      const error = new Error(
        `HTTP ${response.status} ${response.statusText}\n${JSON.stringify(errorBody)}`
      );
      error.status = response.status;
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