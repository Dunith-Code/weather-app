import { useEffect, useState } from 'react';

interface CityComfort {
  cityCode: string;
  cityName: string;
  rank: number;
  description: string;
  temp: number;
  comfortIndex: number;
}

  
function App() {
  const [cities, setCities] = useState<CityComfort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/cities')
    .then((res) => {
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      return res.json();
    })
    .then((data) => setCities(data))
    .catch((err) => setError(err.message))
    .finally(() => setLoading(false));
  }, []);


  return (
    <div className="min-h-screen bg-grey-50 p-6">
      <h1 className="text-3xl font-bold text-grey-800 mb-6">
        Weather Comfort Dashboard
      </h1>

      {loading && <p className="text-grey-500">Loading cities...</p>}
      {error && <p className="text-red-600"></p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cities.map((city) => (
          <div
            key={city.cityCode}
            className="bg-white rounded-lg shadow p-4 border border-grey-200"
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-x1 font-semibold text-grey-800">
                {city.cityName}
              </h2>
              <span className="text-sm font-bold text-white bg-blue-600 rounded-full px-2 py-1">
                #{city.rank}
              </span>
          </div>
          <p className="text-grey-500 capitalize mb-2">{city.description}</p>
          <p className="text-2xl font-bold text-grey-800">{city.temp}Celsius</p>
          <p className="text-sm text-grey-500 mt-2">
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