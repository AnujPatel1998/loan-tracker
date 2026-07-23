import { randomInt } from 'crypto';

export function generateUsername(fullName: string): string {
  const base = fullName
    .toLowerCase()
    .trim()
    .split(' ')[0]
    .replace(/[^a-z]/g, '');
  const suffix = randomInt(100, 999);
  return `${base}${suffix}`;
}

export function generatePassword(): string {
  const letters = 'abcdefghjkmnpqrstuvwxyz';
  const upper = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  const digits = '23456789';
  const symbols = '@#$%';

  let password = '';
  password += upper[randomInt(0, upper.length)];
  for (let i = 0; i < 4; i++) password += letters[randomInt(0, letters.length)];
  for (let i = 0; i < 3; i++) password += digits[randomInt(0, digits.length)];
  password += symbols[randomInt(0, symbols.length)];

  return password;
}