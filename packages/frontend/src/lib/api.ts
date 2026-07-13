const API_BASE = '/api/v1';

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Récupérer le token du localStorage côté client uniquement
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('accessToken', token);
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', headers = {}, body, params } = options;

    // Construire l'URL avec les paramètres
    let url = `${API_BASE}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // Headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (this.token) {
      requestHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new ApiError(
        `Erreur de connexion au serveur (${response.status})`,
        'NETWORK_ERROR',
        response.status
      );
    }

    if (!response.ok) {
      // Si le token a expiré, tenter de le rafraîchir
      if (response.status === 401 && this.token) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Réessayer la requête originale
          return this.request<T>(endpoint, options);
        }
      }
      throw new ApiError(
        data.error?.message || 'Une erreur est survenue',
        data.error?.code || 'UNKNOWN_ERROR',
        response.status,
        data.error?.details
      );
    }

    return data;
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        this.setToken(null);
        return false;
      }

      const data = await response.json();
      this.setToken(data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      return true;
    } catch {
      this.setToken(null);
      return false;
    }
  }

  // Auth
  async login(email: string, password: string) {
    const response = await this.request<{
      success: boolean;
      data: { user: unknown; tokens: { accessToken: string; refreshToken: string } };
    }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    this.setToken(response.data.tokens.accessToken);
    localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
    return response.data;
  }

  async register(data: { email: string; password: string; name: string; phone?: string; storeName?: string }) {
    const response = await this.request<{
      success: boolean;
      data: { user: unknown; tokens: { accessToken: string; refreshToken: string } };
    }>('/auth/register', {
      method: 'POST',
      body: data,
    });
    this.setToken(response.data.tokens.accessToken);
    localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
    return response.data;
  }

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await this.request('/auth/logout', {
        method: 'POST',
        body: { refreshToken },
      }).catch(() => {});
    }
    this.setToken(null);
  }

  async getProfile() {
    return this.request<{ success: boolean; data: unknown }>('/auth/profile');
  }

  async updateProfile(data: { name?: string; phone?: string; storeName?: string }) {
    return this.request<{ success: boolean; data: unknown }>('/auth/profile', {
      method: 'PATCH',
      body: data,
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request<{ success: boolean; data: import('@plateforme/shared').DashboardStats }>('/dashboard/stats');
  }

  async getRecentOrders() {
    return this.request<{ success: boolean; data: unknown[] }>('/dashboard/recent-orders');
  }

  async getTopProducts() {
    return this.request<{ success: boolean; data: unknown[] }>('/dashboard/top-products');
  }

  async getRevenue(period: string = '30d') {
    return this.request<{ success: boolean; data: unknown }>('/dashboard/revenue', {
      params: { period },
    });
  }

  // Produits
  async getProducts(params?: Record<string, string | number>) {
    return this.request<{ success: boolean; data: unknown[]; meta: unknown }>('/products', { params });
  }

  async getProduct(id: string) {
    return this.request<{ success: boolean; data: unknown }>(`/products/${id}`);
  }

  async createProduct(data: unknown) {
    return this.request<{ success: boolean; data: unknown }>('/products', {
      method: 'POST',
      body: data,
    });
  }

  async updateProduct(id: string, data: unknown) {
    return this.request<{ success: boolean; data: unknown }>(`/products/${id}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deleteProduct(id: string) {
    return this.request<{ success: boolean; data: unknown }>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Commandes
  async getOrders(params?: Record<string, string | number>) {
    return this.request<{ success: boolean; data: unknown[]; meta: unknown }>('/orders', { params });
  }

  async getOrder(id: string) {
    return this.request<{ success: boolean; data: unknown }>(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request<{ success: boolean; data: unknown }>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  // Notifications
  async getNotifications(params?: Record<string, string | number>) {
    return this.request<{ success: boolean; data: unknown[]; meta: { unreadCount: number } }>(
      '/notifications',
      { params }
    );
  }

  async markNotificationRead(id: string) {
    return this.request<{ success: boolean; data: unknown }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsRead() {
    return this.request<{ success: boolean; data: unknown }>('/notifications/read-all', {
      method: 'POST',
    });
  }

  // Clients
  async getCustomers(params?: Record<string, string | number>) {
    return this.request<{ success: boolean; data: unknown[]; meta: unknown }>('/customers', { params });
  }

  async getCustomer(id: string) {
    return this.request<{ success: boolean; data: unknown }>(`/customers/${id}`);
  }

  // Livraisons
  async getDeliveries(params?: Record<string, string | number>) {
    return this.request<{ success: boolean; data: unknown[]; meta: unknown }>('/delivery', { params });
  }

  async getDeliveryPersons(params?: Record<string, string | number>) {
    return this.request<{ success: boolean; data: unknown[] }>('/delivery/persons', { params });
  }

  async addDeliveryPerson(data: { name: string; phone: string; email?: string; zones: string[]; maxLoad?: number }) {
    return this.request<{ success: boolean; data: unknown }>('/delivery/persons', {
      method: 'POST',
      body: data,
    });
  }

  async deleteDeliveryPerson(id: string) {
    return this.request<{ success: boolean; data: unknown }>(`/delivery/persons/${id}`, {
      method: 'DELETE',
    });
  }

  async updateDeliveryStatus(id: string, status: string) {
    return this.request<{ success: boolean; data: unknown }>(`/delivery/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, string[]>;

  constructor(message: string, code: string, status: number, details?: Record<string, string[]>) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
    this.name = 'ApiError';
  }
}

export const api = new ApiClient();

// WebSocket connection
export function createWebSocket(token: string): WebSocket {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  const ws = new WebSocket(`${protocol}//${host}/ws?token=${token}`);

  ws.onopen = () => {
    console.log('[WS] Connecté au serveur WebSocket');
  };

  ws.onclose = (event) => {
    console.log('[WS] Déconnecté:', event.code, event.reason);
    // Reconnexion automatique après 5 secondes
    if (event.code !== 4001) {
      setTimeout(() => createWebSocket(token), 5000);
    }
  };

  ws.onerror = (error) => {
    console.error('[WS] Erreur:', error);
  };

  return ws;
}