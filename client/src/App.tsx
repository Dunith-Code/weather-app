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
    return { badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500', label:'Comfortable' };
  }
  if (score >= 65) {
    return { badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500', label:'Moderate' };
  }
  return { badge: 'bg-rose-100 text-rose-700', bar: 'bg-rose-500', label:'Uncomfortable' };
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

  if (authLoading || loading) return <p className="p-6">Loading...</p>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Weather Comfort Dashboard
          </h1>
          <p className="text-slate-500 mb-6">Sign in to view city rankings</p>
        
          <button
            onClick={() => loginWithRedirect()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Weather Comfort Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Weather by comfort index across {cities.length} cities
            </p>
          </div>
        
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="bg-gray-200 px-4 py-2 rounded-lg"
          >
              Log Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && <p className="text-red-600">Error: {error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cities.map((city) => {
            const style = getComfortStyle(city.comfortIndex);
            return (
              <div
                key={city.cityCode}
                className="bg-white rounded-lg shadow p-4 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-sm font-bold text-white bg-blue-600 rounded-full px-2 py-1">
                      #{city.rank}
                    </span>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {city.cityName}
                    </h2>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${style.badge}`}>
                    {style.label}
                  </span>
                </div>

                <p className="text-sm text-slate-500 capitalize mb-4">
                  {city.description}
                </p>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-semibold text-slate-800">
                    {city.temp.toFixed(1)}
                  </span>
                  <span className="text-slate-400 text-sm">Celcius</span>
                </div>

                <div className="space-y-2 text-xs text-slate-500 mb-4">
                  <div className="flex justify-between">
                    <span>Humidity</span>
                    <span className="font-medium text-slate-700">{city.humidity}%</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Wind</span>
                    <span className="font-medium text-slate-700">{city.windSpeed} m/s</span>
                  </div>
                
                  <div className="flex justify-between">
                    <span>Cloud cover</span>
                    <span className="font-medium text-slate-700">{city.clouds}%</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Comfort Index</span>
                    <span className="font-medium text-slate-800">{city.comfortIndex}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
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