const USER_KEY = "user";

export const tokenManager = {
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  clearAuth: () => {
    localStorage.removeItem(USER_KEY);
  },
};