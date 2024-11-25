/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', 'class'],
  mode: 'jit', // Ativa o modo Just-In-Time
  content: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
  theme: {
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			success: {
  				DEFAULT: '#10B981',
  				foreground: '#FFFFFF'
  			},
  			warning: {
  				DEFAULT: '#F59E0B',
  				foreground: '#FFFFFF'
  			},
  			info: {
  				DEFAULT: '#3B82F6',
  				foreground: '#FFFFFF'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		fontFamily: {
  			sans: ['Inter', 'sans-serif'],
  			serif: ['Merriweather', 'serif']
  		},
  		container: {
  			center: 'true',
  			padding: '2rem'
  		},
  		spacing: {
  			'128': '32rem',
  			'144': '36rem'
  		},
  		borderRadius: {
  			lg: '`var(--radius)`',
  			md: '`calc(var(--radius) - 2px)`',
  			sm: 'calc(var(--radius) - 4px)',
  			xl: '1rem'
  		},
  		boxShadow: {
  			'3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)'
  		},
  		sidebar: {
  			DEFAULT: 'hsl(var(--sidebar-background))',
  			foreground: 'hsl(var(--sidebar-foreground))',
  			primary: 'hsl(var(--sidebar-primary))',
  			'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  			accent: 'hsl(var(--sidebar-accent))',
  			'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  			border: 'hsl(var(--sidebar-border))',
  			ring: 'hsl(var(--sidebar-ring))'
  		},
  		keyframes: {
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
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [
    import('tailwindcss-animate'), // Correção na importação
  ],
};
