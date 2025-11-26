'use client';

import { CardGlass } from '@/components/ui/card-glass';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface Insight {
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  description: string;
  metric?: string;
}

interface MeetingInsightsPanelProps {
  insights: Insight[];
}

const insightConfig = {
  success: { icon: CheckCircle2, color: 'emerald', label: 'Great!' },
  warning: { icon: AlertCircle, color: 'amber', label: 'Attention' },
  info: { icon: Clock, color: 'cyan', label: 'Insight' },
  tip: { icon: Lightbulb, color: 'purple', label: 'Tip' },
};

export function MeetingInsightsPanel({ insights }: MeetingInsightsPanelProps) {
  return (
    <CardGlass variant="elevated" gradient>
      <h3 className="text-lg font-semibold text-white mb-6">AI Insights</h3>

      <div className="space-y-4">
        {insights.map((insight, idx) => {
          const config = insightConfig[insight.type];
          const Icon = config.icon;

          return (
            <div
              key={idx}
              className="group p-4 rounded-xl bg-slate-800/30 border border-white/5 hover:bg-slate-800/50 hover:border-teal-500/30 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${config.color}-500/20 to-${config.color}-600/20 border border-${config.color}-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 text-${config.color}-400`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`bg-${config.color}-500/20 text-${config.color}-300 border-${config.color}-500/30`}>
                      {config.label}
                    </Badge>
                    {insight.metric && (
                      <span className="text-xs font-mono text-slate-400">
                        {insight.metric}
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-white mb-1">{insight.title}</h4>
                  <p className="text-sm text-slate-400">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </CardGlass>
  );
}
