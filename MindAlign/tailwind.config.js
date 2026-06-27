/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ivory: '#FBF7F1',
        charcoal: '#14110E',
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#212225',
        },
        'surface-selected': {
          DEFAULT: '#E0E1E6',
          dark: '#2E3135',
        },
        foreground: {
          DEFAULT: '#1A1A1A',
          dark: '#F5F2ED',
        },
        muted: {
          DEFAULT: '#60646C',
          dark: '#B0B4BA',
        },
        success: '#2F7D4A',
        rescued: '#C47A1A',
        failed: '#B42318',
        accent: '#3D6B4F',
      },
    },
  },
  plugins: [],
};
