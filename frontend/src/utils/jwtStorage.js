const Token_Key="connectedIn_token";
const User_Key= "connectedIn_User";

export const saveAuth= (response)=>{
    const userData= response.response;

    localStorage.setItem(Token_Key, userData.token);

    localStorage.setItem(User_Key, JSON.stringify({
      userId: userData.userId,
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      verificationStatus: userData.verificationStatus,
      expiresAt: userData.expiresAt,
    })
  );
};

export const getToken= ()=>{
    return localStorage.getItem(Token_Key);
};

export const getUser=()=>{
    const user= localStorage.getItem(User_Key);

    return user? JSON.parse(user): null;
};

export const logout = ()=>{
    localStorage.removeItem(Token_Key);
    localStorage.removeItem(User_Key);
};

export const isAuthenticated=()=>{
    return !!getToken();
};