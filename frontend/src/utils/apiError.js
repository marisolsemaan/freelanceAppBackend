export function getApiErrorMessage(error) {
  if (!error.response) {
    return "Could not connect to the server. Please try again.";
  }

  const data = error.response.errors;

  if (data?.message) {
    return data.message;
  }

  if (data?.title) {
    return data.title;
  }

  if (data?.errors) {
    const firstError = Object.values(data.errors)
      .flat()
      .find(Boolean);

    if (firstError) {
      return firstError;
    }
  }

  return "Something went wrong. Please try again.";
}