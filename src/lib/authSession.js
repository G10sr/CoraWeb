export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function clearStoredUser() {
  localStorage.removeItem("user");
}

export function shouldKeepStoredUser(storedUser, responseData) {
  if (!storedUser?.id) {
    return false;
  }

  return Boolean(responseData?.ok && responseData?.perfil);
}
