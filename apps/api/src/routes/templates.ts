/**
 * Template Routes
 * Endpoints for managing note templates
 */

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { rateLimitByEndpoint } from '../middleware/rate-limit';
import { logger } from '../utils/logger';

const router = Router();

// In-memory storage for custom templates (in production, this would be in database)
const customTemplates: Map<string, any> = new Map();

// Define pre-built templates
const preBuiltTemplates = [
  {
    id: 'sales-discovery',
    name: 'Sales Discovery Call',
    description: 'Comprehensive notes template for sales discovery calls',
    category: 'sales',
    isPreBuilt: true,
    variables: ['{{meeting_title}}', '{{date}}', '{{attendees}}', '{{prospect_name}}', '{{company}}'],
    sections: [
      {
        title: 'Meeting Overview',
        content: '**Meeting:** {{meeting_title}}\n**Date:** {{date}}\n**Attendees:** {{attendees}}\n**Prospect:** {{prospect_name}} - {{company}}'
      },
      {
        title: 'Current Situation',
        content: '### Company Background\n\n### Current Challenges\n\n### Impact of Challenges'
      },
      {
        title: 'Goals & Objectives',
        content: '### Primary Goals\n\n### Success Metrics\n\n### Timeline'
      },
      {
        title: 'Next Steps',
        content: '### Action Items\n\n### Follow-up Date'
      }
    ],
    usageCount: 1245,
    tags: ['sales', 'discovery', 'prospecting']
  },
  {
    id: 'product-demo',
    name: 'Product Demo',
    description: 'Template for product demonstration meetings',
    category: 'sales',
    isPreBuilt: true,
    variables: ['{{meeting_title}}', '{{date}}', '{{attendees}}', '{{product}}', '{{features_shown}}'],
    sections: [
      {
        title: 'Demo Overview',
        content: '**Meeting:** {{meeting_title}}\n**Date:** {{date}}\n**Attendees:** {{attendees}}\n**Product:** {{product}}'
      },
      {
        title: 'Features Demonstrated',
        content: '{{features_shown}}\n\n### Key Use Cases\n\n### Customer Questions'
      },
      {
        title: 'Feedback',
        content: '### Positive Reactions\n\n### Concerns\n\n### Feature Requests'
      },
      {
        title: 'Next Steps',
        content: '### Follow-up Actions\n\n### Decision Timeline'
      }
    ],
    usageCount: 892,
    tags: ['sales', 'demo', 'product']
  },
  {
    id: 'customer-feedback',
    name: 'Customer Feedback',
    description: 'Capture customer feedback and feature requests',
    category: 'customer_success',
    isPreBuilt: true,
    variables: ['{{meeting_title}}', '{{date}}', '{{customer}}', '{{account_manager}}'],
    sections: [
      {
        title: 'Meeting Info',
        content: '**Meeting:** {{meeting_title}}\n**Date:** {{date}}\n**Customer:** {{customer}}\n**Account Manager:** {{account_manager}}'
      },
      {
        title: 'Feedback Summary',
        content: '### Overall Satisfaction\n\n### What\'s Working Well\n\n### Areas for Improvement'
      },
      {
        title: 'Feature Requests',
        content: '### Requested Features\n\n### Use Cases\n\n### Priority Level'
      },
      {
        title: 'Action Items',
        content: '### Immediate Actions\n\n### Long-term Improvements'
      }
    ],
    usageCount: 673,
    tags: ['customer', 'feedback', 'feature-requests']
  },
  {
    id: 'one-on-one',
    name: '1-on-1 Meeting',
    description: 'Template for one-on-one meetings with team members',
    category: 'internal',
    isPreBuilt: true,
    variables: ['{{meeting_title}}', '{{date}}', '{{employee}}', '{{manager}}'],
    sections: [
      {
        title: 'Meeting Details',
        content: '**Meeting:** {{meeting_title}}\n**Date:** {{date}}\n**Employee:** {{employee}}\n**Manager:** {{manager}}'
      },
      {
        title: 'Check-in',
        content: '### How are things going?\n\n### Current workload\n\n### Blockers or challenges'
      },
      {
        title: 'Goals & Progress',
        content: '### Current goals\n\n### Progress update\n\n### Support needed'
      },
      {
        title: 'Development',
        content: '### Career goals\n\n### Learning opportunities\n\n### Feedback'
      },
      {
        title: 'Action Items',
        content: '### Employee actions\n\n### Manager actions\n\n### Next meeting topics'
      }
    ],
    usageCount: 1567,
    tags: ['internal', 'one-on-one', 'management']
  },
  {
    id: 'team-standup',
    name: 'Team Standup',
    description: 'Daily standup meeting template',
    category: 'internal',
    isPreBuilt: true,
    variables: ['{{date}}', '{{team}}', '{{attendees}}', '{{sprint}}'],
    sections: [
      {
        title: 'Standup Info',
        content: '**Date:** {{date}}\n**Team:** {{team}}\n**Sprint:** {{sprint}}\n**Attendees:** {{attendees}}'
      },
      {
        title: 'Team Updates',
        content: '### Yesterday\'s Progress\n\n### Today\'s Focus\n\n### Blockers'
      },
      {
        title: 'Key Metrics',
        content: '### Sprint Progress\n\n### Burndown Status\n\n### Risk Items'
      },
      {
        title: 'Action Items',
        content: '### Immediate Actions\n\n### Dependencies'
      }
    ],
    usageCount: 2341,
    tags: ['internal', 'standup', 'agile']
  },
  {
    id: 'technical-interview',
    name: 'Technical Interview',
    description: 'Technical interview assessment template',
    category: 'interview',
    isPreBuilt: true,
    variables: ['{{candidate}}', '{{position}}', '{{date}}', '{{interviewer}}'],
    sections: [
      {
        title: 'Interview Details',
        content: '**Candidate:** {{candidate}}\n**Position:** {{position}}\n**Date:** {{date}}\n**Interviewer:** {{interviewer}}'
      },
      {
        title: 'Technical Assessment',
        content: '### Coding Skills\n\n### Problem Solving\n\n### System Design\n\n### Technical Knowledge'
      },
      {
        title: 'Questions Asked',
        content: '### Technical Questions\n\n### Candidate Responses\n\n### Follow-up Questions'
      },
      {
        title: 'Evaluation',
        content: '### Strengths\n\n### Areas of Concern\n\n### Overall Rating'
      },
      {
        title: 'Recommendation',
        content: '### Hiring Recommendation\n\n### Next Steps\n\n### Additional Notes'
      }
    ],
    usageCount: 432,
    tags: ['interview', 'technical', 'hiring']
  },
  {
    id: 'behavioral-interview',
    name: 'Behavioral Interview',
    description: 'Behavioral interview assessment template',
    category: 'interview',
    isPreBuilt: true,
    variables: ['{{candidate}}', '{{position}}', '{{date}}', '{{interviewer}}'],
    sections: [
      {
        title: 'Interview Details',
        content: '**Candidate:** {{candidate}}\n**Position:** {{position}}\n**Date:** {{date}}\n**Interviewer:** {{interviewer}}'
      },
      {
        title: 'Behavioral Assessment',
        content: '### Communication Skills\n\n### Team Collaboration\n\n### Leadership Potential\n\n### Problem Resolution'
      },
      {
        title: 'STAR Responses',
        content: '### Situations Discussed\n\n### Actions Taken\n\n### Results Achieved'
      },
      {
        title: 'Cultural Fit',
        content: '### Company Values Alignment\n\n### Team Dynamics\n\n### Work Style'
      },
      {
        title: 'Recommendation',
        content: '### Overall Assessment\n\n### Fit for Role\n\n### Next Steps'
      }
    ],
    usageCount: 387,
    tags: ['interview', 'behavioral', 'hiring']
  },
  {
    id: 'qbr',
    name: 'Quarterly Business Review',
    description: 'QBR meeting template',
    category: 'customer_success',
    isPreBuilt: true,
    variables: ['{{quarter}}', '{{year}}', '{{customer}}', '{{attendees}}'],
    sections: [
      {
        title: 'QBR Overview',
        content: '**Quarter:** {{quarter}} {{year}}\n**Customer:** {{customer}}\n**Attendees:** {{attendees}}'
      },
      {
        title: 'Performance Review',
        content: '### Key Metrics\n\n### ROI Analysis\n\n### Usage Trends'
      },
      {
        title: 'Success Stories',
        content: '### Achievements\n\n### Value Delivered\n\n### Case Studies'
      },
      {
        title: 'Roadmap Review',
        content: '### Upcoming Features\n\n### Timeline\n\n### Customer Priorities'
      },
      {
        title: 'Strategic Planning',
        content: '### Next Quarter Goals\n\n### Success Metrics\n\n### Action Plan'
      }
    ],
    usageCount: 298,
    tags: ['customer', 'qbr', 'review']
  },
  {
    id: 'sprint-planning',
    name: 'Sprint Planning',
    description: 'Sprint planning session template',
    category: 'project',
    isPreBuilt: true,
    variables: ['{{sprint}}', '{{team}}', '{{dates}}', '{{velocity}}'],
    sections: [
      {
        title: 'Sprint Info',
        content: '**Sprint:** {{sprint}}\n**Team:** {{team}}\n**Dates:** {{dates}}\n**Velocity:** {{velocity}}'
      },
      {
        title: 'Sprint Goals',
        content: '### Primary Objectives\n\n### Success Criteria\n\n### Dependencies'
      },
      {
        title: 'Backlog Review',
        content: '### User Stories\n\n### Technical Tasks\n\n### Bug Fixes'
      },
      {
        title: 'Capacity Planning',
        content: '### Team Availability\n\n### Story Points\n\n### Risk Assessment'
      },
      {
        title: 'Commitments',
        content: '### Sprint Backlog\n\n### Definition of Done\n\n### Team Agreement'
      }
    ],
    usageCount: 512,
    tags: ['project', 'sprint', 'agile']
  },
  {
    id: 'retrospective',
    name: 'Sprint Retrospective',
    description: 'Sprint retrospective template',
    category: 'project',
    isPreBuilt: true,
    variables: ['{{sprint}}', '{{team}}', '{{facilitator}}', '{{date}}'],
    sections: [
      {
        title: 'Retro Details',
        content: '**Sprint:** {{sprint}}\n**Team:** {{team}}\n**Facilitator:** {{facilitator}}\n**Date:** {{date}}'
      },
      {
        title: 'What Went Well',
        content: '### Successes\n\n### Team Achievements\n\n### Process Improvements'
      },
      {
        title: 'What Could Be Better',
        content: '### Challenges\n\n### Pain Points\n\n### Missed Opportunities'
      },
      {
        title: 'Action Items',
        content: '### Process Changes\n\n### Team Agreements\n\n### Next Sprint Focus'
      },
      {
        title: 'Team Health',
        content: '### Morale\n\n### Collaboration\n\n### Support Needed'
      }
    ],
    usageCount: 423,
    tags: ['project', 'retrospective', 'agile']
  }
];

