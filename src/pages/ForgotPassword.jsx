import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import SuccessModal from '@/components/common/SuccessModal';
import { useTheme } from '@/lib/theme';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const { isLight } = useTheme();
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setShowSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/Login');
  };

  return (
    <div className={`flex items-center justify-center min-h-screen ${isLight ? 'bg-gray-50' : 'bg-[#0a0a0a]'} p-4`}>
      <Card className={`w-full max-w-md ${isLight ? 'bg-white border-gray-200 shadow-xl' : 'bg-[#1a1a1a] border-gray-800'} text-white`}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
            Reset Password
          </CardTitle>
          <CardDescription className={`text-center ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleResetPassword} className="grid gap-4">
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
            {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}
            <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90 font-bold py-6" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-2">
          <div className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-sm`}>
            Remember your password?{' '}
            <Link to="/Login" className="text-purple-400 hover:underline font-bold">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>

      <SuccessModal 
        open={showSuccess} 
        onOpenChange={handleSuccessClose}
        title="Email Sent!"
        message="Check your inbox for further instructions to reset your password."
        buttonText="Back to Login"
      />
    </div>
  );
};

export default ForgotPassword;
