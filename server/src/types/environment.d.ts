declare global {
    namespace NodeJS {
        interface ProccessEnv {
            CLIENT_URL: string;
            PORT: string;
            NODE_ENV: string;
            MONGODB_URI: string;
            GOOGLE_CLIENT_ID: string;
            GOOGLE_CLIENT_SECRET: string;
            GOOGLE_CALLBACK_URL: string;
            JWT_SECRET_KEY: string;
            SESSION_SECRET: string;
        }
    }
}

export {};
