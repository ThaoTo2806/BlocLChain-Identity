export const validateEmail = (email) => {
    const regex = /^\S+@\S+\.\S+$/;
    return regex.test(email);
  };
  
  export const validateCitizenID = (id) => {
    return /^\d{12}$/.test(id);
  };
  
  export const validateRequiredFields = (...fields) => {
    return fields.every((field) => field && field.trim() !== '');
  };