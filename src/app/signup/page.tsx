'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Card, CardContent } from '@/components/ui/Card';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Link from 'next/link';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    department: '',
    role: 'staff' as 'staff' | 'manager' | 'admin' | 'auditor'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signup } = useUser();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const success = await signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        department: formData.department,
        role: formData.role
      });
      
      if (success) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-neutral-900 dark:to-neutral-800 flex flex-col">
      {/* Header with theme toggle */}
      <div className="w-full p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">DM</span>
            </div>
            <span className="text-xl font-bold text-text-primary">DocuMind AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle size="sm" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-text-primary">
              Join DocuMind AI 🚀
            </h2>
            <p className="mt-2 text-text-secondary">
              Create your account to get started with intelligent document management
            </p>
            <p className="mt-4 text-sm text-text-muted">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
          
          <Card variant="elevated" className="backdrop-blur-sm bg-background-primary/95">
            <CardContent className="p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    label="Full Name"
                    variant="outlined"
                    fullWidth
                  />

                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    label="Email Address"
                    variant="outlined"
                    fullWidth
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="department"
                    name="department"
                    type="text"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g., Engineering, Marketing"
                    label="Department"
                    variant="outlined"
                    fullWidth
                  />

                  <Select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    label="Role"
                    variant="outlined"
                    fullWidth
                    options={[
                      { value: 'staff', label: 'Staff Member' },
                      { value: 'manager', label: 'Manager' },
                      { value: 'admin', label: 'Administrator' },
                      { value: 'auditor', label: 'Auditor' }
                    ]}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      label="Password"
                      variant="outlined"
                      fullWidth
                    />
                    <p className="mt-1 text-xs text-text-muted">
                      8+ characters with uppercase, lowercase, and numbers
                    </p>
                  </div>

                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    label="Confirm Password"
                    variant="outlined"
                    fullWidth
                  />
                </div>

                {error && (
                  <Alert variant="error" className="animate-fade-in">
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  fullWidth
                  isLoading={isLoading}
                  className="mt-6"
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}