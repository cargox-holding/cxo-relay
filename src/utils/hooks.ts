import * as React from 'react';
import useSWR from 'swr';
import { ethers } from 'ethers';
import { compare } from 'compare-versions';
import {
  getBalance,
  getCXOBalance,
  getLatestRelease,
  getRelayConstants,
  getSignatures,
  LatestReleaseDto,
  RelayConstantsDto,
} from '../api';
import { LogsContext } from '../context/logs';
import { getGasPrice } from '../api';
import { processSignatures } from './process-signatures';
import { version as currentVersion } from '../../package.json';
import { parseUnits } from 'ethers/lib/utils';

const RELAY_REFRESH_INTERVAL_MS = 20 * 1000;
const BALANCE_REFRESH_INTERVAL_MS = 55 * 1000;
const LATEST_VERSION_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };
  return [storedValue, setValue] as const;
}

export type RelayConfig = {
  relayUrl: string;
};
export function useRelayConstants(relayConfig: RelayConfig) {
  const { relayUrl } = relayConfig;
  let constantsUrl = '/constants/';
  if (relayUrl.endsWith('/')) {
    constantsUrl = 'constants/';
  }
  const { data: relayConstants, error: relayConstantsError } = useSWR<
    RelayConstantsDto,
    string
  >(`${relayUrl}${constantsUrl}`, getRelayConstants, {
    revalidateOnFocus: false,
  });
  return { relayConstants, relayConstantsError };
}

export function useLogs() {
  const context = React.useContext(LogsContext);
  if (!context) {
    throw new Error('useLogs must be used within the LogsProvider');
  }
  return context;
}

export function useRpcProvider({ rpcAddress }: { rpcAddress: string }) {
  const [provider, setProvider] =
    React.useState<ethers.providers.Provider | null>(null);
  React.useEffect(() => {
    if (!rpcAddress) {
      return;
    }
    const provider = new ethers.providers.JsonRpcProvider(rpcAddress);
    setProvider(provider);
  }, [rpcAddress]);
  return provider;
}

export function useWallet({
  privateKeyOrMnemonic,
  type,
  provider,
}: {
  privateKeyOrMnemonic: string;
  type: PrivateKeyOrMnemonicType;
  provider: ethers.providers.Provider | null;
}) {
  const [wallet, setWallet] = React.useState<ethers.Wallet | null>(null);
  React.useEffect(() => {
    if (!provider || type === 'invalid') {
      return;
    }
    const newWallet =
      type === 'mnemonic'
        ? ethers.Wallet.fromMnemonic(privateKeyOrMnemonic).connect(provider)
        : new ethers.Wallet(privateKeyOrMnemonic, provider);

    setWallet(newWallet);
  }, [privateKeyOrMnemonic, type, provider]);
  return wallet;
}

export type PrivateKeyOrMnemonicType = 'privateKey' | 'mnemonic' | 'invalid';

export type CxoConfig = {
  wallet: ethers.Wallet | null;
  provider: ethers.providers.Provider | null;
  gasPrice: string;
  gasLimit: string;
};

export type SignatureDto = {
  id: string;
  created: string;
  from: string;
  recipient: string;
  encoded_function: string;
  nonce: number;
  signature: string;
  reward: string;
  reward_recipient: string;
  reward_signature: string;
  times_shown: number;
  relay_address: string;
};

type RunnerInput = {
  relayUrl: string;
  rewardRecipient?: string;
  wallet: ethers.Wallet | null;
  provider: ethers.providers.Provider | null;
  gasPrice: string;
  gasPriceCap: string;
  doffa: boolean;
};

