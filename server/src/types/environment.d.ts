declare global {
  namespace NodeJS {
    interface ProccessEnv {
      CLIENT_URL: string;
      PORT: string;
      NODE_ENV: string;
    }
  }
}

export {};
