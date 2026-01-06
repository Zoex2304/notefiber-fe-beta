interface Config {
    baseUrl: string;
}

export const AppConfig: Config = {
    baseUrl: import.meta.env.VITE_API_BASE_URL
}