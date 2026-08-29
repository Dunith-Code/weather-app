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

interface Reading {
    timestamp: number;
    temp: number;
}

interface Props {
    cityCode: string;
    cityName: string;
}

export default function TemperatureChart({ cityCode, cityName }: Props) {
    const { getAccessTokenSilently } = useAuth0();
    const [readings, setReadings] = useState<Reading[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!cityCode) return;

        const fetchHistory = async () => {
            // reset states on every fetch
            setLoading(true);
            setError(null);
            
            try {
                const token = await getAccessTokenSilently();
                const res = await fetch(`http://localhost:5000/api/history`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                const data: Record<string, Reading[]> = await res.json();
                const cityReadings = data[cityCode] || [];
                setReadings(cityReadings);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [cityCode, getAccessTokenSilently]);

    if (loading) return <p className="text-sm text-slate-500">Loading history...</p>;
    if (error) return <p className="text-sm text-rose-500">Error: {error}</p>;
    if (readings.length === 0)
        return (
            <p className="text-sm text-slate-500">
                No historical data yet. Check back after a few minutes (new data is captured every 5 minutes).
            </p>
        );


    // format data for Recharts
    const chartData = readings.map((r) => ({
        time: new Date(r.timestamp).toLocaleTimeString(),
        temp: r.temp,
    }));

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Temperature trend - {cityName}
            </h3>
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
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
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-400 mt-2">
                {readings.length} data points - new readings added every 5 minutes on fresh API calls.
            </p>
        </div>
    );
}

