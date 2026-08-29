interface Reading {
    timestamp: number;
    temp: number;
}

const MAX_READINGS_PER_CITY = 50;
const history: Record<string, Reading[]> = {};

export function recordReading(cityCode: string, temp: number): void {
    if (!history[cityCode]) {
        history[cityCode] = [];
    }
    history[cityCode].push({ timestamp: Date.now(), temp });

    // keep
    if (history[cityCode].length > MAX_READINGS_PER_CITY) {
        history[cityCode].shift();
    }
}

export function getHistoryForCity(cityCode: string): Reading[] {
    return history[cityCode] || [];
}

export function getAllHistory(): Record<string, Reading[]> {
    return history;
}