import { useState, useEffect } from 'react';

/* eslint-disable react-refresh/only-export-components */
// Simple event emitter for logs
type LogLevel = 'info' | 'warn' | 'error';
interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    data?: unknown;
}

const listeners: ((entry: LogEntry) => void)[] = [];

const notifyListeners = (entry: LogEntry) => {
    listeners.forEach(l => l(entry));
};

export const debugLog = {
    info: (message: string, data?: unknown) => {
        const entry: LogEntry = { timestamp: new Date().toISOString().split('T')[1].slice(0, -1), level: 'info', message, data };
        console.log(`[DEBUG] ${message}`, data || '');
        notifyListeners(entry);
    },
    error: (message: string, data?: unknown) => {
        const entry: LogEntry = { timestamp: new Date().toISOString().split('T')[1].slice(0, -1), level: 'error', message, data };
        console.error(`[DEBUG] ${message}`, data || '');
        notifyListeners(entry);
    },
    subscribe: (callback: (entry: LogEntry) => void) => {
        listeners.push(callback);
        return () => {
            const index = listeners.indexOf(callback);
            if (index > -1) listeners.splice(index, 1);
        };
    }
};

export function LogOverlay() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        return debugLog.subscribe((entry) => {
            setLogs(prev => [...prev, entry]);
        });
    }, []);

    if (!isOpen) return <button onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded z-50">Show Logs</button>;

    return (
        <div className="fixed bottom-0 right-0 w-full md:w-1/2 h-1/2 bg-black/90 text-green-400 font-mono text-xs p-4 overflow-auto z-50 border-t border-green-500 shadow-xl">
            <div className="flex justify-between items-center mb-2 border-b border-green-800 pb-2">
                <h3 className="font-bold">Frontend Debug Logs</h3>
                <div className="space-x-2">
                    <button onClick={() => setLogs([])} className="text-gray-400 hover:text-white border border-gray-600 px-2 rounded">Clear</button>
                    <button onClick={() => setIsOpen(false)} className="text-red-400 hover:text-red-200 border border-red-900 px-2 rounded">Hide</button>
                </div>
            </div>
            <div className="flex flex-col gap-1">
                {logs.length === 0 && <span className="text-gray-600 italic">Waiting for logs...</span>}
                {logs.map((log, i) => (
                    <div key={i} className={`border-l-2 pl-2 ${log.level === 'error' ? 'border-red-500 text-red-300' : 'border-green-500'}`}>
                        <span className="text-gray-500">[{log.timestamp}]</span> <span className="font-bold">{log.message}</span>
                        {log.data !== undefined && (
                            <pre className="ml-4 mt-1 text-gray-400 overflow-x-auto">
                                {typeof log.data === 'object' ? JSON.stringify(log.data, null, 2) : String(log.data)}
                            </pre>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
