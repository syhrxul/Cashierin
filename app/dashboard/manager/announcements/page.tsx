'use client';

import AnnouncementsManagement from '@/components/announcements/AnnouncementsManagement';

export default function ManagerAnnouncementsPage() {
  return <AnnouncementsManagement role="owner" />; // Managers use the same UI as owners for their store
}
