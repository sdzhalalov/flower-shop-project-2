import { useState } from "react";
import { User, LoginForm } from "@/types";

const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User>({
    id: 1,
    username: "guest",
    role: "guest",
    name: "Гость",
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginForm>({
    username: "",
    password: "",
  });

  const users: User[] = [
    { id: 1, username: "admin", role: "admin", name: "Администратор" },
    {
      id: 2,
      username: "moderator1",
      role: "moderator",
      name: "Модератор Анна",
    },
    {
      id: 3,
      username: "moderator2",
      role: "moderator",
      name: "Модератор Иван",
    },
  ];

  const login = () => {
    const user = users.find((u) => u.username === loginForm.username);
    if (
      user &&
      (loginForm.password === "admin" || loginForm.password === "moderator")
    ) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      setLoginForm({ username: "", password: "" });
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser({ id: 1, username: "guest", role: "guest", name: "Гость" });
    setIsLoggedIn(false);
  };

  return {
    currentUser,
    isLoggedIn,
    loginForm,
    setLoginForm,
    users,
    login,
    logout,
  };
};

export default useAuth;
