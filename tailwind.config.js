import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
		"./admin/**/*.{ts,tsx}",
		"*.{js,ts,jsx,tsx,mdx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'var(--border)',
				input: 'var(--input)',
				ring: 'var(--ring)',
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				primary: {
					DEFAULT: 'var(--primary)',
					foreground: 'var(--primary-foreground)'
				},
				secondary: {
					DEFAULT: 'var(--secondary)',
					foreground: 'var(--secondary-foreground)'
				},
				destructive: {
					DEFAULT: 'var(--destructive)',
					foreground: 'var(--destructive-foreground)'
				},
				muted: {
					DEFAULT: 'var(--muted)',
					foreground: 'var(--muted-foreground)'
				},
				accent: {
					DEFAULT: 'var(--accent)',
					foreground: 'var(--accent-foreground)'
				},
				popover: {
					DEFAULT: 'var(--popover)',
					foreground: 'var(--popover-foreground)'
				},
				card: {
					DEFAULT: 'var(--card)',
					foreground: 'var(--card-foreground)'
				},
				chart: {
					'1': 'var(--chart-1)',
					'2': 'var(--chart-2)',
					'3': 'var(--chart-3)',
					'4': 'var(--chart-4)',
					'5': 'var(--chart-5)'
				},
				customBorder: {
					gray: '#666666',
					'white-muted': '#ffffff33',
					secondary: '#e0e7f5',
					background: '#f5f6f9',
					primary: '#d8d8db',
					'primary-muted-fade': '#ffffff33',
					light: '#e6e6e6',
					dark: '#060b13',
					neutral: '#d8d8db',
					violet: '#573dc1'
				},
				'royal-violet': {
					base: '#7050f0',
					muted: '#b7aaee'
				},
				customFont: {
					base: '#909090',
					'dark-base': '#060b13'
				},
				'cool-grey-1': '#E0EAFC',
				'cool-grey-2': '#FAFAFA',
				sidebar: {
					DEFAULT: 'var(--sidebar-background)',
					foreground: 'var(--sidebar-foreground)',
					primary: 'var(--sidebar-primary)',
					'primary-foreground': 'var(--sidebar-primary-foreground)',
					accent: 'var(--sidebar-accent)',
					'accent-foreground': 'var(--sidebar-accent-foreground)',
					border: 'var(--sidebar-border)',
					ring: 'var(--sidebar-ring)'
				},
				'soft-purple': '#F8F6F9',
				'shiny-pink': '#FF649A',
				'shiny-white': '#FFFFFF',
				'shiny-purple': '#7050F0',
			},
			backgroundImage: {
				'gradient-primary-violet': 'linear-gradient(360deg, #7050f0 0%, #b7aaee 100%)',
				'gradient-secondary': 'linear-gradient(0deg, #7050f0 0%, #9e8ce8 100%)',
				'gradient-purple': 'linear-gradient(360deg, #7050f0 0%, #ffffff 100%)',
				'gradient-pink': 'linear-gradient(360deg, #ff649a 0%, #ffffff 100%)'
			},
			keyframes: {
				scroll: {
					from: {
						transform: 'translateX(0)'
					},
					to: {
						transform: 'translateX(-100%)'
					}
				},
				'scroll-y': {
					from: {
						transform: 'translateY(0)'
					},
					to: {
						transform: 'translateY(-50%)'
					}
				},
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				shimmer: {
					'0%': {
						transform: 'translateX(-100%)'
					},
					'100%': {
						transform: 'translateX(100%)'
					}
				},
				'collapsible-down': {
					from: {
						height: '0',
						opacity: '0'
					},
					to: {
						height: 'var(--radix-collapsible-content-height)',
						opacity: '1'
					}
				},
				'collapsible-up': {
					from: {
						height: 'var(--radix-collapsible-content-height)',
						opacity: '1'
					},
					to: {
						height: '0',
						opacity: '0'
					}
				},
				'shiny-text': {
					'0%, 100%': {
						'background-size': '200% 200%',
						'background-position': 'left center'
					},
					'50%': {
						'background-size': '200% 200%',
						'background-position': 'right center'
					}
				}
			},
			animation: {
				scroll: 'scroll 40s linear infinite',
				'scroll-y': 'scroll-y 60s linear infinite',
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				shimmer: 'shimmer 2s infinite',
				'collapsible-down': 'collapsible-down 0.2s ease-out',
				'collapsible-up': 'collapsible-up 0.2s ease-out',
				'shiny-text': 'shiny-text 8s ease infinite',
			},
			fontFamily: {
				sans: [
					'Nacelle',
					...defaultTheme.fontFamily.sans
				]
			},
			fontSize: {
				'display-h1': [
					'61px',
					{
						lineHeight: '85.4px'
					}
				],
				'display-h2': [
					'49px',
					{
						lineHeight: '68.6px'
					}
				],
				'display-h3': [
					'39px',
					{
						lineHeight: '54.6px'
					}
				],
				'display-h4': [
					'31px',
					{
						lineHeight: '43.4px'
					}
				],
				'display-h5': [
					'25px',
					{
						lineHeight: '35px'
					}
				],
				'body-1': [
					'20px',
					{
						lineHeight: '28px'
					}
				],
				'body-base': [
					'16px',
					{
						lineHeight: '22.4px'
					}
				],
				'body-3': [
					'13px',
					{
						lineHeight: '18.2px'
					}
				],
				'body-4': [
					'11px',
					{
						lineHeight: '14px'
					}
				],
				'body-5': [
					'10.5px',
					{
						lineHeight: '14px'
					}
				],
				'caption-1': [
					'8px',
					{
						lineHeight: '11.2px'
					}
				],
				'caption-2': [
					'7px',
					{
						lineHeight: '9.8px'
					}
				],
				'caption-raise': [
					'15.17px',
					{
						lineHeight: '21.23px'
					}
				],
				'button-text': [
					'14px',
					{
						lineHeight: '19.6px'
					}
				],
				'overline-text': [
					'12px',
					{
						lineHeight: '16.8px'
					}
				]
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	}
}
