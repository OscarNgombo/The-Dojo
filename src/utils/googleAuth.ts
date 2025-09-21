interface GoogleCredentialResponse {
  clientId: string
  credential: string
  select_by: string
}

export interface GoogleUserProfile {
  email: string
  name: string
  picture: string
  sub: string
}

const GOOGLE_CLIENT_ID =
  '43014341561-33pcl48dtodtgs1js2oevciba674tu09.apps.googleusercontent.com'

export const initializeGoogleAuth = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (
      document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]',
      )
    ) {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval)
          resolve()
        }
      }, 100)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval)
          resolve()
        }
      }, 100)
    }
    script.onerror = () => {
      reject(new Error('Failed to load Google Identity Services script.'))
    }
    document.head.appendChild(script)
  })
}

export const signInWithGoogle = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error('Google Identity Services not loaded'))
      return
    }

    try {
      const googleButtonContainer = document.createElement('div')
      googleButtonContainer.id = 'google-button-container'
      googleButtonContainer.style.display = 'none'
      document.body.appendChild(googleButtonContainer)

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: GoogleCredentialResponse) => {
          if (googleButtonContainer) {
            document.body.removeChild(googleButtonContainer)
          }

          if (response.credential) {
            resolve(response.credential)
          } else {
            reject(new Error('Google sign-in failed'))
          }
        },
        auto_select: true,
        cancel_on_tap_outside: false,
      })

      window.google.accounts.id.renderButton(googleButtonContainer, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
      })

      const googleButton = googleButtonContainer.querySelector(
        'div[role="button"]',
      ) as HTMLElement
      if (googleButton) {
        googleButton.click()
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            if (googleButtonContainer) {
              document.body.removeChild(googleButtonContainer)
            }
            reject(new Error('Google sign-in prompt not displayed or skipped'))
          }
        })
      }
    } catch (error) {
      reject(error)
    }
  })
}

export const decodeGoogleToken = (token: string): GoogleUserProfile => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )

    return JSON.parse(jsonPayload) as GoogleUserProfile
  } catch (error) {
    console.error('Error decoding Google token:', error)
    throw new Error('Invalid token format')
  }
}

export const debugGoogleSignIn = (): void => {
  if (!window.google) {
    console.error('Google Identity Services not loaded')
    return
  }
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: (callback: (notification: any) => void) => void
          renderButton: (parent: HTMLElement, options: any) => void
          disableAutoSelect: () => void
        }
      }
    }
  }
}
