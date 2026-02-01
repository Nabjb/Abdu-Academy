import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Breadcrumb } from '@/components/layout/breadcrumb';

const dashboardItems = [
  { title: 'My Courses', href: '/dashboard/my-courses' },
  { title: 'Profile', href: '/dashboard/profile' },
  { title: 'Purchase History', href: '/dashboard/purchases' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar items={dashboardItems} />
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
