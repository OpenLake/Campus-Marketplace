// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Map 'primary' to 'indigo' so the bg-primary-600 classes work
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#4f46e5', // This is what bg-primary-600 will use
          700: '#4338ca',
          800: '#3730a3',
          900: '#1e1b4b',
        },
      },
    },
  },
  plugins: [],
}