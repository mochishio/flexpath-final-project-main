import { createContext, useEffect, useState } from "react";
import { fetchJson } from "../services/fetch";
import { useContext } from "react";

const AuthContext = createContext(null);

export function AuthContextProvider({children}) {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRoles, setCurrentUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentUser() {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setLoading(false);
        return
      }

      try {
        const user = await fetchJson("http://localhost:8080/api/profile");
        setCurrentUser(user);
      } finally {
        setLoading(false);
      }
    }

    loadCurrentUser();
  }, []);

  function logout() {
    localStorage.removeItem("accessToken");
    setCurrentUser(null);
    setCurrentUserRoles([]);
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        currentUserRoles,
        setCurrentUserRoles,
        loading,
        logout
      }}>
        {children}
      </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext);
}