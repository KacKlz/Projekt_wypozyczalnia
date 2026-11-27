const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// bcrypt only uses the first 72 bytes of a password, anything longer is ignored
const PASSWORD_MAX_BYTES = 72;

// Shared password rules for registration and password change.
// Keep in sync with frontend/src/validation.js
// Returns an error message, or null when the password is valid
function validatePassword(password) {
    if (typeof password !== "string" || password.length < 8) {
        return "Password must be at least 8 characters long.";
    }

    if (Buffer.byteLength(password, "utf8") > PASSWORD_MAX_BYTES) {
        return "Password is too long.";
    }

    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter.";
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
        return "Password must contain at least one special character.";
    }

    return null;
}

module.exports = { EMAIL_REGEX, validatePassword };
