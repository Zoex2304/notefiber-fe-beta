import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  Wrench,
  UserCog,
  Palette,
  Bell,
  Monitor,
  HelpCircle,
  Command,
  GalleryVerticalEnd,
  AudioWaveform,
  ScrollText,
  CreditCard,
  RotateCcw,
  Activity,
  Bot,
  Settings2,
  Ban,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'FuckingZEE',
    email: 'FuckingZEEdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Notefiber Administrator',
      logo: Command,
      plan: '@Fuckingzee',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'Admin',
      items: [
        {
          title: 'Dashboard',
          url: '/admin', // Dashboard is at /admin
          icon: LayoutDashboard,
        },
        {
          title: 'Subscription Plans',
          url: '/admin/plans',
          icon: Package,
        },
        {
          title: 'Users',
          url: '/admin/users',
          icon: Users,
        },
        {
          title: 'Token Usage',
          url: '/admin/token-usage',
          icon: Activity,
        },
        {
          title: 'Payments',
          url: '/admin/payments',
          icon: CreditCard,
        },
        {
          title: 'Refunds',
          url: '/admin/refunds',
          icon: RotateCcw,
        },
        {
          title: 'Cancellations',
          url: '/admin/cancellations',
          icon: Ban,
        },
        {
          title: 'System Logs',
          url: '/admin/logs',
          icon: ScrollText,
        },
      ],
    },

    {
      title: 'AI Management',
      items: [
        {
          title: 'Configurations',
          url: '/admin/ai/configurations',
          icon: Settings2,
        },
        {
          title: 'Nuances',
          url: '/admin/ai/nuances',
          icon: Bot,
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/admin/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/admin/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/admin/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/admin/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/admin/settings/display',
              icon: Monitor,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/admin/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
