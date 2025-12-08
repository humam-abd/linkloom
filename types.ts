export interface User {
  id: string;
  email: string;
  name?: string;
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
  theme: 'light' | 'dark' | 'colorful';
  createdAt: number;
}

export enum ViewState {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  DASHBOARD = 'DASHBOARD',
  EDITOR = 'EDITOR',
  PUBLIC_VIEW = 'PUBLIC_VIEW'
}