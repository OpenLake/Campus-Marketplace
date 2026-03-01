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

export const validateRegistrationForm = (formData) => {
  const errors = {};

  // First name
  if (!formData.first_name?.trim()) {
    errors.first_name = 'First name is required';
  } else if (formData.first_name.length < 2) {
    errors.first_name = 'Must be at least 2 characters';
  }

  // Last name
  if (!formData.last_name?.trim()) {
    errors.last_name = 'Last name is required';
  } else if (formData.last_name.length < 2) {
    errors.last_name = 'Must be at least 2 characters';
  }

  // Phone number (Indian format)
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!formData.phone_number?.trim()) {
    errors.phone_number = 'Phone number is required';
  } else if (!phoneRegex.test(formData.phone_number)) {
    errors.phone_number = 'Enter a valid 10-digit Indian mobile number';
  }

  // Vendor fields
  if (formData.role === 'vendor') {
    if (!formData.shop_name?.trim()) {
      errors.shop_name = 'Shop name is required';
    }
    if (!formData.shop_category) {
      errors.shop_category = 'Please select a category';
    }
    if (!formData.campus_location?.trim()) {
      errors.campus_location = 'Campus location is required';
    }
    if (!formData.opening_time) {
      errors.opening_time = 'Opening time is required';
    }
    if (!formData.closing_time) {
      errors.closing_time = 'Closing time is required';
    }
  }

  return errors;
};