import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

interface CityComfort {
  cityCode: string;
  cityName: string;
  rank: number;
  description: string;
  temp: number;
  comfortIndex: number;
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
        <button
          onClick={() => loginWithRedirect()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Weather Comfort Dashboard</h1>
        <button
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          className="bg-gray-200 px-4 py-2 rounded-lg"
        >
          Log Out
        </button>
      </div>

      {error && <p className="text-red-600">Error: {error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cities.map((city) => (
          <div
            key={city.cityCode}
            className="bg-white rounded-lg shadow p-4 border border-gray-200"
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-x1 font-semibold text-gray-800">
                {city.cityName}
              </h2>
              <span className="text-sm font-bold text-white bg-blue-600 rounded-full px-2 py-1">
                #{city.rank}
              </span>
          </div>
          <p className="text-gray-500 capitalize mb-2">{city.description}</p>
          <p className="text-2xl font-bold text-gray-800">{city.temp}Celsius</p>
          <p className="text-sm text-gray-500 mt-2">
            Comfort Index:{' '}
            <span className="font-semibold text-blue-600">
              {city.comfortIndex}
            </span>
          </p>
        </div>
        ))}
      </div>
    </div>
  );
}

export default App;