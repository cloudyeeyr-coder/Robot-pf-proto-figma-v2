export interface Notification {
  id: string;
  recipient_id: string;
  type: 'escrow' | 'as' | 'badge' | 'proposal' | 'system';
  title: string;
  body: string;
  deep_link: string;
  is_read: boolean;
  created_at: string;
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001',
    recipient_id: 'buyer-001',
    type: 'escrow',
    title: '에스크로 입금이 확인되었습니다',
    body: '계약 C2024-001에 대한 에스크로 입금이 완료되었습니다. 이제 SI 파트너가 작업을 시작할 수 있습니다.',
    deep_link: '/contracts/C2024-001/payment/status',
    is_read: false,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5분 전
  },
  {
    id: 'notif-002',
    recipient_id: 'buyer-001',
    type: 'as',
    title: 'AS 엔지니어가 배정되었습니다',
    body: 'AS 티켓 AS-2024-042에 김수리 엔지니어가 배정되었습니다.',
    deep_link: '/contracts/C2024-002/as/AS-2024-042',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
  },
  {
    id: 'notif-003',
    recipient_id: 'si_partner-001',
    type: 'proposal',
    title: '새로운 파트너십 제안이 도착했습니다',
    body: 'ABB 로보틱스에서 파트너십을 제안했습니다. 5영업일 이내에 응답해주세요.',
    deep_link: '/partner/proposals',
    is_read: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1일 전
  },
  {
    id: 'notif-004',
    recipient_id: 'si_partner-001',
    type: 'badge',
    title: '뱃지가 곧 만료됩니다',
    body: 'ABB 로보틱스 뱃지가 7일 후 만료됩니다. 갱신이 필요합니다.',
    deep_link: '/partner/badges',
    is_read: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2일 전
  },
  {
    id: 'notif-005',
    recipient_id: 'buyer-001',
    type: 'system',
    title: '검수 기한이 다가옵니다',
    body: '계약 C2024-001의 검수 기한이 3일 남았습니다. 기한 내 검수를 완료해주세요.',
    deep_link: '/contracts/C2024-001/inspection',
    is_read: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 전
  },
  {
    id: 'notif-006',
    recipient_id: 'manufacturer-001',
    type: 'proposal',
    title: 'SI 파트너가 제안을 수락했습니다',
    body: '로봇시스템즈가 파트너십 제안을 수락했습니다. 뱃지가 자동 발급되었습니다.',
    deep_link: '/manufacturer/proposals',
    is_read: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5일 전
  },
  {
    id: 'notif-007',
    recipient_id: 'buyer-001',
    type: 'escrow',
    title: '에스크로 자금이 방출되었습니다',
    body: '계약 C2024-003에 대한 에스크로 자금이 SI 파트너에게 방출되었습니다.',
    deep_link: '/contracts/C2024-003/payment/status',
    is_read: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 전
  },
  {
    id: 'notif-008',
    recipient_id: 'si_partner-001',
    type: 'as',
    title: 'AS 티켓이 완료되었습니다',
    body: 'AS 티켓 AS-2024-041이 완료 처리되었습니다.',
    deep_link: '/contracts/C2024-001/as/AS-2024-041',
    is_read: true,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10일 전
  },
];

export function getNotificationsByUser(userId: string): Notification[] {
  return MOCK_NOTIFICATIONS.filter((n) => n.recipient_id === userId);
}

export function getUnreadCount(userId: string): number {
  return MOCK_NOTIFICATIONS.filter(
    (n) => n.recipient_id === userId && !n.is_read
  ).length;
}

export function markAsRead(notificationId: string): boolean {
  const notification = MOCK_NOTIFICATIONS.find((n) => n.id === notificationId);
  if (!notification) return false;
  notification.is_read = true;
  return true;
}

export function markAllAsRead(userId: string): boolean {
  MOCK_NOTIFICATIONS.forEach((n) => {
    if (n.recipient_id === userId) {
      n.is_read = true;
    }
  });
  return true;
}

export function getNotificationIcon(type: Notification['type']): string {
  switch (type) {
    case 'escrow':
      return '💰';
    case 'as':
      return '🔧';
    case 'badge':
      return '🏅';
    case 'proposal':
      return '🤝';
    case 'system':
      return '⚙️';
  }
}

export function getRelativeTime(timestamp: string): string {
  const now = Date.now();
  const past = new Date(timestamp).getTime();
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  return new Date(timestamp).toLocaleDateString('ko-KR');
}
