import React, { createContext, useContext, useEffect, useState } from "react";
import { wakeApi } from "../../axiosConfig";
import { getProfile } from "../Auth/AuthService";

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [content, setContent] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const showModal = (component) => {
    setContent(component);
    setIsVisible(true);
  };

  const hideModal = () => {
    setIsVisible(false);
    setContent(null);
  };

  useEffect(() => {
    wakeApi();

    const token = localStorage.getItem("authToken");
    if (token) {
      getProfile()
        .then((userData) => {
          setUser(userData);
          setIsAuthenticated(true);
        })
        .catch((error) => {
          console.error("Error fetching profile:", error);
          localStorage.removeItem("authToken");
        });
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <ModalContext.Provider
      value={{ showModal, hideModal, isAuthenticated, user, login, logout }}
    >
      {children}
      {isVisible && content}
    </ModalContext.Provider>
  );
};
