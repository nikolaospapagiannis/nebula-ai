'use client';

import { useState } from 'react';
import {
  FileText,
  Edit,
  Copy,
  Trash2,
  MoreVertical,
  Hash,
  Users,
  Star,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { CardGlass, CardGlassContent } from '@/components/ui/card-glass';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onApply: () => void;
  onDuplicate: () => void;
}

export default function TemplateCard({
  template,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onApply,
  onDuplicate
}: TemplateCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      sales: 'bg-blue-500/20 text-blue-400',
      customer_success: 'bg-green-500/20 text-green-400',
      internal: 'bg-purple-500/20 text-purple-400',
      interview: 'bg-orange-500/20 text-orange-400',
      project: 'bg-cyan-500/20 text-cyan-400',
      custom: 'bg-pink-500/20 text-pink-400'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <CardGlass
      className={`relative transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
        isSelected ? 'ring-2 ring-[var(--ff-purple-500)]' : ''
      }`}
      onClick={onSelect}
    >
      <CardGlassContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[var(--ff-purple-500)]/10 rounded-lg">
              <FileText className="w-5 h-5 text-[var(--ff-purple-500)]" />
            </div>
            <div className="flex-1">
              <h3 className="heading-s mb-1">{template.name}</h3>
              <p className="paragraph-s text-[var(--ff-text-muted)] line-clamp-2">
                {template.description}
              </p>
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 hover:bg-[var(--ff-bg-layer)]"
            >
              <MoreVertical className="w-4 h-4 text-[var(--ff-text-muted)]" />
            </Button>

            {showMenu && (
              <div className="absolute right-0 top-8 z-20 bg-[var(--ff-bg-layer)] border border-[var(--ff-border)] rounded-lg shadow-xl py-2 min-w-[160px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onApply();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--ff-purple-500)]/10 transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Apply Template
                </button>
                {!template.isPreBuilt && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--ff-purple-500)]/10 transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--ff-purple-500)]/10 transition-colors flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                {!template.isPreBuilt && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-500/10 text-red-400 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {template.isPreBuilt && (
            <Badge variant="outline" className="bg-[var(--ff-purple-500)]/10 text-[var(--ff-purple-500)] border-[var(--ff-purple-500)]/20">
              <Star className="w-3 h-3 mr-1" />
              Pre-built
            </Badge>
          )}
          <Badge variant="outline" className={getCategoryColor(template.category)}>
            {template.category.replace(/_/g, ' ')}
          </Badge>
        </div>

        {/* Variables Preview */}
        {template.variables.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-4 h-4 text-[var(--ff-text-muted)]" />
              <span className="text-xs text-[var(--ff-text-muted)]">Variables</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {template.variables.slice(0, isExpanded ? undefined : 3).map((variable, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 bg-[var(--ff-purple-100)]/10 text-[var(--ff-purple-500)] rounded"
                >
                  {variable}
                </span>
              ))}
              {!isExpanded && template.variables.length > 3 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(true);
                  }}
                  className="text-xs text-[var(--ff-text-muted)] hover:text-[var(--ff-text-secondary)]"
                >
                  +{template.variables.length - 3} more
                </button>
              )}
            </div>
          </div>
        )}

        {/* Sections Preview */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--ff-text-muted)]">
              {template.sections.length} sections
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-[var(--ff-text-muted)] hover:text-[var(--ff-text-secondary)]"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
          {isExpanded && (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {template.sections.map((section, idx) => (
                <div key={idx} className="text-xs text-[var(--ff-text-muted)] pl-4 border-l-2 border-[var(--ff-border)]">
                  • {section.title}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {template.tags.map(tag => (
              <span
                key={tag}
                className="text-xs px-2 py-1 bg-[var(--ff-bg-layer)] text-[var(--ff-text-muted)] rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--ff-border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--ff-text-muted)]">
            <Users className="w-3 h-3" />
            <span>{template.usageCount} uses</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onApply();
            }}
            className="text-xs border-[var(--ff-purple-500)] text-[var(--ff-purple-500)] hover:bg-[var(--ff-purple-500)] hover:text-white"
          >
            Use Template
          </Button>
        </div>
      </CardGlassContent>
    </CardGlass>
  );
}