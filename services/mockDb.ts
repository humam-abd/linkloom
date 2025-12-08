import { Collection, LinkItem, User } from '../types';

// Keys for local storage
const STORAGE_KEYS = {
  USERS: 'linkloom_users',
  COLLECTIONS: 'linkloom_collections',
  CURRENT_USER: 'linkloom_current_user'
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Database Service
export const MockDb = {
  // Auth
  async login(email: string): Promise<User> {
    await delay(600);
    const usersStr = localStorage.getItem(STORAGE_KEYS.USERS) || '[]';
    const users: User[] = JSON.parse(usersStr);
    let user = users.find(u => u.email === email);
    
    if (!user) {
      // Auto-register for demo simplicity if not found, usually this would error
      user = { id: crypto.randomUUID(), email, name: email.split('@')[0] };
      users.push(user);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  },

  async logout(): Promise<void> {
    await delay(300);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser(): User | null {
    const u = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return u ? JSON.parse(u) : null;
  },

  // Collections
  async getCollections(userId: string): Promise<Collection[]> {
    await delay(400);
    const allStr = localStorage.getItem(STORAGE_KEYS.COLLECTIONS) || '[]';
    const all: Collection[] = JSON.parse(allStr);
    return all.filter(c => c.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  },

  async getCollectionById(id: string): Promise<Collection | null> {
    await delay(400);
    const allStr = localStorage.getItem(STORAGE_KEYS.COLLECTIONS) || '[]';
    const all: Collection[] = JSON.parse(allStr);
    return all.find(c => c.id === id) || null;
  },

  async saveCollection(collection: Collection): Promise<Collection> {
    await delay(600);
    const allStr = localStorage.getItem(STORAGE_KEYS.COLLECTIONS) || '[]';
    let all: Collection[] = JSON.parse(allStr);
    
    const index = all.findIndex(c => c.id === collection.id);
    if (index >= 0) {
      all[index] = collection;
    } else {
      all.push(collection);
    }
    
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(all));
    return collection;
  },

  async deleteCollection(id: string): Promise<void> {
    await delay(400);
    const allStr = localStorage.getItem(STORAGE_KEYS.COLLECTIONS) || '[]';
    let all: Collection[] = JSON.parse(allStr);
    all = all.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(all));
  }
};