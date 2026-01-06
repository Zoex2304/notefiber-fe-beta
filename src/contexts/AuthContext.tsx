/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type User } from '../api/services/auth/auth.types';
import { tokenStorage } from '../utils/storage/token.storage';
import { userService } from '../api/services/user/user.service';
import { authService } from '../api/services/auth/auth.service';
import { debugLog } from '../utils/debug/LogOverlay';
import { queryClient } from './QueryClientProvider';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            // Check for token in URL (OAuth redirect)
            const searchParams = new URLSearchParams(window.location.search);
            const urlToken = searchParams.get('token') || searchParams.get('access_token');
            const storedToken = tokenStorage.getToken();

            debugLog.info("AuthContext Init: Checking for token", { urlToken: !!urlToken, storedToken: !!storedToken, rawUrl: window.location.href });

            const token = urlToken || storedToken;

            if (urlToken) {
                // If token comes from URL, save it and clean URL
                debugLog.info("AuthContext: Found URL token, saving...", urlToken.substring(0, 10) + "...");
                tokenStorage.setToken(urlToken);
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            if (token) {
                try {
                    debugLog.info("AuthContext: Attempting to fetch profile with token");
                    const response = await userService.getProfile();
                    debugLog.info("AuthContext: Profile fetch response", response);
                    if (response.success && response.data) {
                        setUser(response.data as unknown as User);
                    } else {
                        throw new Error("Profile fetch failed");
                    }
                } catch (error) {
                    debugLog.error("AuthContext: Profile fetch error", error);

                    // Try to refresh token
                    const refreshToken = tokenStorage.getRefreshToken();
                    if (refreshToken) {
                        try {
                            debugLog.info("AuthContext: Attempting to refresh token...");
                            const refreshResponse = await authService.refreshToken({ refresh_token: refreshToken });

                            if (refreshResponse.success && refreshResponse.data) {
                                debugLog.info("AuthContext: Refresh successful");
                                tokenStorage.setToken(refreshResponse.data.access_token);
                                if (refreshResponse.data.refresh_token) {
                                    tokenStorage.setRefreshToken(refreshResponse.data.refresh_token);
                                }
                                setUser(refreshResponse.data.user);
                            } else {
                                throw new Error("Refresh failed - invalid response");
                            }
                        } catch (refreshError) {
                            debugLog.error("AuthContext: Refresh token failed", refreshError);
                            tokenStorage.clearAll();
                            setUser(null);
                        }
                    } else {
                        // No refresh token, clear everything
                        tokenStorage.clearAll();
                        setUser(null);
                    }
                }
            } else {
                // Check if we have a refresh token even if no access token
                const refreshToken = tokenStorage.getRefreshToken();
                if (refreshToken) {
                    try {
                        debugLog.info("AuthContext: No access token, but found refresh token. Attempting refresh...");
                        const refreshResponse = await authService.refreshToken({ refresh_token: refreshToken });

                        if (refreshResponse.success && refreshResponse.data) {
                            debugLog.info("AuthContext: Refresh successful");
                            tokenStorage.setToken(refreshResponse.data.access_token);
                            if (refreshResponse.data.refresh_token) {
                                tokenStorage.setRefreshToken(refreshResponse.data.refresh_token);
                            }
                            setUser(refreshResponse.data.user);
                        } else {
                            throw new Error("Refresh failed - invalid response");
                        }
                    } catch (refreshError) {
                        debugLog.error("AuthContext: Refresh token failed", refreshError);
                        tokenStorage.clearAll();
                        setUser(null);
                    }
                } else {
                    debugLog.info("AuthContext: No tokens found");
                    tokenStorage.clearAll();
                    setUser(null);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = (token: string, userData: User) => {
        tokenStorage.setToken(token);
        tokenStorage.setUserData(userData);
        setUser(userData);
    };

    const logout = async () => {
        const refreshToken = tokenStorage.getRefreshToken();
        if (refreshToken) {
            try {
                debugLog.info("AuthContext: Logging out from backend...");
                await authService.logout({ refresh_token: refreshToken });
            } catch (error) {
                debugLog.error("AuthContext: Logout backend call failed", error);
            }
        } else {
            debugLog.info("AuthContext: No refresh token found, skipping backend logout");
        }

        tokenStorage.clearAll();
        setUser(null);
        queryClient.removeQueries(); // Clear all data
        queryClient.clear(); // Clear all cache
    };

    const updateUser = (userData: User) => {
        setUser(userData);
        tokenStorage.setUserData(userData);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
