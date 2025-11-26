'use client';

export const dynamic = 'force-dynamic';

/**
 * Create Role Page
 */

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import RoleEditor from '@/components/RoleEditor';
import { ProtectedComponent } from '@/lib/rbac';

export default function CreateRolePage() {
  const router = useRouter();

  const handleSave = async (data: { name: string; description: string; permissions: string[] }) => {
    try {
      const response = await fetch('/api/rbac/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create role');
      }

      // Redirect to roles page
      router.push('/settings/roles');
    } catch (error: any) {
      throw error;
    }
  };

  return (
    <ProtectedComponent
      permission="settings.manage"
      fallback={
        <div className="p-8">
          <p className="text-red-600">You do not have permission to create roles.</p>
        </div>
      }
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create Custom Role</h1>
          <p className="mt-2 text-gray-600">
            Define a new role with specific permissions for your organization
          </p>
        </div>

        {/* Editor */}
        <RoleEditor onSave={handleSave} onCancel={() => router.back()} />
      </div>
    </ProtectedComponent>
  );
}
