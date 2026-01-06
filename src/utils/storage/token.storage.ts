/**
 * Token Storage Utility
 * Manages JWT tokens in secure storage (using localStorage for now as per web standards, httpOnly cookies preferred if backend supports)
 */

const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
};

export const tokenStorage = {
    getToken: (): string | null => {
        return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    },

    setToken: (token: string): void => {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    },

    clearToken: (): void => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    },

    getRefreshToken: (): string | null => {
        return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    },

    setRefreshToken: (token: string): void => {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    },

    clearRefreshToken: (): void => {
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    },

    getUserData: <T>(): T | null => {
        const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        return data ? JSON.parse(data) : null;
    },

    setUserData: <T>(data: T): void => {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
    },

    clearUserData: (): void => {
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    },

    clearAll: (): void => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
};
