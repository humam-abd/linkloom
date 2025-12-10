export interface User {
  id: string;
  email: string;
  name?: string;
  password?: string;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  description?: string;
}

export interface Collection {
  id: string;
  userId: string;
  title: string;
  description: string;
  items: LinkItem[];
  isPublic: boolean;
  theme: "light" | "dark" | "colorful";
  createdAt: number;
}

export enum ViewState {
  LANDING = "LANDING",
  LOGIN = "LOGIN",
  REGISTER = "REGISTER",
  DASHBOARD = "DASHBOARD",
  EDITOR = "EDITOR",
  PUBLIC_VIEW = "PUBLIC_VIEW",
}

export interface SupabaseAuthResponse {
  user: User;
  session: Session | null;
}

export interface UserSupabaseResponse {
  id: string;
  aud: string;
  role: string;
  email: string;
  phone: string;
  confirmation_sent_at: string;
  app_metadata: AppMetadata;
  user_metadata: UserMetadata;
  identities: Identity[];
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
}

export interface AppMetadata {
  provider: string;
  providers: string[];
}

export interface UserMetadata {
  email: string;
  email_verified: boolean;
  phone_verified: boolean;
  sub: string;
}

export interface Identity {
  identity_id: string;
  id: string;
  user_id: string;
  identity_data: IdentityData;
  provider: string;
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
  email: string;
}

export interface IdentityData {
  email: string;
  email_verified: boolean;
  phone_verified: boolean;
  sub: string;
}

export interface Session {
  // Session will have properties when user is logged in
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  user?: UserSupabaseResponse;
}
