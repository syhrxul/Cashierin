// API Base URL - Strictly using production as requested
const API_BASE_URL = 'https://cashierin.syhrulimtkhan.my.id/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // Ensure we are in a browser context for localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle session expiration
    if (response.status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    const responseText = await response.text();
    let data = {};

    try {
      if (responseText) {
        data = JSON.parse(responseText);
      }
    } catch (e) {
      // If it's not JSON, it might be an HTML error page from the server
      console.error('[API JSON Parse Error]:', responseText);
      throw new Error(`Respons server bukan JSON (Status: ${response.status})`);
    }

    if (!response.ok) {
      console.error(`[API Error] Status ${response.status}:`, { url, data });

      if (response.status === 403) throw new Error((data as any).message || 'Izin akses ditolak (403).');
      if (response.status === 404) throw new Error('Endpoint tidak ditemukan (404).');
      if (response.status === 422 && (data as any).errors) {
        const errors: any = Object.values((data as any).errors)[0];
        throw new Error(errors[0] || 'Validasi gagal.');
      }

      throw new Error((data as any).message || (data as any).error || `Kesalahan sistem (${response.status})`);
    }

    return data;
  } catch (error: any) {
    console.error('[Network/API Fetch Error]:', error);
    throw error;
  }
}
