import { createFileRoute } from '@tanstack/react-router';
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
  Spinner
} from '../../shared/components/ui';
import { Link } from '@tanstack/react-router';
import styles from './auth.module.css';

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
});

function LoginPage() {
  const { login, error, loading } = useAuth();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    if (!email || !password) {
      return;
    }
    
    try {
      await login({ email, password });
    } catch (error) {
      // Error is already handled in the auth provider
      console.error('Login failed', error);
    }
  };

  return (
    <div className={styles.authContainer}>
      <Card className={styles.authCard}>
        <CardHeader>
          <h1 className={styles.authTitle}>Login to The Dojo</h1>
        </CardHeader>
        
        <CardBody>
          <Form onSubmit={handleSubmit}>
            {error && (
              <div className={styles.authError}>
                {error}
              </div>
            )}
            
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
          </Form>
        </CardBody>
        
        <CardFooter>
          <div className={styles.authLinks}>
            <p>
              Don't have an account? <Link to="/auth/register">Register</Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}