import { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { useAuth0 } from '@auth0/auth0-react';

interface ForecastPoint {
    timestamp: number;
    temp: number;
}

interface Props {
    cityCode: string;
    cityName: string;
}

export default function TemperatureChart({ cityCode, cityName }: Props) {
    const { getAccessTokenSilently } = useAuth0();
    const [points, setPoints] = useState<ForecastPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!cityCode) return;

        // reset loading/error on every city swwitch
        setLoading(true);
        setError(null);

        const fetchForecast = async () => {
            try {
                const token = await getAccessTokenSilently();
                const res = await fetch(`http://localhost:5000/api/forecast/${cityCode}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                const data: ForecastPoint[] = await res.json();
                
                setPoints(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchForecast();
    }, [cityCode, getAccessTokenSilently]);

    if (loading) return <p className="text-sm text-slate-500">Loading forecast...</p>;
    if (error) return <p className="text-sm text-rose-500">Error: {error}</p>;
    if (points.length === 0)
        return (
            <p className="text-sm text-slate-500 dark:text-slate-400">
                No forecast data available.
            </p>
        );


    // format data for Recharts
    const chartData = points.map((p) => ({
        time: new Date(p.timestamp).toLocaleString(undefined, {
            weekday: 'short',
            hour: 'numeric',
        }),
        temp: Math.round(p.temp * 10) / 10, // round to 1 decimal
    }));

    return (
        <div className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-700/60 p-4 shadow-sm animate-fade-in">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Temperature trend (5-Day forecast) - {cityName}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                3-hour intervals - OpenWeatherMap free-tier forecast
            </p>
            <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" interval={4} />
                    <YAxis
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 10 }}
                        stroke="#94a3b8"
                        label={{ value: '°C', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#f1f5f9',
                        }}
                        labelStyle={{ color: '#94a3b8' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="temp"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
            
        </div>
    );
}

