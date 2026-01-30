export const validators = {
  /**
   * Validate email format
   * @param {string} email - Email address to validate
   * @returns {string|null} Error message if invalid, null if valid
   */
  // utils/validation.js
email: (email) => {
    if (!email) return "Email is required";
    
    // Normalize input to prevent errors from uppercase or stray spaces
    const normalizedEmail = email.trim().toLowerCase();
    
    const emailRegex = /^[^\s@]+@iitbhilai\.ac\.in$/;
    if (!emailRegex.test(normalizedEmail)) {
      return "Email must be an @iitbhilai.ac.in address";
    }
    return null;
},
  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {string|null} Error message if invalid, null if valid
   */
  password: (password) => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return "Password must contain at least one special character (!@#$%^&*)";
    }
    return null;
  },
  /**
   * Validate username
   * @param {string} username - Username to validate
   * @returns {string|null} Error message if invalid, null if valid
   */
  username: (username) => {
    if (!username) {
      return "Username is required";
    }
    if (username.length < 3) {
      return "Username must be at least 3 characters long";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    return null;
  },
  /**
   * Validate name
   * @param {string} name
   * @returns {string|null} Error message or null
   */
  name: (name) => {
    if (!name) return "Name is required";

    if (name.length < 2) {
      return "Name must be at least 2 characters long";
    }

    return null;
  },

  /**
   * Validate password confirmation
   * @param {string} password
   * @param {string} confirmPassword
   * @returns {string|null} Error message or null
   */
  confirmPassword: (password, confirmPassword) => {
    if (!confirmPassword) return "Please confirm your password";

    if (password !== confirmPassword) {
      return "Passwords do not match";
    }

    return null;
  },
};
