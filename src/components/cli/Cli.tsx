import { Box, Text } from 'ink';
import {
  useBalance,
  useCxoBalance,
  useRelayConstants,
  useRpcProvider,
  useRunner,
  useWallet,
} from '../../utils/hooks';
import { isValidMnemonicOrPrivateKey } from '../../utils/validations';
import { Balance } from './balance';
import { Logs } from './logs';
import { Version } from './version';

type Props = {
  privateKeyOrMnemonic: string;
  relayUrl: string;
  rpcAddress: string;
  rewardCxoAddress: string;
  gasPrice: string;
  gasPriceCap: string;
  doffa: boolean;
};

const App = ({
  privateKeyOrMnemonic,
  relayUrl,
  rpcAddress,
  rewardCxoAddress,
  gasPrice = '',
  gasPriceCap = '',
  doffa = false,
}: Props) => {
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
  useRunner({
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

  if (loading) {
    return <Text>Loading...</Text>;
  }
  return (
    <Box flexDirection="column" marginLeft={2}>
      <Version />
      <Box
        borderStyle="single"
        flexDirection="column"
        width={80}
        paddingLeft={2}
        paddingTop={1}
        paddingBottom={1}
        paddingRight={2}
      >
        <Balance title="Matic balance" value={maticBalance} units="MATIC" />
        <Balance title="CXO balance" value={cxoBalance} units="CXO" />
      </Box>
      <Logs />
    </Box>
  );
};

export default App;
