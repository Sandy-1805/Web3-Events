export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  return re.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

export function sanitizeInput(str: string): string {
  return str.trim().replace(/[<>]/g, '');
}