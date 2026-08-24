const AUTH_KEY = "freelance_app_auth";

export const saveAuth = (authData) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
};

export const getAuth = () => {
  const authData = localStorage.getItem(AUTH_KEY);

  if (!authData) {
    return null;
  }

  try {
    return JSON.parse(authData);
  } catch (error) {
    console.error("Invalid auth data:", error);
    clearAuth();
    return null;
  }
};

export const getToken = () => {
  const auth = getAuth();
  return auth?.token || null;
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_KEY);
};

const decodeJwtPayload = (token) => {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];

    const base64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(
          (char) =>
            "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2)
        )
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Unable to decode JWT:", error);
    return null;
  }
};

export const isTokenExpired = (token) => {
  if (!token) {
    return true;
  }

  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);

  return payload.exp <= currentTime;
};

export const isAuthenticated = () => {
  const token = getToken();

  if (!token) {
    return false;
  }

  if (isTokenExpired(token)) {
    clearAuth();
    return false;
  }

  return true;
};

export const getUserRole = () => {
  const auth = getAuth();
  return auth?.role || null;
};

export const getUserStatus = () => {
  const auth = getAuth();
  return auth?.verificationStatus || null;
};