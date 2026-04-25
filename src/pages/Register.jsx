import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import SuccessModal from '@/components/common/SuccessModal';
import { useTheme } from '@/lib/theme';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { signUpWithEmail, user } = useAuth();
  const navigate = useNavigate();
  const { isLight } = useTheme();

  // We don't auto-redirect here anymore to allow the success modal to show
  // useEffect(() => {
  //   if (user) {
  //     navigate('/');
  //   }
  // }, [user, navigate]);

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const result = await signUpWithEmail(email, password, displayName);
      if (result?.confirmationRequired) {
        setMessage('Check your email for a confirmation link!');
      } else {
        setShowSuccess(true);
      }
    } catch (err) {
      console.error('Registration error details:', err);
      setError('E-mail or password is wrong, please check your credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/');
  };

  return (
    <div className={`flex items-center justify-center min-h-screen ${isLight ? 'bg-gray-50' : 'bg-[#0a0a0a]'} p-4`}>
      <Card className={`w-full max-w-md ${isLight ? 'bg-white border-gray-200 shadow-xl' : 'bg-[#1a1a1a] border-gray-800'} text-white`}>
        <CardHeader className="space-y-1">
          <CardTitle className={`text-3xl font-bold text-center bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent`}>
            Register
          </CardTitle>
          <CardDescription className={`text-center ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            Create an account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleEmailRegister} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="displayName" className={isLight ? 'text-gray-700' : 'text-gray-300'}>Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className={`${isLight ? 'bg-gray-100 border-gray-200 text-black' : 'bg-[#2a2a2a] border-gray-700 text-white'} focus:ring-purple-500`}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className={isLight ? 'text-gray-700' : 'text-gray-300'}>Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`${isLight ? 'bg-gray-100 border-gray-200 text-black' : 'bg-[#2a2a2a] border-gray-700 text-white'} focus:ring-purple-500`}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className={isLight ? 'text-gray-700' : 'text-gray-300'}>Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`${isLight ? 'bg-gray-100 border-gray-200 text-black' : 'bg-[#2a2a2a] border-gray-700 text-white'} focus:ring-purple-500 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-400 focus:outline-none transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}
            {message && <p className="text-sm text-green-500 font-medium text-center">{message}</p>}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90 font-bold py-6" 
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-2">
          <div className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-sm`}>
            Already have an account?{' '}
            <Link to="/Login" className="text-purple-400 hover:underline font-bold">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>

      <SuccessModal 
        open={showSuccess} 
        onOpenChange={handleSuccessClose}
        title="Account Created!"
        message="Your account has been successfully created. Welcome to Avvelux!"
        buttonText="Get Started"
      />
    </div>
  );
};

export default Register;
