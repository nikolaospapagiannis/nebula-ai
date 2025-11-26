import { PrismaClient, UserRole, SubscriptionTier, SubscriptionStatus, MeetingStatus, RecordingSource } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in reverse order of dependencies)
  console.log('🧹 Clearing existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('Demo123456!', 10);

  // Create Organizations
  console.log('🏢 Creating organizations...');
  const org1 = await prisma.organization.create({
    data: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
      domain: 'acme.com',
      logoUrl: 'https://ui-avatars.com/api/?name=Acme+Corp&background=7a5af8&color=fff',
      subscriptionTier: SubscriptionTier.business,
      subscriptionStatus: SubscriptionStatus.active,
      settings: {
        timezone: 'America/New_York',
        language: 'en',
        autoRecording: true,
        aiSummaries: true,
      },
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: 'TechStart Inc',
      slug: 'techstart',
      domain: 'techstart.io',
      logoUrl: 'https://ui-avatars.com/api/?name=TechStart&background=9945ff&color=fff',
      subscriptionTier: SubscriptionTier.pro,
      subscriptionStatus: SubscriptionStatus.active,
      settings: {
        timezone: 'America/Los_Angeles',
        language: 'en',
        autoRecording: true,
        aiSummaries: true,
      },
    },
  });

  const org3 = await prisma.organization.create({
    data: {
      name: 'Freelance Consultants',
      slug: 'freelance-consultants',
      subscriptionTier: SubscriptionTier.free,
      subscriptionStatus: SubscriptionStatus.active,
      settings: {
        timezone: 'UTC',
        language: 'en',
        autoRecording: false,
        aiSummaries: false,
      },
    },
  });

  // Create Users
  console.log('👥 Creating users...');

  // Admin users
  const admin1 = await prisma.user.create({
    data: {
      email: 'admin@acme.com',
      passwordHash: hashedPassword,
      firstName: 'John',
      lastName: 'Admin',
      role: UserRole.admin,
      emailVerified: true,
      organizationId: org1.id,
      avatarUrl: 'https://ui-avatars.com/api/?name=John+Admin&background=7a5af8&color=fff',
      preferences: {
        notifications: true,
        emailDigest: 'weekly',
      },
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      email: 'sarah@techstart.io',
      passwordHash: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Chen',
      role: UserRole.admin,
      emailVerified: true,
      organizationId: org2.id,
      avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=9945ff&color=fff',
      preferences: {
        notifications: true,
        emailDigest: 'daily',
      },
    },
  });

  // Regular users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@acme.com',
        passwordHash: hashedPassword,
        firstName: 'Alice',
        lastName: 'Johnson',
        role: UserRole.user,
        emailVerified: true,
        organizationId: org1.id,
        avatarUrl: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=06b6d4&color=fff',
        preferences: { notifications: true },
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@acme.com',
        passwordHash: hashedPassword,
        firstName: 'Bob',
        lastName: 'Smith',
        role: UserRole.user,
        emailVerified: true,
        organizationId: org1.id,
        avatarUrl: 'https://ui-avatars.com/api/?name=Bob+Smith&background=8b5cf6&color=fff',
        preferences: { notifications: true },
      },
    }),
    prisma.user.create({
      data: {
        email: 'carol@acme.com',
        passwordHash: hashedPassword,
        firstName: 'Carol',
        lastName: 'Williams',
        role: UserRole.user,
        emailVerified: true,
        organizationId: org1.id,
        avatarUrl: 'https://ui-avatars.com/api/?name=Carol+Williams&background=ec4899&color=fff',
        preferences: { notifications: false },
      },
    }),
    prisma.user.create({
      data: {
        email: 'david@techstart.io',
        passwordHash: hashedPassword,
        firstName: 'David',
        lastName: 'Lee',
        role: UserRole.user,
        emailVerified: true,
        organizationId: org2.id,
        avatarUrl: 'https://ui-avatars.com/api/?name=David+Lee&background=f59e0b&color=fff',
        preferences: { notifications: true },
      },
    }),
    prisma.user.create({
      data: {
        email: 'emma@techstart.io',
        passwordHash: hashedPassword,
        firstName: 'Emma',
        lastName: 'Brown',
        role: UserRole.user,
        emailVerified: true,
        organizationId: org2.id,
        avatarUrl: 'https://ui-avatars.com/api/?name=Emma+Brown&background=10b981&color=fff',
        preferences: { notifications: true },
      },
    }),
    prisma.user.create({
      data: {
        email: 'freelancer@example.com',
        passwordHash: hashedPassword,
        firstName: 'Frank',
        lastName: 'Miller',
        role: UserRole.user,
        emailVerified: true,
        organizationId: org3.id,
        avatarUrl: 'https://ui-avatars.com/api/?name=Frank+Miller&background=6366f1&color=fff',
        preferences: { notifications: true },
      },
    }),
  ]);

  // Create Workspaces
  console.log('💼 Creating workspaces...');
  const workspace1 = await prisma.workspace.create({
    data: {
      name: 'Sales Team',
      organizationId: org1.id,
      settings: {
        defaultRecording: true,
        autoTranscription: true,
      },
    },
  });

  const workspace2 = await prisma.workspace.create({
    data: {
      name: 'Product Team',
      organizationId: org1.id,
      settings: {
        defaultRecording: true,
        autoTranscription: true,
      },
    },
  });

  const workspace3 = await prisma.workspace.create({
    data: {
      name: 'Engineering',
      organizationId: org2.id,
      settings: {
        defaultRecording: true,
        autoTranscription: true,
      },
    },
  });

  // Create Meetings
  console.log('📅 Creating meetings...');
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  await Promise.all([
    // Completed meetings
    prisma.meeting.create({
      data: {
        title: 'Q4 Sales Strategy Review',
        description: 'Quarterly sales performance review and strategy planning for Q4',
        organizationId: org1.id,
        userId: admin1.id,
        workspaceId: workspace1.id,
        scheduledStartAt: lastWeek,
        scheduledEndAt: new Date(lastWeek.getTime() + 60 * 60 * 1000),
        actualStartAt: lastWeek,
        actualEndAt: new Date(lastWeek.getTime() + 65 * 60 * 1000),
        status: MeetingStatus.completed,
        meetingUrl: 'https://zoom.us/j/123456789',
        platform: 'zoom',
        recordingSource: RecordingSource.bot,
        metadata: {
          attendeeCount: 8,
          recordingSize: 245000000,
          duration: 3900,
          hasVideo: true,
          hasScreenShare: true,
        },
      },
    }),
    prisma.meeting.create({
      data: {
        title: 'Product Roadmap Planning - H2 2024',
        description: 'Planning session for second half product roadmap',
        organizationId: org1.id,
        userId: users[0].id,
        workspaceId: workspace2.id,
        scheduledStartAt: yesterday,
        scheduledEndAt: new Date(yesterday.getTime() + 90 * 60 * 1000),
        actualStartAt: yesterday,
        actualEndAt: new Date(yesterday.getTime() + 95 * 60 * 1000),
        status: MeetingStatus.completed,
        meetingUrl: 'https://meet.google.com/abc-defg-hij',
        platform: 'google_meet',
        recordingSource: RecordingSource.extension,
        metadata: {
          attendeeCount: 6,
          recordingSize: 180000000,
          duration: 5700,
          hasVideo: true,
          hasScreenShare: true,
        },
      },
    }),
    prisma.meeting.create({
      data: {
        title: 'Client Demo - Enterprise Features',
        description: 'Product demonstration for potential enterprise client',
        organizationId: org1.id,
        userId: users[1].id,
        workspaceId: workspace1.id,
        scheduledStartAt: new Date(yesterday.getTime() - 2 * 24 * 60 * 60 * 1000),
        scheduledEndAt: new Date(yesterday.getTime() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        actualStartAt: new Date(yesterday.getTime() - 2 * 24 * 60 * 60 * 1000),
        actualEndAt: new Date(yesterday.getTime() - 2 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000),
        status: MeetingStatus.completed,
        meetingUrl: 'https://zoom.us/j/987654321',
        platform: 'zoom',
        recordingSource: RecordingSource.bot,
        metadata: {
          attendeeCount: 5,
          recordingSize: 120000000,
          duration: 3000,
          hasVideo: true,
          hasScreenShare: true,
        },
      },
    }),
    prisma.meeting.create({
      data: {
        title: 'Engineering Sprint Planning',
        description: 'Two-week sprint planning for engineering team',
        organizationId: org2.id,
        userId: admin2.id,
        workspaceId: workspace3.id,
        scheduledStartAt: new Date(yesterday.getTime() - 3 * 24 * 60 * 60 * 1000),
        scheduledEndAt: new Date(yesterday.getTime() - 3 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000),
        actualStartAt: new Date(yesterday.getTime() - 3 * 24 * 60 * 60 * 1000),
        actualEndAt: new Date(yesterday.getTime() - 3 * 24 * 60 * 60 * 1000 + 110 * 60 * 1000),
        status: MeetingStatus.completed,
        meetingUrl: 'https://teams.microsoft.com/l/meetup-join/xyz',
        platform: 'teams',
        recordingSource: RecordingSource.bot,
        metadata: {
          attendeeCount: 12,
          recordingSize: 290000000,
          duration: 6600,
          hasVideo: true,
          hasScreenShare: false,
        },
      },
    }),

    // Scheduled meetings (upcoming)
    prisma.meeting.create({
      data: {
        title: 'Weekly Team Standup',
        description: 'Regular team sync and updates',
        organizationId: org1.id,
        userId: admin1.id,
        workspaceId: workspace1.id,
        scheduledStartAt: tomorrow,
        scheduledEndAt: new Date(tomorrow.getTime() + 30 * 60 * 1000),
        status: MeetingStatus.scheduled,
        meetingUrl: 'https://zoom.us/j/111222333',
        platform: 'zoom',
        metadata: {
          isRecurring: true,
          recurrencePattern: 'weekly',
        },
      },
    }),
    prisma.meeting.create({
      data: {
        title: 'Board Meeting - Monthly Review',
        description: 'Monthly board meeting and financial review',
        organizationId: org1.id,
        userId: admin1.id,
        workspaceId: workspace2.id,
        scheduledStartAt: nextWeek,
        scheduledEndAt: new Date(nextWeek.getTime() + 120 * 60 * 1000),
        status: MeetingStatus.scheduled,
        meetingUrl: 'https://zoom.us/j/444555666',
        platform: 'zoom',
        metadata: {
          isConfidential: true,
        },
      },
    }),
    prisma.meeting.create({
      data: {
        title: 'Customer Interview - User Research',
        description: 'Interview session for product research',
        organizationId: org2.id,
        userId: users[3].id,
        workspaceId: workspace3.id,
        scheduledStartAt: new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000),
        scheduledEndAt: new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        status: MeetingStatus.scheduled,
        meetingUrl: 'https://meet.google.com/user-research-123',
        platform: 'google_meet',
        metadata: {
          customerSegment: 'enterprise',
          researchType: 'feature_validation',
        },
      },
    }),
  ]);

  // Skip audit logs for now
  console.log('⏭️  Skipping audit logs (optional)...');

  console.log('✅ Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Organizations: 3`);
  console.log(`   - Users: ${users.length + 2} (including 2 admins)`);
  console.log(`   - Workspaces: 3`);
  console.log(`   - Meetings: 7 (4 completed, 3 scheduled)`);
  console.log('\n🔑 Test Credentials:');
  console.log(`   Email: admin@acme.com`);
  console.log(`   Email: sarah@techstart.io`);
  console.log(`   Email: alice@acme.com`);
  console.log(`   Password (all users): Demo123456!`);
  console.log('   Note: All users are email verified and can log in immediately\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
