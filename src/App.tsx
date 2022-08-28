/* eslint-disable no-irregular-whitespace */
import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import styles from 'styles/app.module.scss';
import { useLocalStorage } from './utils/hooks';
import ProcessScreen from './ProcessScreen';
import FormScreen from './FormScreen';
import { ErrorFallback } from './components/error-fallback';

type FormValues = {
  privateKeyOrMnemonic: string;
  rewardCxoAddress: string;
  rpcAddress: string;
  relayUrl: string;
  gasPrice: string;
  gasLimit: string;
};

const App = () => {
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
        {!running ? (
          <FormScreen initialValues={savedValues} onStart={startProcessing} />
        ) : (
          <ProcessScreen {...savedValues} onStop={stopProcessing} />
        )}
      </ErrorBoundary>
    </div>
  );
};

export default App;
