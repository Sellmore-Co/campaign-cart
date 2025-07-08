function preserveQueryParams(targetUrl, preserveParams = ["debug", "debugger"]) {
  try {
    const url = new URL(targetUrl, window.location.origin);
    const currentParams = new URLSearchParams(window.location.search);
    preserveParams.forEach((param) => {
      const value = currentParams.get(param);
      if (value && !url.searchParams.has(param)) {
        url.searchParams.append(param, value);
      }
    });
    if (currentParams.get("debug") === "true" && !url.searchParams.has("debug")) {
      url.searchParams.append("debug", "true");
    }
    if (currentParams.get("debugger") === "true" && !url.searchParams.has("debugger")) {
      url.searchParams.append("debugger", "true");
    }
    return url.href;
  } catch (error) {
    console.error("[URL Utils] Error preserving query parameters:", error);
    return targetUrl;
  }
}
export {
  preserveQueryParams as p
};
