import styles from './styles.module.scss';
import { LogMessage } from '../logMessage';
import { useEffect, useRef } from 'react';
import { useLogs } from '../../../utils/hooks';

export function Logs() {
  const { logs } = useLogs();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Automatically scroll down when new logs are added
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);
  return (
    <>
      <h1>Logs</h1>
      <code className={styles.logs}>
        {logs.map((log) => (
          <LogMessage key={log.id} {...log} />
        ))}
        <div ref={bottomRef} />
      </code>
    </>
  );
}
