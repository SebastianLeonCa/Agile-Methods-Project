// Form validation shared by server actions and tests. Each returns { field: message } for invalid fields.
import { SPOT_TYPES, URGENCIES } from "@/lib/types";

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

export function validateSpot(
  input: {
    title: string;
    description: string;
    type: string;
    urgency: string;
    lat: number | null;
    lng: number | null;
    address: string;
    photoUrl: string;
  },
  photoFolder: string,
): FieldErrors {
  const errors: FieldErrors = {};
  if (input.title.length < 3 || input.title.length > 100) errors.title = "Title must be 3–100 characters.";
  const { lat, lng } = input;
  if (lat === null || lng === null) errors.location = "Tap the map to place the pin.";
  else if (Math.abs(lat) > 90 || Math.abs(lng) > 180) errors.location = "That location is not valid.";
  if (!(SPOT_TYPES as readonly string[]).includes(input.type)) errors.type = "Choose a type.";
  if (!(URGENCIES as readonly string[]).includes(input.urgency)) errors.urgency = "Choose an urgency level.";
  if (input.description.length > 1000) errors.description = "Description must be 1000 characters or less.";
  if (input.address.length > 200) errors.address = "Address must be 200 characters or less.";
  // Only photos uploaded to the reporter's own folder in our bucket.
  if (input.photoUrl && !input.photoUrl.startsWith(photoFolder)) errors.photo = "Invalid photo. Please upload it again.";
  return errors;
}
