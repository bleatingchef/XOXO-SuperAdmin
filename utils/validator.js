// Function to validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

function isValidPassword(password) {
    // Example: password must be at least 8 characters, include one uppercase letter and one number
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

function validateRequiredFields(fields, data) {
    const missingFields = [];

    fields.forEach((field) => {
        if (!data[field] || data[field].trim() === '') {
            missingFields.push(field);
        }
    });

    return missingFields;
}

module.exports = { isValidEmail,isValidPassword ,validateRequiredFields};