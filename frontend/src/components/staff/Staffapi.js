import axios from "axios";

export const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

// Change these if your JWT routes are somewhere else
const TOKEN_URL = `${API_URL}/api/token/`;
const REFRESH_URL = `${API_URL}/api/token/refresh/`;

const ACCESS_KEY = "staff_access";
const REFRESH_KEY = "staff_refresh";

export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

export const staffApi = axios.create({ baseURL: `${API_URL}/api/staff` });

staffApi.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// When the access token expires, get a new one and retry once
let refreshing = null;

staffApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      getRefreshToken()
    ) {
      original._retry = true;

      try {
        if (!refreshing) {
          refreshing = axios
            .post(REFRESH_URL, { refresh: getRefreshToken() })
            .then((response) => response.data)
            .finally(() => {
              refreshing = null;
            });
        }
        const data = await refreshing;

        localStorage.setItem(ACCESS_KEY, data.access);
        if (data.refresh) localStorage.setItem(REFRESH_KEY, data.refresh);

        original.headers.Authorization = `Bearer ${data.access}`;
        return staffApi(original);
      } catch (refreshError) {
        clearTokens();
        window.location.assign("/staff/login");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/** Signs in and returns the staff profile. Throws if the person has no car access. */
export const staffLogin = async (username, password) => {
  const { data } = await axios.post(TOKEN_URL, { username, password });
  localStorage.setItem(ACCESS_KEY, data.access);
  localStorage.setItem(REFRESH_KEY, data.refresh);

  const { data: me } = await staffApi.get("/me/");
  if (!me.can.view) {
    clearTokens();
    const error = new Error("no-access");
    error.code = "no-access";
    throw error;
  }
  return me;
};

export const getImageUrl = (path) => {
  try {
    return new URL(path, `${API_URL}/`).toString();
  } catch {
    return null;
  }
};

// DRF returns either a plain list or { results: [...] } when paginated
export const asList = (data) =>
  Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];