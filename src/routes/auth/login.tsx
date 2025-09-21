import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../providers'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Form,
  FormGroup,
  Input,
  Button,
  Spinner,
  GoogleButton,
} from '../../components/ui'
import { Link } from '@tanstack/react-router'
import styles from './auth.module.css'
import { useEffect } from 'react'
import { initializeGoogleAuth, signInWithGoogle } from '../../utils/googleAuth'

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
})

function LoginPage() {
  const { login, loginWithGoogle, error, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    initializeGoogleAuth().catch((error) => {
      console.error('Failed to initialize Google Auth:', error)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return
    }

    try {
      await login({ email, password })
      navigate({ to: '/' })
    } catch (error) {
      console.error('Login failed', error)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const token = await signInWithGoogle()
      console.log('Google authentication successful, processing token...')
      await loginWithGoogle(token)
      navigate({ to: '/' })
    } catch (error) {
      console.error('Google login failed', error)
    }
  }

  return (
    <div className={styles.authContainer}>
      <Card className={styles.authCard}>
        <CardHeader>
          <h1 className={styles.authTitle}>Login to The Dojo</h1>
        </CardHeader>

        <CardBody>
          <Form onSubmit={handleSubmit}>
            {error && <div className={styles.authError}>{error}</div>}

            <FormGroup>
              <Input
                label="Email"
                type="email"
                id="email"
                name="email"
                required
                autoComplete="email"
                disabled={loading}
                placeholder="Enter your email"
              />
            </FormGroup>

            <FormGroup>
              <Input
                label="Password"
                type="password"
                id="password"
                name="password"
                required
                autoComplete="current-password"
                disabled={loading}
                placeholder="Enter your password"
              />
            </FormGroup>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="small" color="light" />
                  <span style={{ marginLeft: '8px' }}>Logging in...</span>
                </>
              ) : (
                'Login'
              )}
            </Button>

            <div className={styles.formDivider}>
              <span>Or</span>
            </div>

            <div className={styles.socialLoginContainer}>
              <GoogleButton onClick={handleGoogleLogin} disabled={loading} />
            </div>
          </Form>
        </CardBody>
        <CardFooter>
          <div className={styles.authLinks}>
            Don't have an account? <Link to="/auth/register">Register</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
