export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface RefreshRequest {
  refresh: string;
}

export interface RefreshResponse {
  access: string;
}
