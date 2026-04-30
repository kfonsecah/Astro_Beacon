export interface Sesion {
  id: string;
  astronautaId: string;
  token: string;
  expiraEn: Date;
  ultimaActividad: Date;
  activa: boolean;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  nombre: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface RefreshTokenDTO {
  refreshToken: string;
}
