import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

interface CityComfort {
  cityCode: string;
  cityName: string;
  rank: number;
  description: string;
  temp: number;
  humidity: number;
  windSpeed: number;
  clouds: number;
  comfortIndex: number;
}


function getComfortStyle(score: number) {
  if (score >= 85) {
    return { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400', bar: 'bg-emerald-500', label:'Comfortable' };
  }
  if (score >= 65) {
    return { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400', bar: 'bg-amber-500', label:'Moderate' };
  }
  return { badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400', bar: 'bg-rose-500', label:'Uncomfortable' };
}

function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return { isDark, toggle: () => setIsDark((d) => !d) };
}

  
function App() {
  const {
    isAuthenticated,
    isLoading: authLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();
  const [cities, setCities] = useState<CityComfort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isDark, toggle } = useDarkMode();

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    getAccessTokenSilently()
      .then((token) => {
        return fetch('http://localhost:5000/api/cities', {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => setCities(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated, getAccessTokenSilently]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-400 dark:text-slate-500 text-sm p-6">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Weather Comfort Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Sign in to view city rankings</p>
        
          <button
            onClick={() => loginWithRedirect()}
            className="bg-blue-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Weather Comfort Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Weather by comfort index across {cities.length} cities
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggle}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? 'Light mode' : 'Dark mode'}
            </button>

            <button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
            >
                Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <p className="text-rose-600 text-sm bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg px-4 py-3 mb-6">
            Error: {error}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cities.map((city) => {
            const style = getComfortStyle(city.comfortIndex);
            return (
              <div
                key={city.cityCode}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                      #{city.rank}
                    </span>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                      {city.cityName}
                    </h2>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${style.badge}`}>
                    {style.label}
                  </span>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 capitalize mb-4">
                  {city.description}
                </p>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-semibold text-slate-800 dark:text-slate-100">
                    {city.temp.toFixed(1)}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 text-sm">°C</span>
                </div>

                <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <div className="flex justify-between">
                    <span>Humidity</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{city.humidity}%</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Wind</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{city.windSpeed} m/s</span>
                  </div>
                
                  <div className="flex justify-between">
                    <span>Cloud cover</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{city.clouds}%</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 dark:text-slate-400">Comfort Index</span>
                    <span className="font-medium text-slate-800 dark:text-slate-100">{city.comfortIndex}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${style.bar} rounded-full`}
                      style={{ width: `${city.comfortIndex}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default App;