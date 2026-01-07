import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

interface AdminUser {
    id: string;
    email: string;
    full_name: string;
    role: 'admin';
}

interface AdminAuthContextType {
    admin: AdminUser | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const envUrl = import.meta.env.VITE_API_BASE_URL || 'https://notefiber-be-beta-production.up.railway.app';
const API_BASE_URL = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        const storedAdmin = localStorage.getItem('admin_user');

        if (token && storedAdmin) {
            try {
                setAdmin(JSON.parse(storedAdmin));
            } catch (error) {
                console.error('Failed to parse stored admin data:', error);
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            // Using correct admin login endpoint
            const response = await axios.post(`${API_BASE_URL}/admin/login`, {
                email,
                password,
            });

            // The backend returns { access_token, refresh_token, user: { id, email, full_name, role } }
            const { access_token, refresh_token, user } = response.data.data;

            // Construct admin user object from response's user object
            const adminUser: AdminUser = {
                id: user.id,
                email: user.email,
                full_name: user.full_name || 'Admin',
                role: user.role || 'admin'
            };

            // Store tokens and user info
            localStorage.setItem('admin_token', access_token);
            if (refresh_token) {
                localStorage.setItem('admin_refresh_token', refresh_token);
            }
            localStorage.setItem('admin_user', JSON.stringify(adminUser));

            setAdmin(adminUser);
        } catch (error) {
            console.error('Admin login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setAdmin(null);
    };

    return (
        <AdminAuthContext.Provider
            value={{
                admin,
                login,
                logout,
                isAuthenticated: !!admin,
                isLoading,
            }}
        >
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
};
