// Function to validate phone number format using RegEx
export function isValidPhoneNumber(phoneNumber) {
  const phoneRegex = /^\d{6,14}$/; // Example: 1234567890
  return phoneRegex.test(phoneNumber);
}

export function isValidCountryCode(countryCode) {
  // Basic validation: Check if the country code starts with a '+' and is followed by 1 to 3 digits
  const countryCodeRegex = /^\+\d{1,3}$/;
  return countryCodeRegex.test(countryCode);
}
