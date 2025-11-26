'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Star,
  Clock,
  Hash,
  Edit,
  Copy,
  Trash2,
  X,
  Check
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CardGlass,
  CardGlassContent,
  CardGlassHeader,
  CardGlassTitle,
  CardGlassDescription
} from '@/components/ui/card-glass';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import TemplateGallery from '@/components/templates/TemplateGallery';
import TemplateBuilder from '@/components/templates/TemplateBuilder';
import TemplateSelectorModal from '@/components/templates/TemplateSelectorModal';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  isPreBuilt: boolean;
  variables: string[];
  sections: Array<{
    title: string;
    content: string;
  }>;
  usageCount: number;
  tags: string[];
}

export default function TemplatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'sales', label: 'Sales' },
    { value: 'customer_success', label: 'Customer Success' },
    { value: 'internal', label: 'Internal' },
    { value: 'interview', label: 'Interview' },
    { value: 'project', label: 'Project' },
    { value: 'custom', label: 'Custom' }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/templates');
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (templateData: any) => {
    try {
      const response = await apiClient.post('/templates', templateData);
      if (response.data.success) {
        setTemplates([response.data.template, ...templates]);
        setShowBuilder(false);
        setEditingTemplate(null);
      }
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleUpdateTemplate = async (id: string, templateData: any) => {
    try {
      const response = await apiClient.patch(`/templates/${id}`, templateData);
      if (response.data.success) {
        setTemplates(templates.map(t =>
          t.id === id ? response.data.template : t
        ));
        setShowBuilder(false);
        setEditingTemplate(null);
      }
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await apiClient.delete(`/templates/${id}`);
      if (response.data.success) {
        setTemplates(templates.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleApplyTemplate = async (templateId: string, meetingId?: string) => {
    try {
      const response = await apiClient.post(`/templates/${templateId}/apply`, {
        meetingId: meetingId || 'new',
        variableValues: {
          meeting_title: 'New Meeting',
          date: new Date().toLocaleDateString(),
          attendees: user?.email || '',
        }
      });

      if (response.data.success) {
        // Navigate to meeting notes with applied template
        router.push(`/meetings/${meetingId || 'new'}?template=${templateId}`);
      }
    } catch (error) {
      console.error('Error applying template:', error);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' ||
                           template.category === selectedCategory ||
                           (selectedCategory === 'custom' && !template.isPreBuilt);

    return matchesSearch && matchesCategory;
  });

  if (showBuilder) {
    return (
      <TemplateBuilder
        template={editingTemplate}
        onSave={(data) => {
          if (editingTemplate) {
            handleUpdateTemplate(editingTemplate.id, data);
          } else {
            handleCreateTemplate(data);
          }
        }}
        onCancel={() => {
          setShowBuilder(false);
          setEditingTemplate(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--ff-bg-dark)] text-[var(--ff-text-primary)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--ff-bg-dark)] border-b border-[var(--ff-border)]">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-l">Note Templates</h1>
              <p className="paragraph-m mt-2">
                Create and manage note templates for different meeting types
              </p>
            </div>
            <Button
              onClick={() => setShowBuilder(true)}
              className="bg-[var(--ff-purple-500)] hover:bg-[var(--ff-purple-600)] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mt-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--ff-text-muted)] w-4 h-4" />
              <Input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[var(--ff-bg-layer)] border-[var(--ff-border)] text-[var(--ff-text-primary)]"
              />
            </div>

            <div className="flex gap-2">
              {categories.map(category => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.value)}
                  className={selectedCategory === category.value
                    ? 'bg-[var(--ff-purple-500)] text-white'
                    : 'border-[var(--ff-border)] text-[var(--ff-text-secondary)]'}
                >
                  {category.label}
                  {category.value !== 'all' && (
                    <span className="ml-2 text-xs opacity-70">
                      {filteredTemplates.filter(t =>
                        category.value === 'custom' ? !t.isPreBuilt : t.category === category.value
                      ).length}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Template Gallery */}
      <div className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-[var(--ff-bg-layer)] animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <CardGlass>
            <CardGlassContent className="text-center py-16">
              <FileText className="w-16 h-16 mx-auto text-[var(--ff-text-muted)] mb-4" />
              <h3 className="heading-s mb-2">No templates found</h3>
              <p className="paragraph-m text-[var(--ff-text-muted)] mb-6">
                {searchQuery
                  ? `No templates match "${searchQuery}"`
                  : 'Create your first template to get started'}
              </p>
              <Button
                onClick={() => setShowBuilder(true)}
                className="bg-[var(--ff-purple-500)] hover:bg-[var(--ff-purple-600)] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </CardGlassContent>
          </CardGlass>
        ) : (
          <TemplateGallery
            templates={filteredTemplates}
            onEdit={(template) => {
              setEditingTemplate(template);
              setShowBuilder(true);
            }}
            onDelete={handleDeleteTemplate}
            onApply={handleApplyTemplate}
            onDuplicate={async (template) => {
              const newTemplate = {
                ...template,
                name: `${template.name} (Copy)`,
                id: undefined,
                isPreBuilt: false
              };
              await handleCreateTemplate(newTemplate);
            }}
          />
        )}
      </div>

      {/* Template Selector Modal */}
      {showSelector && (
        <TemplateSelectorModal
          templates={templates}
          onSelect={(template) => {
            handleApplyTemplate(template.id);
            setShowSelector(false);
          }}
          onClose={() => setShowSelector(false)}
        />
      )}
    </div>
  );
}