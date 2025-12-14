import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components/Common';
import { CheckSquare } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Invalid email or password. Try demo@example.com');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-primary-600">
          <CheckSquare className="h-12 w-12" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">create a new account</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input 
              label="Email address" 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
            <Input 
              label="Password" 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
            
            {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}

            <Button type="submit" className="w-full" isLoading={isLoading}>Sign in</Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Credentials</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3">
               <div className="text-xs text-center text-gray-500">
                  Email: demo@example.com<br/>
                  Password: password
               </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
         <div className="flex justify-center text-primary-600">
          <CheckSquare className="h-12 w-12" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">Sign in</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input 
              label="Full Name" 
              type="text" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
            <Input 
              label="Email address" 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
            <Input 
              label="Password" 
              type="password" 
              required 
              minLength={6}
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />

            {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}

            <Button type="submit" className="w-full" isLoading={isLoading}>Register</Button>
          </form>
        </Card>
      </div>
    </div>
  );
};