// Get all templates (pre-built and custom)
router.get('/templates', authMiddleware, rateLimitByEndpoint(), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const organizationId = (req as any).user?.organizationId;

    // Get custom templates from in-memory storage
    const userCustomTemplates = Array.from(customTemplates.values()).filter(
      t => t.organizationId === organizationId || t.createdBy === userId
    );

    // Combine pre-built and custom templates
    const allTemplates = [
      ...preBuiltTemplates,
      ...userCustomTemplates
    ];

    res.json({
      success: true,
      templates: allTemplates
    });
  } catch (error) {
    logger.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates'
    });
  }
});

// Create a new custom template
router.post('/templates', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const organizationId = (req as any).user?.organizationId;
    const { name, description, category, sections, variables, tags } = req.body;

    const templateId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const template = {
      id: templateId,
      name,
      description,
      category,
      sections,
      variables,
      tags: tags || [],
      organizationId,
      createdBy: userId,
      isActive: true,
      isPreBuilt: false,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    customTemplates.set(templateId, template);

    res.json({
      success: true,
      template
    });
  } catch (error) {
    logger.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create template'
    });
  }
});

// Get a specific template
router.get('/templates/:id', authMiddleware, rateLimitByEndpoint(), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if it's a pre-built template
    const preBuilt = preBuiltTemplates.find(t => t.id === id);
    if (preBuilt) {
      return res.json({
        success: true,
        template: preBuilt
      });
    }

    // Otherwise, check custom templates
    const template = customTemplates.get(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    res.json({
      success: true,
      template
    });
  } catch (error) {
    logger.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch template'
    });
  }
});

