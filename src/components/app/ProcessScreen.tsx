/* eslint-disable no-irregular-whitespace */
import { useEffect } from 'react';
import styles from 'styles/app.module.scss';
import button from 'styles/button.module.scss';
import clsx from 'clsx';
import { Balance } from './balance';
import {
  useBalance,
  useCxoBalance,
  useRelayConstants,
  useRpcProvider,
  useWallet,
  useRunner,
  useLogs,
} from '../../utils/hooks';
import { isValidMnemonicOrPrivateKey } from '../../utils/validations';
import { Loader } from './loader';
import { Logs } from './logs';

type Props = {
  privateKeyOrMnemonic: string;
  rewardCxoAddress: string;
  rpcAddress: string;
  relayUrl: string;
  gasPrice: string;
  gasPriceCap: string;
  doffa: boolean;
  onStop: () => void;
};

const ProcessScreen = ({
  privateKeyOrMnemonic,
  rewardCxoAddress,
  rpcAddress,
  relayUrl,
  gasPrice,
  gasPriceCap,
  doffa,
  onStop,
}: Props) => {
  // Clear logs on each session
  const { clearLogs } = useLogs();
  useEffect(() => {
    clearLogs();
  }, []);

  // These two hooks establish the provider and wallet objects that used throughout the component
  const provider = useRpcProvider({ rpcAddress });
  const wallet = useWallet({
    privateKeyOrMnemonic,
    type: isValidMnemonicOrPrivateKey(privateKeyOrMnemonic),
    provider,
  });
  const loading = !provider || !wallet;

  // This hook periodically checks for updated relay constants
  const { relayConstants } = useRelayConstants({
    relayUrl,
  });

  // This hook fetches the signatures data and handles running/cancelling the processing
  const { cancel: cancelRunner } = useRunner({
    relayUrl,
    rewardRecipient: rewardCxoAddress,
    wallet,
    provider,
    gasPrice,
    gasPriceCap,
    doffa,
  });

  // These two hooks periodically check the MATIC and CXO balances
  const { balance: maticBalance } = useBalance({
    wallet,
  });
  const { balance: cxoBalance } = useCxoBalance({
    relayConstants,
    provider,
    userAddress: rewardCxoAddress,
  });

  function stopProcessing() {
    onStop();
    cancelRunner();
  }

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className={styles.runContainer}>
          <div className={styles.twoColumns}>
            <Balance title="Matic balance" value={maticBalance} units="MATIC" />
            <Balance title="CXO balance" value={cxoBalance} units="CXO" />
          </div>
          <Logs />
          <button
            className={clsx(button.button, button.buttonRed)}
            onClick={stopProcessing}
          >
            Stop
          </button>
        </div>
      )}
    </>
  );
};

export default ProcessScreen;
