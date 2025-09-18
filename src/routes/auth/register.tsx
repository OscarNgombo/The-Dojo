import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../providers';
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
  GoogleButton
} from '../../shared/components/ui';
import { Link } from '@tanstack/react-router';
import styles from './auth.module.css';
import { useState, useEffect } from 'react';
import { initializeGoogleAuth, signInWithGoogle } from '../../utils/googleAuth';

export const Route = createFileRoute('/auth/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const { register, loginWithGoogle, error, loading } = useAuth();
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Initialize Google Auth when component mounts
  useEffect(() => {
    initializeGoogleAuth().catch(error => {
      console.error('Failed to initialize Google Auth:', error);
    });
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    
    if (!name || !email || !password || !confirmPassword) {
      return;
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setPasswordError(null);
    
    try {
      await register({ name, email, password });
      navigate({ to: '/' });
    } catch (error) {
      // Error is already handled in the auth provider
      console.error('Registration failed', error);
    }
  };

  // Handle Google signup
  const handleGoogleSignup = async () => {
    try {
      // Request Google sign-in and get the token
      const token = await signInWithGoogle();
      console.log('Google authentication successful, processing token...');
      
      // Send the token to our backend via the auth provider
      await loginWithGoogle(token);
      navigate({ to: '/' });
    } catch (error) {
      console.error('Google signup failed', error);
      // Add more detailed error handling for debugging
      if (error instanceof Error) {
        setPasswordError(`Google Sign-In failed: ${error.message}`);
      } else {
        setPasswordError('Google Sign-In failed for unknown reason');
      }
    }
  };

  return (
    <div className={styles.authContainer}>
      <Card className={styles.authCard}>
        <CardHeader>
          <h1 className={styles.authTitle}>Join The Dojo</h1>
        </CardHeader>
        
        <CardBody>
          <Form onSubmit={handleSubmit}>
            {error && (
              <div className={styles.authError}>
                {error}
              </div>
            )}
            
            {passwordError && (
              <div className={styles.authError}>
                {passwordError}
              </div>
            )}
            
            <FormGroup>
              <Input
                label="Full Name"
                type="text" 
                id="name"
                name="name" 
                required
                disabled={loading}
                placeholder="Enter your full name"
              />
            </FormGroup>
            
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
                autoComplete="new-password"
                disabled={loading}
                placeholder="Create a password"
                helperText="Password must be at least 6 characters"
              />
            </FormGroup>
            
            <FormGroup>
              <Input
                label="Confirm Password"
                type="password" 
                id="confirmPassword"
                name="confirmPassword" 
                required
                autoComplete="new-password"
                disabled={loading}
                placeholder="Confirm your password"
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
                  <span style={{ marginLeft: '8px' }}>Registering...</span>
                </>
              ) : (
                'Register'
              )}
            </Button>

            <div className={styles.formDivider}>
              <span>Or</span>
            </div>

            <div className={styles.socialLoginContainer}>
              <GoogleButton
                onClick={handleGoogleSignup}
                disabled={loading}
                label="Sign up with Google"
              />
            </div>
          </Form>
        </CardBody>
        
        <CardFooter>
          <div className={styles.authLinks}>
            Already have an account? <Link to="/auth/login">Login</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}