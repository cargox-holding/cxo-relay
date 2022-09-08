import styles from './styles.module.scss';
import button from 'styles/button.module.scss';

type Props = {
  error: { message: string };
  resetErrorBoundary: () => void;
};

export function ErrorFallback({ error, resetErrorBoundary }: Props) {
  return (
    <div role="alert" className={styles.errorFallback}>
      <img className={styles.graphic} src="error.svg" />
      <h1>Something went wrong :(</h1>
      <div className={styles.message}>{error.message}</div>
      <button className={button.button} onClick={resetErrorBoundary}>
        Try again
      </button>
    </div>
  );
}
