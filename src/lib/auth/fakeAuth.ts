const TOKEN_KEY = "cm_token";

export const fakeAuth = {
  login(email: string) {
    localStorage.setItem("cm_login_email", email);
  },

  verifyOtp(otp: string) {
    if (otp.length >= 4) {
      localStorage.setItem(TOKEN_KEY, "demo-token");
      return true;
    }
    return false;
  },

  isLoggedIn() {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("cm_login_email");
  },
};