// Update a custom template
router.patch('/templates/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, category, sections, variables, tags } = req.body;

    const template = customTemplates.get(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Update template
    const updatedTemplate = {
      ...template,
      name: name || template.name,
      description: description || template.description,
      category: category || template.category,
      sections: sections || template.sections,
      variables: variables || template.variables,
      tags: tags !== undefined ? tags : template.tags,
      updatedAt: new Date()
    };

    customTemplates.set(id, updatedTemplate);

    res.json({
      success: true,
      template: updatedTemplate
    });
  } catch (error) {
    logger.error('Error updating template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update template'
    });
  }
});

// Delete a custom template
router.delete('/templates/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!customTemplates.has(id)) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    customTemplates.delete(id);

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete template'
    });
  }
});

// Apply template to a meeting
router.post('/templates/:id/apply', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { meetingId, variableValues } = req.body;

    // Get the template
    let template: any = preBuiltTemplates.find(t => t.id === id) || customTemplates.get(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Apply variable substitution to sections
    const processedSections = template.sections.map((section: any) => ({
      ...section,
      content: section.content.replace(/\{\{(\w+)\}\}/g, (match: string, variable: string) => {
        return variableValues?.[variable] || match;
      })
    }));

    // Update usage count for custom templates
    if (customTemplates.has(id)) {
      const updatedTemplate = {
        ...template,
        usageCount: (template.usageCount || 0) + 1
      };
      customTemplates.set(id, updatedTemplate);
    }

    res.json({
      success: true,
      notes: {
        templateId: id,
        templateName: template.name,
        sections: processedSections,
        meetingId,
        appliedAt: new Date()
      }
    });
  } catch (error) {
    logger.error('Error applying template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to apply template'
    });
  }
});

export default router;