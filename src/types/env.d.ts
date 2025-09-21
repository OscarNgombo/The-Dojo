declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VITE_API_BASE_URL?: string
      REACT_APP_API_BASE_URL?: string
      VITE_ADMIN_BEARER_TOKEN?: string
      REACT_APP_JWT_SECRET?: string
    }
  }
}

export {}
