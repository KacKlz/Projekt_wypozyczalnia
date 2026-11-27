// Validate email format
export const validateEmail = (email) => {
    if (!email || !email.includes('@')) {
        return "Email address must contain '@'.";
    }
    return null;
};

// Validate password match
export const validatePasswordMatch = (password, repeatPassword) => {
    if (password !== repeatPassword) {
        return 'Passwords do not match!';
    }
    return null;
};

// Validate password security requirements (min. 8 characters, uppercase letter and special character)
export const validatePassword = (password) => {
    if (!password || password.length < 8) {
        return 'Password must be at least 8 characters long!';
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);

    if (!hasUppercase) {
        return 'Password must contain at least one uppercase letter!';
    }

    if (!hasSpecialChar) {
        return 'Password must contain at least one special character (e.g. !, @, #)!';
    }

    return null;
};

// Validate first name (required, at least 2 characters)
export const validateName = (name) => {
    const trimmedName = name.trim();

    if (!trimmedName) {
        return 'First name is required.';
    }

    if (trimmedName.length < 2) {
        return 'First name must be at least 2 characters.';
    }

    return null;
};
