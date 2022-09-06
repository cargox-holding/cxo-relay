import * as React from 'react';

const LogsContext = React.createContext<LogsContextInterface | null>(null);
LogsContext.displayName = 'LogsContext';

export type LogsContextInterface = {
  logs: LogEntry[];
  writeLog: {
    info: (message: string) => void;
    error: (message: string) => void;
  };
  clearLogs: () => void;
};

export type LogEntry = {
  id: number;
  timestamp: number;
  message: string;
  level?: LogLevel;
};

type LogLevel = 'info' | 'error';

function forwardToDevConsole(message: string, level: LogLevel) {
  if (level === 'info') {
    console.log(message);
  } else if (level === 'error') {
    console.error(message);
  }
}

let logId = 0;
function LogsProvider({
  children,
  forwardToConsole = true,
  tailSize,
}: {
  children: React.ReactNode;
  forwardToConsole?: boolean;
  tailSize?: number;
}) {
  const [logs, setLogs] = React.useState<LogEntry[]>([]);

  function _appendLog(message: string, level: LogLevel) {
    if (forwardToConsole) {
      forwardToDevConsole(message, level);
    }
    setLogs((logs) => [
      ...logs.slice(tailSize ? -tailSize : undefined),
      { id: logId++, timestamp: Date.now(), message, level },
    ]);
  }

  function clearLogs() {
    setLogs([]);
  }

  const writeLog = {
    info: (message: string) => _appendLog(message, 'info'),
    error: (message: string) => _appendLog(message, 'error'),
  };
  return (
    <LogsContext.Provider value={{ logs, writeLog, clearLogs }}>
      {children}
    </LogsContext.Provider>
  );
}

export { LogsContext, LogsProvider };
