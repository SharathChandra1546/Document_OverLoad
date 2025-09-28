'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { UserRole } from '@/data/mockData';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

const LoginForm: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { login } = useUser();
  const router = useRouter();

  const roles: { role: UserRole; description: string; color: string }[] = [
    {
      role: 'Admin',
      description: 'Full system access, user management, and administrative controls',
      color: 'bg-red-500'
    },
    {
      role: 'Executive',
      description: 'High-level oversight, compliance monitoring, and strategic insights',
      color: 'bg-purple-500'
    },
    {
      role: 'Engineer',
      description: 'Technical documentation, operational alerts, and system monitoring',
      color: 'bg-blue-500'
    },
    {
      role: 'Staff',
      description: 'Document upload, search, and basic compliance tracking',
      color: 'bg-green-500'
    }
  ];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleLogin = () => {
    if (selectedRole) {
      login(selectedRole);
      router.push('/dashboard');
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Select Your Role
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Choose your role to access the appropriate dashboard and features
            </p>
          </div>

          <div className="space-y-3">
            {roles.map(({ role, description, color }) => (
              <div
                key={role}
                className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  selectedRole === role
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => handleRoleSelect(role)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full ${color} mt-1.5`} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {role}
                      </h4>
                      <Badge variant="info" size="sm">
                        {role}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      {description}
                    </p>
                  </div>
                  {selectedRole === role && (
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleLogin}
            disabled={!selectedRole}
            className="w-full"
            size="lg"
          >
            {selectedRole ? `Login as ${selectedRole}` : 'Select a role to continue'}
          </Button>

          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This is a demo application. Role selection simulates authentication.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
