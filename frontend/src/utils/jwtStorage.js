const AUTH_KEY = "freelance_app_auth";// the key name used under the browsers localStorage dictionary

export const saveAuth = (authData) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(authData)); //browser api that saves data permanently in the browser -we have a key and a value wich is the api response as a json string 
};

export const getAuth = () => {
  const authData = localStorage.getItem(AUTH_KEY);// retrive the stored json string (token payload and user info )

  if (!authData) {
    return null;
  }

  try {
    return JSON.parse(authData); //check if the stored data is corrupted parse it(convert it back to javascript object) and trow error
  } catch (error) {
    console.error("Invalid auth data:", error);
    clearAuth(); // deletes the data and prevents app crashes
    return null;
  }
};

export const getToken = () => {
  const auth = getAuth();
  return auth?.token || null; //if auth exits get the token string otherwise return null if undefined auth?.token
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_KEY); //delete the specified key from localStorage(when logging out pr jwt expires)
};

const decodeJwtPayload = (token) => {
  try {
    const parts = token.split("."); //split the token string at every encountered . into an array of three elements

    if (parts.length !== 3) { // verify the jwt token has the three seperated parts by . (header.Payload.Signature)
      return null;
    }

    const payload = parts[1]; //extract second element cause i want the data and expiration times

    const base64 = payload //converts Base64 (encoded string)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      atob(base64) //decode into binary data
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

  if (!payload?.exp) { //exp is the standart expiration timestamp stored inside jwt in sec if there is no value return true
    return true;
  }
  //Date.now() returns current time in milliseconds so convert it in seconds to compare expiration time and return bolean
  const currentTime = Math.floor(Date.now() / 1000);

  return payload.exp <= currentTime;
};

export const isAuthenticated = () => {
  const token = getToken();

  if (!token) {     //check if user has valid token or an expired token
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
  return auth?.verificationStatus ?? null;
};