export function useRunner({
  relayUrl,
  rewardRecipient,
  wallet,
  provider,
  gasPrice,
  gasPriceCap,
  doffa,
}: RunnerInput) {
  const { writeLog } = useLogs();

  // We track via this ref if we are processing at the moment
  const inProgress = React.useRef<boolean>(false);

  // Flag to "notify" the processSignatures function to stop processing
  const shouldCancel = React.useRef(false);

  let gasPriceGwei = parseUnits('50', 'gwei');
  let gasPriceCapGwei = parseUnits('0', 'gwei');

  function cancel() {
    shouldCancel.current = true;
  }

  React.useEffect(() => {
    // Still waiting for wallet & provider to be ready
    if (!wallet || !provider) {
      return;
    }

    async function fetchAndProcess() {
      if (gasPriceCap === '') {
        gasPriceCap = '0';
      }

      gasPriceCapGwei = parseUnits(gasPriceCap, 'gwei');

      if (gasPrice) {
        gasPriceGwei = parseUnits(gasPrice, 'gwei');
      } else {
        writeLog.info('Fetching gas price information...');

        let gasUrl = '/gas/';
        if (relayUrl.endsWith('/')) {
          gasUrl = 'gas/';
        }
        try {
          const gasPriceAPI = await getGasPrice(`${relayUrl}${gasUrl}`);

          gasPriceGwei = parseUnits(gasPriceAPI.result.SafeGasPrice, 'gwei');
        } catch {
          writeLog.info('Failed to fetch gas price information!');

          // if we fail to fetch gas price, force pause
          gasPriceGwei = parseUnits('0', 'gwei');
          gasPriceCapGwei = parseUnits('1', 'gwei');
        }
      }

      let signatures: SignatureDto[] = [];

      try {
        signatures = await getSignatures(relayUrl, rewardRecipient);
      } catch (e) {
        writeLog.error(
          'Problem fetching signatures, please check your relay URL configuration: ' +
            e
        );
        signatures = [];
      }

      if (inProgress.current) {
        return;
      }

      if (
        gasPriceCap !== '' &&
        gasPriceCap !== '0' &&
        gasPriceGwei.gte(gasPriceCapGwei)
      ) {
        writeLog.info(
          'Gas price is higher than gas price cap. Relaying is paused. '
        );

        return;
      }

      if (signatures.length > 0) {
        writeLog.info('Fetched ' + signatures.length + ' signature(s)...');
        // New signatures available, so we process them with the runner
        inProgress.current = true;
        await processSignatures({
          signatures,
          wallet,
          provider,
          writeLog,
          shouldCancel,
          gasPriceGwei,
          doffa,
        });
        inProgress.current = false;
      }
    }

    // Setup interval and run immediately
    const fetchTimer = setInterval(fetchAndProcess, RELAY_REFRESH_INTERVAL_MS);
    fetchAndProcess();

    return () => {
      clearInterval(fetchTimer);
    };
  }, [wallet, provider]);

  React.useEffect(() => {
    // On unmount we must cancel the processing explicitly,
    // since the processSignature function would continue normally until fully processed
    return function cleanup() {
      if (inProgress.current) {
        cancel();
      }
    };
  }, []);

  return { cancel };
}

export type BalanceParams = {
  wallet: ethers.Wallet | null;
};

export function useBalance({ wallet }: BalanceParams) {
  const { data, error } = useSWR<string, string>(
    wallet ? [wallet] : null,
    getBalance,
    {
      refreshInterval: BALANCE_REFRESH_INTERVAL_MS,
    }
  );
  return { balance: data, error };
}

type CxoBalanceConfig = {
  provider: ethers.providers.Provider | null;
  relayConstants: RelayConstantsDto | undefined;
  userAddress: string;
};

export function useCxoBalance({
  provider,
  relayConstants,
  userAddress,
}: CxoBalanceConfig) {
  const hasNeededInput = provider && relayConstants?.cxo_address && userAddress;
  const { data, error } = useSWR<string, string>(
    hasNeededInput ? [provider, relayConstants.cxo_address, userAddress] : null,
    getCXOBalance,
    {
      refreshInterval: BALANCE_REFRESH_INTERVAL_MS,
    }
  );
  return { balance: data, error };
}

const RELEASES_API_URL =
  'https://api.github.com/repos/cargox-holding/cxo-relay/releases/latest';

export function useLatestVersion() {
  const { data } = useSWR(RELEASES_API_URL, getLatestRelease, {
    refreshInterval: LATEST_VERSION_REFRESH_INTERVAL_MS,
  });
  let newerAvailable = false;
  const latestVersion = data ? (data as LatestReleaseDto).name : undefined;
  if (latestVersion) {
    newerAvailable = compare(latestVersion, currentVersion, '>');
  }
  return { newerAvailable, currentVersion, latestVersion };
}
