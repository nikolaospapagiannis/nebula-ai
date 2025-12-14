import { redirect } from 'next/navigation';

export default function ProfileRedirect() {
  // Redirect to the dashboard-integrated profile page
  redirect('/settings');
}
