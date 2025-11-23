/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  // The safelist forces these colors to exist, ensuring they show up in your app
  safelist: [
    'bg-slate-50', 'bg-blue-50', 'bg-emerald-50', 'bg-purple-50', 'bg-amber-50',
    'border-blue-500', 'border-emerald-500', 'border-purple-500', 'border-amber-500',
    'text-blue-700', 'text-emerald-700', 'text-purple-700', 'text-amber-700',
    'text-blue-600', 'text-green-400', 'text-red-400', 'text-slate-500', 'text-slate-900',
    'animate-bounce', 'shadow-lg', 'rounded-full', 'border-4'
  ],
  plugins: [],
}