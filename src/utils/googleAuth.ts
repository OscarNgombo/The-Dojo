// Types for Google Identity Services
interface GoogleCredentialResponse {
  clientId: string
  credential: string
  select_by: string
}

// Interface for Google User profile data
export interface GoogleUserProfile {
  email: string
  name: string
  picture: string
  sub: string // Google's user ID
}

// Google auth configuration
const GOOGLE_CLIENT_ID =
  '43014341561-33pcl48dtodtgs1js2oevciba674tu09.apps.googleusercontent.com'

/**
 * Initialize Google Identity Services
 * This should be called once when the application starts
 */
export const initializeGoogleAuth = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if the script is already added
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      // If script is already present, just wait for window.google
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Poll for the google object to be ready
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    };
    script.onerror = () => {
      reject(new Error('Failed to load Google Identity Services script.'));
    };
    document.head.appendChild(script);
  });
};

/**
 * Prompt the user to sign in with Google
 * Returns the ID token that can be sent to the backend
 *
 * This implementation uses a One Tap flow compatible with FedCM
 */
export const signInWithGoogle = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error('Google Identity Services not loaded'))
      return
    }

    try {
      // Create a container for the Google Sign-In button
      const googleButtonContainer = document.createElement('div')
      googleButtonContainer.id = 'google-button-container'
      googleButtonContainer.style.display = 'none'
      document.body.appendChild(googleButtonContainer)

      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: GoogleCredentialResponse) => {
          // Clean up the container
          if (googleButtonContainer) {
            document.body.removeChild(googleButtonContainer)
          }

          if (response.credential) {
            resolve(response.credential)
          } else {
            reject(new Error('Google sign-in failed'))
          }
        },
        // Enable auto_select for a smoother experience
        auto_select: true,
        // Add cancel_on_tap_outside to prevent the prompt from being dismissed too easily
        cancel_on_tap_outside: false,
      })

      // Render a hidden button to trigger the Sign-In flow
      window.google.accounts.id.renderButton(googleButtonContainer, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
      })

      // Programmatically click the button
      const googleButton = googleButtonContainer.querySelector(
        'div[role="button"]',
      ) as HTMLElement
      if (googleButton) {
        googleButton.click()
      } else {
        // If button isn't found, try the prompt flow as a fallback
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Clean up the container
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

// Add the decodeGoogleToken function
/**
 * Decode the JWT token returned by Google to get user information
 */
export const decodeGoogleToken = (token: string): GoogleUserProfile => {
  try {
    // JWT tokens are in format: header.payload.signature
    const base64Url = token.split('.')[1] // Get the payload
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

/**
 * Debug Google Sign-In issues
 */
export const debugGoogleSignIn = (): void => {
  if (!window.google) {
    console.error('Google Identity Services not loaded')
    return
  }

  console.log('Google Identity Services is loaded')

  // Check if the client ID is valid
  console.log('Using Client ID:', GOOGLE_CLIENT_ID)

  // Try to retrieve the stored Google credentials
  const storedCredential = localStorage.getItem('g_state')
  console.log(
    'Stored Google credential state:',
    storedCredential ? 'Present' : 'Not found',
  )
}

// Add type declaration for window object to include Google Identity Services
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
