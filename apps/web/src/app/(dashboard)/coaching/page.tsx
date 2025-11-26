'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Headphones, Users, UserCheck, Award, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CardGlass,
  CardGlassContent,
  CardGlassHeader,
  CardGlassTitle,
  CardGlassDescription
} from '@/components/ui/card-glass';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import { TemplateSelector } from '@/components/coaching/TemplateSelector';
import { ScorecardBuilder } from '@/components/coaching/ScorecardBuilder';
import { ScorecardResults } from '@/components/coaching/ScorecardResults';
import { CallMetricsPanel } from '@/components/coaching/CallMetricsPanel';

export const dynamic = 'force-dynamic';

interface Template {
  type: string;
  name: string;
  description: string;
  icon: string;
  criteria: number;
}

interface Scorecard {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  criteria: ScoringCriterion[];
  isActive: boolean;
  createdAt: string;
}

interface ScoringCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  category: string;
  evaluationPrompt: string;
}

interface ScorecardResult {
  id: string;
  meetingId: string;
  frameworkId: string;
  frameworkName: string;
  overallScore: number;
  criteriaScores: CriterionScore[];
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  metrics: CallMetrics;
  generatedAt: string;
}

interface CriterionScore {
  criterionId: string;
  criterionName: string;
  score: number;
  feedback: string;
  examples: string[];
  weight: number;
}

interface CallMetrics {
  talkToListenRatio: number;
  questionCount: number;
  openEndedQuestions: number;
  closedQuestions: number;
  interruptionCount: number;
  averageResponseTime: number;
  longestMonologue: number;
  engagementScore: number;
  sentimentTrend: 'improving' | 'declining' | 'stable';
}

export default function CoachingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<'templates' | 'builder' | 'results'>('templates');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [scorecards, setScorecards] = useState<Scorecard[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedScorecard, setSelectedScorecard] = useState<Scorecard | null>(null);
  const [currentResult, setCurrentResult] = useState<ScorecardResult | null>(null);
  const [currentMetrics, setCurrentMetrics] = useState<CallMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
    fetchScorecards();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/coaching/templates');
      setTemplates(response.data);
    } catch (err) {
      setError('Failed to load templates');
      console.error('Error fetching templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchScorecards = async () => {
    try {
      const response = await apiClient.get('/api/coaching/scorecards');
      setScorecards(response.data);
    } catch (err) {
      console.error('Error fetching scorecards:', err);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setView('builder');
  };

  const handleCreateScorecard = async (templateType: string, customCriteria?: any[]) => {
    try {
      setIsLoading(true);
      const response = await apiClient.post('/api/coaching/scorecards', {
        templateType,
        customCriteria
      });

      setSelectedScorecard(response.data);
      await fetchScorecards();
      setView('templates');
    } catch (err) {
      setError('Failed to create scorecard');
      console.error('Error creating scorecard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreMeeting = async (meetingId: string, scorecardId: string) => {
    try {
      setIsLoading(true);
      const [scoreResponse, metricsResponse] = await Promise.all([
        apiClient.post(`/api/coaching/score/${meetingId}`, { scorecardId }),
        apiClient.get(`/api/coaching/metrics/${meetingId}`)
      ]);

      setCurrentResult(scoreResponse.data);
      setCurrentMetrics(metricsResponse.data);
      setView('results');
    } catch (err) {
      setError('Failed to score meeting');
      console.error('Error scoring meeting:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      TrendingUp,
      Headphones,
      Users,
      UserCheck,
      Award
    };
    const Icon = icons[iconName] || TrendingUp;
    return <Icon className="h-8 w-8" />;
  };

  return (
    <div className="min-h-screen bg-[var(--ff-bg-dark)] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="heading-l text-[var(--ff-text-primary)] mb-2">
            AI Coaching Scorecards
          </h1>
          <p className="paragraph-l text-[var(--ff-text-secondary)]">
            Evaluate and improve call performance with AI-powered scorecards
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setView('templates')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              view === 'templates'
                ? 'bg-[var(--ff-purple-500)] text-white'
                : 'bg-[var(--ff-bg-layer)] text-[var(--ff-text-secondary)] hover:bg-[var(--ff-border)]'
            }`}
          >
            Templates
          </Button>
          <Button
            onClick={() => setView('builder')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              view === 'builder'
                ? 'bg-[var(--ff-purple-500)] text-white'
                : 'bg-[var(--ff-bg-layer)] text-[var(--ff-text-secondary)] hover:bg-[var(--ff-border)]'
            }`}
          >
            Builder
          </Button>
          <Button
            onClick={() => setView('results')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              view === 'results'
                ? 'bg-[var(--ff-purple-500)] text-white'
                : 'bg-[var(--ff-bg-layer)] text-[var(--ff-text-secondary)] hover:bg-[var(--ff-border)]'
            }`}
            disabled={!currentResult}
          >
            Results
          </Button>
        </div>

        {/* Content Area */}
        {view === 'templates' && (
          <TemplateSelector
            templates={templates}
            onSelectTemplate={handleTemplateSelect}
            isLoading={isLoading}
          />
        )}

        {view === 'builder' && (
          <ScorecardBuilder
            template={selectedTemplate}
            onSave={handleCreateScorecard}
            onCancel={() => setView('templates')}
            isLoading={isLoading}
          />
        )}

        {view === 'results' && currentResult && (
          <div className="space-y-6">
            <ScorecardResults
              result={currentResult}
              onScoreAnother={() => setView('templates')}
            />
            {currentMetrics && (
              <CallMetricsPanel metrics={currentMetrics} />
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}