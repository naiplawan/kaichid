// API helper functions for client-side usage

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || '';

export const api = {
  // Questions API
  getQuestions: async (params?: { level?: string; theme?: string; exclude?: string[] }) => {
    const searchParams = new URLSearchParams();
    if (params?.level) searchParams.append('level', params.level);
    if (params?.theme) searchParams.append('theme', params.theme);
    if (params?.exclude?.length) searchParams.append('exclude', params.exclude.join(','));

    const response = await fetch(`${API_BASE_URL}/api/questions?${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch questions');
    return response.json();
  },

  submitQuestion: async (questionData: { text: string; level: string; theme: string; creator_id: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/questions/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionData),
    });
    if (!response.ok) throw new Error('Failed to submit question');
    return response.json();
  },

  reportQuestion: async (questionId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/questions/${questionId}/report`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to report question');
    return response.json();
  },

  // Rooms API
  createRoom: async (roomData: { creator_id: string; max_players?: number; settings?: any }) => {
    const response = await fetch(`${API_BASE_URL}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomData),
    });
    if (!response.ok) throw new Error('Failed to create room');
    return response.json();
  },

  getRoomByCode: async (code: string) => {
    const response = await fetch(`${API_BASE_URL}/api/rooms?code=${code}`);
    if (!response.ok) throw new Error('Failed to get room');
    return response.json();
  },

  // Saved Questions API
  getSavedQuestions: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/saved-questions?user_id=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch saved questions');
    return response.json();
  },

  saveQuestion: async (data: {
    user_id: string;
    question_id: string;
    response?: string;
    privacy?: 'private' | 'shared';
  }) => {
    const response = await fetch(`${API_BASE_URL}/api/saved-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to save question');
    return response.json();
  },

  deleteSavedQuestion: async (id: string, userId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/saved-questions`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, user_id: userId }),
    });
    if (!response.ok) throw new Error('Failed to delete saved question');
    return response.json();
  },
};

export default api;
