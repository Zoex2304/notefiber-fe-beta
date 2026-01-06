/**
 * API Configuration
 * Centralized configuration for API client
 */

const envUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const BASE_URL = envUrl.endsWith("/api") ? envUrl : `${envUrl}/api`;

export const API_CONFIG = {
  BASE_URL,
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
} as const;
