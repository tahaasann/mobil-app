import type { NotificationPort } from '@/application/ports/notification.port';
import {
  RequestNotificationPermissionUseCase,
  RescheduleAllNotificationsUseCase,
  ScheduleHabitNotificationsUseCase,
  type NotificationContentBuilder,
} from '@/application/use-cases/notification.use-case';
import type { HabitRepository } from '@/application/ports/habit-repository.port';
import type { UserProfileRepository } from '@/application/ports/user-profile-repository.port';
import type { Habit } from '@/domain/entities/habit';
import type { UserProfile } from '@/domain/entities/user-profile';

class InMemoryNotificationPort implements NotificationPort {
  public scheduled: Array<{
    identifier: string;
    title: string;
    body: string;
    trigger: { type: 'daily'; hour: number; minute: number };
    data: Record<string, string>;
  }> = [];

  async requestPermissions(): Promise<'granted' | 'denied'> {
    return 'granted';
  }

  async schedule(request: {
    identifier: string;
    title: string;
    body: string;
    trigger: { type: 'daily'; hour: number; minute: number };
    data: Record<string, string>;
  }): Promise<void> {
    this.scheduled = this.scheduled.filter((item) => item.identifier !== request.identifier);
    this.scheduled.push(request);
  }

  async cancel(identifier: string): Promise<void> {
    this.scheduled = this.scheduled.filter((item) => item.identifier !== identifier);
  }

  async cancelAllForHabit(habitId: string): Promise<void> {
    this.scheduled = this.scheduled.filter((item) => !item.identifier.startsWith(`${habitId}-`));
  }

  async cancelAll(): Promise<void> {
    this.scheduled = [];
  }
}

class InMemoryHabitRepository implements HabitRepository {
  constructor(public items: Habit[]) {}

  async create(_habit: Habit): Promise<void> {}

  async findAllActive(): Promise<Habit[]> {
    return this.items.filter((item) => item.isActive);
  }

  async findById(id: string): Promise<Habit | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }
}

class InMemoryUserProfileRepository implements UserProfileRepository {
  constructor(private readonly profile: UserProfile | null) {}

  async get(): Promise<UserProfile | null> {
    return this.profile;
  }

  async save(_profile: UserProfile): Promise<void> {}
}

const content: NotificationContentBuilder = ({ kind, habitTitle }) => ({
  title: kind === 'checkin' ? 'Check-in' : 'Streak at risk',
  body: habitTitle,
});

describe('ScheduleHabitNotificationsUseCase', () => {
  it('schedules checkin and streak risk for morning profile', async () => {
    const port = new InMemoryNotificationPort();
    const useCase = new ScheduleHabitNotificationsUseCase(port);

    await useCase.execute({
      habit: {
        id: 'habit-1',
        title: 'Meditate',
        description: null,
        schedule: 'daily',
        isActive: true,
        sortOrder: 0,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      profile: {
        id: 'profile-1',
        identityGoal: null,
        defaultTone: 'gentle',
        commonBarrier: null,
        notifWindow: 'morning',
        notifFrequency: 1,
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      content,
    });

    expect(port.scheduled).toHaveLength(2);
    expect(port.scheduled[0]).toMatchObject({
      identifier: 'habit-1-checkin-8-0',
      data: { habitId: 'habit-1', kind: 'checkin', deeplink: '/excuse/habit-1' },
    });
    expect(port.scheduled[1]).toMatchObject({
      identifier: 'habit-1-streak_risk-21-30',
      data: { habitId: 'habit-1', kind: 'streak_risk', deeplink: '/excuse/habit-1' },
    });
  });

  it('skips scheduling when notifications were skipped in onboarding', async () => {
    const port = new InMemoryNotificationPort();
    const useCase = new ScheduleHabitNotificationsUseCase(port);

    await useCase.execute({
      habit: {
        id: 'habit-1',
        title: 'Meditate',
        description: null,
        schedule: 'daily',
        isActive: true,
        sortOrder: 0,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      profile: {
        id: 'profile-1',
        identityGoal: null,
        defaultTone: 'gentle',
        commonBarrier: null,
        notifWindow: null,
        notifFrequency: null,
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      content,
    });

    expect(port.scheduled).toHaveLength(0);
  });
});

describe('RescheduleAllNotificationsUseCase', () => {
  it('schedules notifications for every active habit', async () => {
    const port = new InMemoryNotificationPort();
    const scheduleUseCase = new ScheduleHabitNotificationsUseCase(port);
    const habits = [
      {
        id: 'habit-1',
        title: 'Meditate',
        description: null,
        schedule: 'daily' as const,
        isActive: true,
        sortOrder: 0,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      {
        id: 'habit-2',
        title: 'Walk',
        description: null,
        schedule: 'daily' as const,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ];
    const useCase = new RescheduleAllNotificationsUseCase(
      new InMemoryHabitRepository(habits),
      new InMemoryUserProfileRepository({
        id: 'profile-1',
        identityGoal: null,
        defaultTone: 'gentle',
        commonBarrier: null,
        notifWindow: 'morning',
        notifFrequency: 1,
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
      scheduleUseCase,
    );

    await useCase.execute({ content });

    expect(port.scheduled).toHaveLength(4);
  });
});

describe('RequestNotificationPermissionUseCase', () => {
  it('returns granted when port allows notifications', async () => {
    const useCase = new RequestNotificationPermissionUseCase(new InMemoryNotificationPort());
    await expect(useCase.execute()).resolves.toBe('granted');
  });
});
