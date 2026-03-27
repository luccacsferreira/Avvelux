import { GoogleGenAI } from "@google/genai";

// Mock data for initial state
const MOCK_DATA = {
  User: [
    { id: 'user_1', full_name: 'Demo User', email: 'demo@example.com', avatar_url: 'https://picsum.photos/seed/user1/200' }
  ],
  Video: [
    { id: '1', title: 'Welcome to the New Platform', thumbnail_url: 'https://picsum.photos/seed/v1/600/400', views: 1200, creator_name: 'Admin', category: 'General', created_date: new Date().toISOString() },
    { id: '2', title: 'Getting Started Guide', thumbnail_url: 'https://picsum.photos/seed/v2/600/400', views: 850, creator_name: 'Admin', category: 'Tech', created_date: new Date().toISOString() }
  ],
  Clip: [
    { id: 'c1', title: 'Epic Moment', thumbnail_url: 'https://picsum.photos/seed/c1/400/600', views: 5000, creator_name: 'GamerPro', created_date: new Date().toISOString() }
  ],
  Post: [
    { id: 'p1', content: 'Hello world! This is my first post on the new platform.', creator_name: 'Demo User', created_date: new Date().toISOString(), likes: 10 }
  ],
  Group: [
    { id: 'g1', name: 'Tech Enthusiasts', description: 'Discussing the latest in tech.', category: 'Tech', member_count: 150, image_url: 'https://picsum.photos/seed/g1/400/300' }
  ],
  DirectMessage: [],
  Follow: [],
  WatchHistory: [],
  LikedContent: [],
  Wishlist: [],
  Course: [],
  Note: [],
  WatchLater: [],
  Story: [],
  Playlist: [],
  AIChat: [],
  ChatMessage: [],
  ForumPost: [],
  Comment: []
};

// Initialize local storage with mock data if empty
Object.keys(MOCK_DATA).forEach(key => {
  if (!localStorage.getItem(`db_${key}`)) {
    localStorage.setItem(`db_${key}`, JSON.stringify(MOCK_DATA[key]));
  }
});

const getDb = (entity) => JSON.parse(localStorage.getItem(`db_${entity}`) || '[]');
const saveDb = (entity, data) => localStorage.setItem(`db_${entity}`, JSON.stringify(data));

// Gemini AI initialization
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const apiClient = {
  auth: {
    me: async () => {
      const users = getDb('User');
      return users[0] || null;
    },
    updateMe: async (data) => {
      const users = getDb('User');
      if (users[0]) {
        users[0] = { ...users[0], ...data };
        saveDb('User', users);
      }
      return users[0];
    }
  },
  entities: Object.keys(MOCK_DATA).reduce((acc, entity) => {
    acc[entity] = {
      list: async (sort, limit) => {
        let data = getDb(entity);
        if (sort) {
          const field = sort.startsWith('-') ? sort.substring(1) : sort;
          data.sort((a, b) => {
            if (a[field] < b[field]) return sort.startsWith('-') ? 1 : -1;
            if (a[field] > b[field]) return sort.startsWith('-') ? -1 : 1;
            return 0;
          });
        }
        return limit ? data.slice(0, limit) : data;
      },
      filter: async (filters, sort, limit) => {
        let data = getDb(entity).filter(item => {
          return Object.entries(filters).every(([key, value]) => item[key] === value);
        });
        if (sort) {
          const field = sort.startsWith('-') ? sort.substring(1) : sort;
          data.sort((a, b) => {
            if (a[field] < b[field]) return sort.startsWith('-') ? 1 : -1;
            if (a[field] > b[field]) return sort.startsWith('-') ? -1 : 1;
            return 0;
          });
        }
        return limit ? data.slice(0, limit) : data;
      },
      create: async (data) => {
        const db = getDb(entity);
        const newItem = { id: Math.random().toString(36).substr(2, 9), created_date: new Date().toISOString(), ...data };
        db.push(newItem);
        saveDb(entity, db);
        return newItem;
      },
      update: async (id, data) => {
        const db = getDb(entity);
        const index = db.findIndex(item => item.id === id);
        if (index !== -1) {
          db[index] = { ...db[index], ...data };
          saveDb(entity, db);
          return db[index];
        }
        throw new Error('Item not found');
      },
      delete: async (id) => {
        const db = getDb(entity);
        const filtered = db.filter(item => item.id !== id);
        saveDb(entity, filtered);
        return { success: true };
      }
    };
    return acc;
  }, {}),
  integrations: {
    Core: {
      InvokeLLM: async ({ prompt, systemInstruction }) => {
        try {
          const model = genAI.models.getGenerativeModel({ 
            model: "gemini-3-flash-preview",
            systemInstruction: systemInstruction
          });
          const result = await model.generateContent(prompt);
          return { text: result.response.text() };
        } catch (error) {
          console.error('Gemini error:', error);
          return { text: "I'm sorry, I'm having trouble connecting right now." };
        }
      },
      UploadFile: async ({ file }) => {
        // Mock file upload - in a real app, you'd upload to S3/Firebase Storage
        return { file_url: URL.createObjectURL(file) };
      }
    }
  },
  appLogs: {
    logUserInApp: async () => ({ success: true })
  }
};

// Export as base44 for easy replacement if needed, but better to rename imports
export const base44 = apiClient;
