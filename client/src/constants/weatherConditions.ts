// client/src/constants/weatherConditions.ts

export const weatherConditions = {
  'clear sky': {
    video: '/videos/sunny.mp4',
    glass: 'bg-white/20 dark:bg-slate-900/20',
    textColor: 'text-amber-700 dark:text-amber-300',
    accent: 'bg-amber-500/30',
    emoji: '☀️',
  },
  'few clouds': {
    video: '/videos/partly-cloudy.mp4',
    glass: 'bg-white/20 dark:bg-slate-900/20',
    textColor: 'text-sky-700 dark:text-sky-300',
    accent: 'bg-sky-500/30',
    emoji: '⛅',
  },
  'scattered clouds': {
    video: '/videos/cloudy.mp4',
    glass: 'bg-white/20 dark:bg-slate-900/20',
    textColor: 'text-slate-700 dark:text-slate-300',
    accent: 'bg-slate-500/30',
    emoji: '☁️',
  },
  'overcast clouds': {
    video: '/videos/overcast.mp4',
    glass: 'bg-white/30 dark:bg-slate-800/30',
    textColor: 'text-slate-600 dark:text-slate-400',
    accent: 'bg-slate-600/30',
    emoji: '🌥️',
  },
  'light rain': {
    video: '/videos/rain.mp4',
    glass: 'bg-white/15 dark:bg-slate-900/15',
    textColor: 'text-blue-600 dark:text-blue-300',
    accent: 'bg-blue-500/30',
    emoji: '🌧️',
  },
  'moderate rain': {
    video: '/videos/rain-heavy.mp4',
    glass: 'bg-white/10 dark:bg-slate-900/10',
    textColor: 'text-blue-700 dark:text-blue-200',
    accent: 'bg-blue-600/30',
    emoji: '🌧️',
  },
  'heavy rain': {
    video: '/videos/rain-heavy.mp4',
    glass: 'bg-white/5 dark:bg-slate-900/5',
    textColor: 'text-blue-800 dark:text-blue-100',
    accent: 'bg-blue-700/30',
    emoji: '🌊',
  },
  'thunderstorm': {
    video: '/videos/thunderstorm.mp4',
    glass: 'bg-white/5 dark:bg-slate-900/5',
    textColor: 'text-yellow-600 dark:text-yellow-300',
    accent: 'bg-yellow-500/30',
    emoji: '⛈️',
    lightning: true,
  },
  'snow': {
    video: '/videos/snow.mp4',
    glass: 'bg-white/40 dark:bg-slate-900/40',
    textColor: 'text-slate-600 dark:text-slate-200',
    accent: 'bg-slate-200/30',
    emoji: '❄️',
  },
  'mist': {
    video: '/videos/mist.mp4',
    glass: 'bg-white/30 dark:bg-slate-800/30',
    textColor: 'text-slate-600 dark:text-slate-300',
    accent: 'bg-slate-400/30',
    emoji: '🌫️',
  },
  'fog': {
    video: '/videos/fog.mp4',
    glass: 'bg-white/40 dark:bg-slate-800/40',
    textColor: 'text-slate-500 dark:text-slate-300',
    accent: 'bg-slate-300/30',
    emoji: '🌫️',
  },
};

export default weatherConditions;