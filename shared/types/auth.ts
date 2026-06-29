export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'participant';
}

export interface JwtPayload {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'participant';
  iat?: number;
  exp?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthMeResponse {
  user: User | null;
}