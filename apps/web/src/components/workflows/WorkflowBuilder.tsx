'use client';

import React, { useState } from 'react';
import { TriggerSelector } from './TriggerSelector';
import { ConditionBuilder } from './ConditionBuilder';
import { ActionSelector } from './ActionSelector';

interface WorkflowBuilderProps {
  workflow?: any;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function WorkflowBuilder({ workflow, onSave, onCancel }: WorkflowBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: workflow?.name || '',
    description: workflow?.description || '',
    trigger: workflow?.trigger || '',
    triggerConfig: workflow?.triggerConfig || {},
    conditions: workflow?.conditions || [],
    action: workflow?.action || '',
    actionConfig: workflow?.actionConfig || {},
    isActive: workflow?.isActive ?? true,
  });

  const steps = [
    { number: 1, title: 'Basic Info', icon: '📝' },
    { number: 2, title: 'Select Trigger', icon: '⚡' },
    { number: 3, title: 'Add Conditions', icon: '🔍' },
    { number: 4, title: 'Select Action', icon: '🎯' },
    { number: 5, title: 'Test & Save', icon: '✅' },
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const response = await fetch('/api/workflows/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Test failed');
      }

      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      console.error('Test error:', error);
      setTestResult({
        success: false,
        error: 'Failed to test workflow',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save workflow. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return formData.trigger.length > 0;
      case 3:
        return true; // Conditions are optional
      case 4:
        return formData.action.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div
                className={`flex flex-col items-center cursor-pointer ${
                  currentStep === step.number
                    ? ''
                    : currentStep > step.number
                    ? 'opacity-100'
                    : 'opacity-50'
                }`}
                onClick={() => setCurrentStep(step.number)}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                    currentStep === step.number
                      ? 'bg-[var(--ff-purple-500)] text-white'
                      : currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : 'bg-[var(--ff-bg-layer)] text-[var(--ff-text-muted)] border border-[var(--ff-border)]'
                  }`}
                >
                  {currentStep > step.number ? '✓' : step.icon}
                </div>
                <span
                  className={`text-xs ${
                    currentStep === step.number
                      ? 'text-[var(--ff-purple-500)] font-medium'
                      : 'text-[var(--ff-text-muted)]'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-all ${
                    currentStep > step.number
                      ? 'bg-green-500'
                      : 'bg-[var(--ff-border)]'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="card-ff min-h-[400px]">
        {currentStep === 1 && (
          <div>
            <h2 className="heading-s mb-6">Workflow Information</h2>
            <div className="space-y-4">
              <div>
                <label className="label-m text-[var(--ff-text-secondary)] block mb-2">
                  Workflow Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Post-meeting follow-up"
                  className="w-full px-4 py-2 bg-[var(--ff-bg-dark)] border border-[var(--ff-border)] rounded-lg text-white placeholder-[var(--ff-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-purple-500)] focus:border-transparent"
                />
              </div>
              <div>
                <label className="label-m text-[var(--ff-text-secondary)] block mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this workflow does..."
                  rows={4}
                  className="w-full px-4 py-2 bg-[var(--ff-bg-dark)] border border-[var(--ff-border)] rounded-lg text-white placeholder-[var(--ff-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-purple-500)] focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <TriggerSelector
            selectedTrigger={formData.trigger}
            triggerConfig={formData.triggerConfig}
            onSelect={(trigger, config) =>
              setFormData({ ...formData, trigger, triggerConfig: config })
            }
          />
        )}

        {currentStep === 3 && (
          <ConditionBuilder
            conditions={formData.conditions}
            onChange={(conditions) => setFormData({ ...formData, conditions })}
          />
        )}

        {currentStep === 4 && (
          <ActionSelector
            selectedAction={formData.action}
            actionConfig={formData.actionConfig}
            onSelect={(action, config) =>
              setFormData({ ...formData, action, actionConfig: config })
            }
          />
        )}

        {currentStep === 5 && (
          <div>
            <h2 className="heading-s mb-6">Review & Test</h2>

            {/* Summary */}
            <div className="space-y-4 mb-8">
              <div className="bg-[var(--ff-bg-dark)] rounded-lg p-4">
                <h3 className="font-medium text-white mb-3">Workflow Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--ff-text-muted)]">Name:</span>
                    <span className="text-white">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--ff-text-muted)]">Trigger:</span>
                    <span className="text-white">{formData.trigger}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--ff-text-muted)]">Conditions:</span>
                    <span className="text-white">
                      {formData.conditions.length} condition(s)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--ff-text-muted)]">Action:</span>
                    <span className="text-white">{formData.action}</span>
                  </div>
                </div>
              </div>

              {/* Test Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="button-secondary"
                >
                  {testing ? (
                    <>
                      <span className="animate-spin mr-2">⚙️</span>
                      Testing...
                    </>
                  ) : (
                    <>
                      🧪 Test Workflow
                    </>
                  )}
                </button>
              </div>

              {/* Test Result */}
              {testResult && (
                <div
                  className={`rounded-lg p-4 ${
                    testResult.success
                      ? 'bg-green-500/10 border border-green-500/20'
                      : 'bg-red-500/10 border border-red-500/20'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">
                      {testResult.success ? '✅' : '❌'}
                    </span>
                    <h4 className="font-medium text-white">
                      {testResult.success ? 'Test Successful' : 'Test Failed'}
                    </h4>
                  </div>
                  {testResult.message && (
                    <p className="text-sm text-[var(--ff-text-secondary)]">
                      {testResult.message}
                    </p>
                  )}
                  {testResult.details && (
                    <pre className="mt-2 text-xs text-[var(--ff-text-muted)] overflow-x-auto">
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button onClick={onCancel} className="button-secondary">
          Cancel
        </button>
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button onClick={handlePrevious} className="button-secondary">
              Previous
            </button>
          )}
          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className={`button-primary ${
                !isStepValid(currentStep) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving || !isStepValid(4)}
              className="button-primary"
            >
              {saving ? 'Saving...' : workflow ? 'Update Workflow' : 'Create Workflow'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}