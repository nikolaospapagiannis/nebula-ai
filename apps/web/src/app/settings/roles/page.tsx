/**
 * Role Management Page
 * View, create, edit, and delete custom roles
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Settings2, Users, Shield, Trash2, Edit } from 'lucide-react';
import { ProtectedComponent } from '@/lib/rbac';

interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  isCustom: boolean;
  priority: number;
  permissions: Array<{
    permission: {
      id: string;
      name: string;
      description?: string;
      category?: string;
    };
  }>;
  _count: {
    userAssignments: number;
  };
}

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rbac/roles', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }

      const data = await response.json();
      setRoles(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role? All users with this role will lose their permissions.')) {
      return;
    }

    try {
      const response = await fetch(`/api/rbac/roles/${roleId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete role');
      }

      // Refresh roles list
      fetchRoles();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedComponent permission="settings.view" fallback={<div className="p-8"><p className="text-red-600">You do not have permission to view roles.</p></div>}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="h-8 w-8 text-indigo-600" />
                Role Management
              </h1>
              <p className="mt-2 text-gray-600">
                Manage roles and permissions for your organization
              </p>
            </div>
            <ProtectedComponent permission="settings.manage">
              <button
                onClick={() => router.push('/settings/roles/create')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Create Role
              </button>
            </ProtectedComponent>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Role Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {role.name}
                      </h3>
                      {role.isSystem && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          System
                        </span>
                      )}
                      {role.isCustom && (
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                          Custom
                        </span>
                      )}
                    </div>
                    {role.description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {role.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{role._count.userAssignments} users</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    <span>{role.permissions.length} permissions</span>
                  </div>
                </div>

                {/* Permissions Preview */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Key Permissions:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 5).map((rp) => (
                      <span
                        key={rp.permission.id}
                        className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {rp.permission.name.split('.')[0]}
                      </span>
                    ))}
                    {role.permissions.length > 5 && (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                        +{role.permissions.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => router.push(`/settings/roles/${role.id}`)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    <Settings2 className="h-4 w-4" />
                    View Details
                  </button>
                  {!role.isSystem && (
                    <ProtectedComponent permission="settings.manage">
                      <button
                        onClick={() => router.push(`/settings/roles/${role.id}/edit`)}
                        className="px-3 py-2 text-sm bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </ProtectedComponent>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {roles.length === 0 && !loading && (
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No roles found
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first custom role
            </p>
            <ProtectedComponent permission="settings.manage">
              <button
                onClick={() => router.push('/settings/roles/create')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Create Role
              </button>
            </ProtectedComponent>
          </div>
        )}

        {/* System Roles Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">About System Roles</h4>
          <p className="text-sm text-blue-800">
            System roles (Owner, Admin, Member, Guest) are predefined and cannot be modified or deleted.
            You can create custom roles with specific permissions tailored to your organization's needs.
          </p>
        </div>
      </div>
    </ProtectedComponent>
  );
}
