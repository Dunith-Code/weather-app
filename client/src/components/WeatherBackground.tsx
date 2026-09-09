// client/src/components/WeatherBackground.tsx

import React from 'react';
import { weatherConditions } from '../constants/weatherConditions';

interface Props {
  condition: string;
  children: React.ReactNode;
}

export default function WeatherBackground({ condition, children }: Props) {
  const config =
    weatherConditions[condition as keyof typeof weatherConditions] ||
    weatherConditions['clear sky'];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.7)' }}
      >
        <source src={config.video} type="video/mp4" />
      </video>

      {/* Overlay with glass effect */}
      <div className={`relative z-10 ${config.glass} backdrop-blur-md min-h-screen p-6`}>
        {children}
      </div>
    </div>
  );
}