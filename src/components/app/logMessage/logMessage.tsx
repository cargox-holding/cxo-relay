import styles from './styles.module.scss';
import { LogEntry } from '../../../context/logs';

export function LogMessage({ timestamp, message, level }: LogEntry) {
  const datetime = new Date(timestamp).toLocaleTimeString();
  return (
    <div className={styles.logEntry}>
      <span>{datetime}</span>
      <strong className={level == 'error' ? styles.errorLog : undefined}>
        {message}
      </strong>
    </div>
  );
}
