// API Base URL - Strictly using production as requested
const API_BASE_URL = 'https://cashierin.syhrulimtkhan.my.id/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // Ensure we are in a browser context for localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  // Guest endpoints that shouldn't leak old/expired tokens
  const isGuestRoute = cleanEndpoint === '/login' || cleanEndpoint === '/register' || cleanEndpoint === '/register/invite';

  const isFormData = options.body instanceof FormData;
  const headers: any = {
    'Accept': 'application/json',
    ...(token && !isGuestRoute ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
    });

    // Handle session expiration (only for non-login pages)
    if (response.status === 401 && !isGuestRoute) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    const responseText = await response.text();
    let data: any = {};

    try {
      if (responseText) {
        data = JSON.parse(responseText);
      }
    } catch (e) {
      // If it's not JSON, it might be an HTML error page from the server
      console.error('[API JSON Parse Error]:', responseText);
      throw new Error(`Respons server bukan JSON (Status: ${response.status}). Hubungi administrator.`);
    }

    if (!response.ok) {
      // Don't log 401 as an "Error" if we're already handling it via redirect
      if (response.status !== 401) {
        console.error(`[API Error] Status ${response.status}:`, { url, data });
      }

      // Handle Laravel Validation Errors (422)
      if (response.status === 422 && data.errors) {
        const firstError: any = Object.values(data.errors)[0];
        throw new Error(firstError[0] || 'Validasi input gagal.');
      }

      // Handle specific status codes
      if (response.status === 401) throw new Error('Unauthenticated');
      if (response.status === 403) throw new Error(data.message || 'Izin akses ditolak (403).');
      if (response.status === 404) throw new Error(data.message || 'Endpoint tidak ditemukan (404).');
      if (response.status === 500) throw new Error(data.message || 'Terjadi kesalahan internal pada server (500).');

      throw new Error(data.message || data.error || `Kesalahan sistem (${response.status})`);
    }

    return data;
  } catch (error: any) {
    const isAuthError = error.message?.includes('Unauthenticated');
    if (!isAuthError) {
      console.error('[Network/API Fetch Error]:', error);
    }
    throw error;
  }
}
