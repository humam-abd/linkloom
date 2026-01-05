import { UploadApiResponse } from "cloudinary";

export interface User {
  id: string;
  email: string;
  name?: string;
  password?: string;
}

export interface LinkItem {
  id?: string;
  url: string;
  image: string;
  description?: string;
  user_id?: string;
  collection_id?: string;
  position?: number;
  created_at?: string;
}

export interface LinkItemInputType {
  id?: string;
  url: string;
  image: string;
  description?: string;
  user_id?: string;
  collection_id?: string;
  position?: number;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string;
  items?: LinkItem[];
  is_public?: boolean;
  created_at?: string;
  image?: string;
}

export interface CollectionInputType {
  id: string;
  name: string;
  description: string;
  is_public?: boolean;
  image?: string;
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

export interface ImageDataResponse {
  message: string;
  url: string;
  details: UploadApiResponse;
}
