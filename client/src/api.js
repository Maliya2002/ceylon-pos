// API Client for POS System

const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('pos_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Built-in Web Audio API Sound Chimes (Zero external files needed)
export function playKitchenChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    // Audio context may require user interaction first
  }
}

export function playCashChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
    osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08); // E6
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
}

export const api = {
  // Auth
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    if (data.token) {
      localStorage.setItem('pos_token', data.token);
      localStorage.setItem('pos_user', JSON.stringify(data.user));
    }
    return data;
  },

  getCurrentUser() {
    try {
      const u = localStorage.getItem('pos_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return await res.json();
  },

  // Products
  async getProducts() {
    const res = await fetch(`${API_BASE}/products`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
  },

  async addProduct(productData) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create product');
    return data;
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update product');
    return data;
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete product');
    return data;
  },

  async toggleProductStatus(id) {
    const res = await fetch(`${API_BASE}/products/${id}/toggle-status`, {
      method: 'PATCH',
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Failed to toggle status');
    return await res.json();
  },

  // Tables
  async getTables() {
    const res = await fetch(`${API_BASE}/tables`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Failed to fetch tables');
    return await res.json();
  },

  // Orders
  async getActiveOrders() {
    const res = await fetch(`${API_BASE}/orders/active`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Failed to fetch active orders');
    return await res.json();
  },

  async createOrder(orderPayload) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(orderPayload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create order');
    playKitchenChime();
    return data;
  },

  async addItemsToOrder(orderId, items, notes) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/add-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ items, notes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add items');
    playKitchenChime();
    return data;
  },

  async updateOrderStatus(orderId, status) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return await res.json();
  },

  async checkoutOrder(orderId, checkoutPayload) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(checkoutPayload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to process checkout');
    playCashChime();
    return data;
  },

  // Reports
  async getDailySummary(dateString) {
    const url = dateString ? `${API_BASE}/reports/daily-summary?date=${dateString}` : `${API_BASE}/reports/daily-summary`;
    const res = await fetch(url, {
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Failed to fetch daily summary');
    return await res.json();
  },
};
