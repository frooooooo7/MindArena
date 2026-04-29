export const getAuthErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: { error?: string } } })
      .response;

    if (response?.data?.error) {
      return response.data.error;
    }
  }

  return fallback;
};

export const getSafeRedirectPath = (
  redirectTo: string | null | undefined
): string | null => {
  if (!redirectTo) {
    return null;
  }

  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return null;
  }

  return redirectTo;
};
