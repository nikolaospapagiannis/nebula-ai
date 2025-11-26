'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Users, Link as LinkIcon, Video, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import Link from 'next/link';

export default function NewMeetingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    platform: 'zoom',
    scheduledStartAt: '',
    scheduledEndAt: '',
    externalMeetingUrl: '',
    description: '',
    attendees: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const attendeeEmails = formData.attendees
        .split(',')
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      const meetingData = {
        title: formData.title,
        platform: formData.platform,
        scheduledStartAt: new Date(formData.scheduledStartAt).toISOString(),
        scheduledEndAt: new Date(formData.scheduledEndAt).toISOString(),
        externalMeetingUrl: formData.externalMeetingUrl || undefined,
        description: formData.description || undefined,
        attendees: attendeeEmails,
      };

      const meeting = await apiClient.createMeeting(meetingData);
      router.push(`/meetings/${meeting.id}`);
    } catch (err: any) {
      console.error('Failed to create meeting:', err);
      setError(err.response?.data?.message || 'Failed to create meeting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate end time when start time changes (default 1 hour)
  const handleStartTimeChange = (value: string) => {
    handleChange('scheduledStartAt', value);
    if (!formData.scheduledEndAt && value) {
      const start = new Date(value);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour
      const endString = end.toISOString().slice(0, 16);
      handleChange('scheduledEndAt', endString);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/meetings">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Meetings
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Schedule New Meeting</h1>
          <p className="text-gray-600 mt-2">
            Create a new meeting and Fireflies will automatically join to transcribe
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Meeting Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Meeting Details</CardTitle>
              <CardDescription>
                Fill in the meeting information. All fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Meeting Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Meeting Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Weekly Team Standup"
                  required
                />
              </div>

              {/* Platform Selection */}
              <div className="space-y-2">
                <Label htmlFor="platform">
                  <Video className="h-4 w-4 inline mr-2" />
                  Platform *
                </Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => handleChange('platform', value)}
                >
                  <SelectTrigger id="platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="google_meet">Google Meet</SelectItem>
                    <SelectItem value="microsoft_teams">Microsoft Teams</SelectItem>
                    <SelectItem value="webex">Cisco Webex</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Start Time *
                  </Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.scheduledStartAt}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">
                    <Clock className="h-4 w-4 inline mr-2" />
                    End Time *
                  </Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.scheduledEndAt}
                    onChange={(e) => handleChange('scheduledEndAt', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Meeting URL */}
              <div className="space-y-2">
                <Label htmlFor="meetingUrl">
                  <LinkIcon className="h-4 w-4 inline mr-2" />
                  Meeting URL (Optional)
                </Label>
                <Input
                  id="meetingUrl"
                  type="url"
                  value={formData.externalMeetingUrl}
                  onChange={(e) => handleChange('externalMeetingUrl', e.target.value)}
                  placeholder="https://zoom.us/j/123456789"
                />
                <p className="text-sm text-gray-500">
                  Enter the meeting link if you've already created one
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Add meeting agenda, topics to discuss, or any other details..."
                  rows={4}
                />
              </div>

              {/* Attendees */}
              <div className="space-y-2">
                <Label htmlFor="attendees">
                  <Users className="h-4 w-4 inline mr-2" />
                  Attendees (Optional)
                </Label>
                <Input
                  id="attendees"
                  value={formData.attendees}
                  onChange={(e) => handleChange('attendees', e.target.value)}
                  placeholder="email1@example.com, email2@example.com"
                />
                <p className="text-sm text-gray-500">
                  Separate multiple email addresses with commas
                </p>
              </div>

              {/* Bot Configuration */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Fireflies Bot Settings</h4>
                <p className="text-sm text-blue-800">
                  The Fireflies bot will automatically join this meeting and:
                </p>
                <ul className="list-disc list-inside text-sm text-blue-800 mt-2 space-y-1">
                  <li>Record and transcribe the conversation</li>
                  <li>Generate meeting notes and action items</li>
                  <li>Create searchable transcripts with timestamps</li>
                  <li>Extract key topics and insights</li>
                </ul>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Creating...' : 'Schedule Meeting'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Need help? Check out our{' '}
          <a href="/docs/scheduling" className="text-blue-600 hover:underline">
            meeting scheduling guide
          </a>
        </div>
      </div>
    </div>
  );
}
