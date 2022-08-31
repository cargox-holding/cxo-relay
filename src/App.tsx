/* eslint-disable no-irregular-whitespace */
import { useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import styles from 'styles/app.module.scss';
import { useLocalStorage } from './utils/hooks';
import ProcessScreen from './ProcessScreen';
import FormScreen, { FormValues } from './FormScreen';
import { ErrorFallback } from './components/error-fallback';

const App = () => {
  const autostartChecked = useRef<boolean>(false);
  const [running, setRunning] = useState(false);

  // We store the user's submitted form values
  const [savedValues, setSavedValues] = useLocalStorage<FormValues>(
    'savedFormValues',
    {
      privateKeyOrMnemonic: '',
      rewardCxoAddress: '',
      rpcAddress: '',
      relayUrl: '',
      gasPrice: '',
      gasLimit: '',
      autostart: false,
    }
  );

  const startProcessing = (formValues: FormValues) => {
    setSavedValues(formValues);
    setRunning(true);
  };

  const stopProcessing = () => {
    setRunning(false);
  };

  return (
    <div className={styles.app}>
      <img className={styles.logo} src="CXO-Relay-logo.svg" />
      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={stopProcessing}>
        <section className={styles.section}>
          {!running ? (
            <FormScreen
              initialValues={savedValues}
              onStart={startProcessing}
              autostartChecked={autostartChecked}
            />
          ) : (
            <ProcessScreen {...savedValues} onStop={stopProcessing} />
          )}
        </section>
      </ErrorBoundary>
    </div>
  );
};

export default App;
