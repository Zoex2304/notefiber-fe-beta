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
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Subscription Plans',
          url: '/plans',
          icon: Package,
        },
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Token Usage',
          url: '/token-usage',
          icon: Activity,
        },
        {
          title: 'Payments',
          url: '/payments',
          icon: CreditCard,
        },
        {
          title: 'Refunds',
          url: '/refunds',
          icon: RotateCcw,
        },
        {
          title: 'Cancellations',
          url: '/cancellations',
          icon: Ban,
        },
        {
          title: 'System Logs',
          url: '/logs',
          icon: ScrollText,
        },
      ],
    },

    {
      title: 'AI Management',
      items: [
        {
          title: 'Configurations',
          url: '/ai/configurations',
          icon: Settings2,
        },
        {
          title: 'Nuances',
          url: '/ai/nuances',
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
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
