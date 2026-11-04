// Form validation shared by server actions and tests. Each returns { field: message } for invalid fields.

export type FieldErrors = Record<string, string>;

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD = 8;

export const USERNAME_HINT = "3–30 characters: lowercase letters, numbers or _";

export function validateUsername(username: string): string | undefined {
  if (!USERNAME_RE.test(username)) return `Username must be ${USERNAME_HINT}.`;
}

export function validateSignup(input: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const usernameError = validateUsername(input.username);
  if (usernameError) errors.username = usernameError;
  if (!EMAIL_RE.test(input.email)) errors.email = "Enter a valid email address.";
  if (input.password.length < MIN_PASSWORD) errors.password = `Password must be at least ${MIN_PASSWORD} characters.`;
  if (input.confirmPassword !== input.password) errors.confirmPassword = "Passwords do not match.";
  return errors;
}

export function validateProfile(input: {
  username: string;
  homeArea: string;
  homeLat: number | null;
  homeLng: number | null;
}): FieldErrors {
  const errors: FieldErrors = {};
  const usernameError = validateUsername(input.username);
  if (usernameError) errors.username = usernameError;
  if (input.homeArea.length > 100) errors.homeArea = "Home area must be 100 characters or less.";
  const { homeLat: lat, homeLng: lng } = input;
  if ((lat === null) !== (lng === null)) errors.home = "Pick a home location on the map.";
  if (lat !== null && lng !== null && (Math.abs(lat) > 90 || Math.abs(lng) > 180)) {
    errors.home = "Home location is not valid.";
  }
  return errors;
}
