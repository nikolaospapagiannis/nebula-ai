'use client';

import { useState } from 'react';
import TemplateCard from './TemplateCard';

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

interface TemplateGalleryProps {
  templates: Template[];
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
  onApply: (id: string) => void;
  onDuplicate: (template: Template) => void;
}

export default function TemplateGallery({
  templates,
  onEdit,
  onDelete,
  onApply,
  onDuplicate
}: TemplateGalleryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map(template => (
        <TemplateCard
          key={template.id}
          template={template}
          isSelected={selectedTemplate === template.id}
          onSelect={() => setSelectedTemplate(template.id)}
          onEdit={() => onEdit(template)}
          onDelete={() => onDelete(template.id)}
          onApply={() => onApply(template.id)}
          onDuplicate={() => onDuplicate(template)}
        />
      ))}
    </div>
  );
}