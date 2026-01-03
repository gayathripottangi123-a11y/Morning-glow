import React, { useEffect, useState } from 'react';

export const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div className="flex flex-col items-center justify-center text-white drop-shadow-lg">
      <div className="text-8xl md:text-9xl font-light tracking-tighter transition-all duration-500 ease-in-out">
        {formatTime(time)}
      </div>
      <div className="text-xl md:text-2xl font-light tracking-widest opacity-90 mt-2 uppercase">
        {formatDate(time)}
      </div>
    </div>
  );
};