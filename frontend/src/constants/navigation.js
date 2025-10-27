import { Home, Package, LayoutDashboard, User, Settings, Users } from 'lucide-react';

export const PUBLIC_NAVIGATION = [
	{
		name: 'Home',
		href: '/',
		icon: Home,
	},
	{
		name: 'Browse Listings',
		href: '/listings',
		icon: Package,
	},
];

// Authenticated user navigation items
export const USER_NAVIGATION = [
	{
		name: 'Dashboard',
		href: '/dashboard',
		icon: LayoutDashboard,
	},
	{
		name: 'My Listings',
		href: '/my-listings',
		icon: Package,
	},
	{
		name: 'Profile',
		href: '/profile',
		icon: User,
	},
	{
		name: 'Settings',
		href: '/settings',
		icon: Settings,
	},
];

export const ADMIN_NAVIGATION = [
	{
		name: 'User Management',
		href: '/admin/users',
		icon: Users,
	},
];
