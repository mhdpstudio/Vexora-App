import { createContext, useContext, useEffect, useState } from "react";

const WatchContext = createContext();

export function WatchProvider({ children }) {

    const [history, setHistory] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('watchHistory')) || [];
        } catch (e) { return []; }
    });

    useEffect(() => {
        try {
            localStorage.setItem('watchHistory', JSON.stringify(history));
        } catch (e) { }
    }, [history]);

    const recordProgress = ({ id, title, thumbnail, currentTime = 0, duration = 0 }) => {
        setHistory(prev => {
            const now = Date.now();
            const existing = prev.find(p => p.id === id);
            const entry = {
                id,
                title,
                thumbnail,
                lastPosition: Math.floor(currentTime),
                duration: Math.floor(duration || 0),
                lastWatchedAt: now,
                watchedCount: (existing?.watchedCount || 0) + 1
            };
            const others = prev.filter(p => p.id !== id);
            return [entry, ...others].slice(0, 200);
        });
    };

    const clearHistory = () => setHistory([]);

    return (
        <WatchContext.Provider value={{ history, recordProgress, clearHistory }}>
            {children}
        </WatchContext.Provider>
    );
}

export const useWatch = () => useContext(WatchContext);
