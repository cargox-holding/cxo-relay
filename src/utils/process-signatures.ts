import { ethers, Transaction } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { LogsContextInterface } from '../context/logs';
import { SignatureDto } from './hooks';
import RelayCache from './relay-cache';

type ProcessInput = {
  signatures: SignatureDto[];
  wallet: ethers.Wallet | null;
  provider: ethers.providers.Provider | null;
  writeLog: LogsContextInterface['writeLog'];
  shouldCancel: React.MutableRefObject<boolean>;
  gasPrice?: string;
  gasLimit?: string;
};

type EthersError = {
  code: ethers.errors;
};

export async function processSignatures({
  signatures,
  wallet,
  provider,
  writeLog,
  shouldCancel,
  gasPrice,
  gasLimit,
}: ProcessInput) {
  if (!signatures) {
    writeLog.info('No signatures, canceling.');
    return;
  }
  if (!wallet) {
    writeLog.info('No wallet, canceling.');
    return;
  }
  if (!provider) {
    writeLog.info('No provider, canceling.');
    return;
  }

  let callOptions = {};
  if (gasPrice && gasLimit) {
    callOptions = {
      gasPrice: parseUnits(gasPrice, 'gwei'),
      gasLimit: parseUnits(gasLimit, 'gwei'),
    };
  }

  // We sort the signatures by times_shown (ascending)
  // to increase the chance of relay success
  signatures.sort(signatureOrder);

  for (const signature of signatures) {
    if (shouldCancel.current) {
      writeLog.info('Cancel requested');
      return;
    }

    if (RelayCache.wasAlreadyProcessed(signature.id)) {
      writeLog.info('Skipping (already processed) ' + signature.id);
      continue;
    }

    writeLog.info('Processing signature ' + signature.id);
    const cxoRelay = new ethers.Contract(
      signature.relay_address,
      CXORelayABI,
      provider
    );
    const cxoRelayWithSigner = cxoRelay.connect(wallet);
    writeLog.info('Sending transaction...');
    try {
      const tx = await cxoRelayWithSigner.relayCall(
        signature.from,
        signature.recipient,
        signature.encoded_function,
        signature.nonce,
        signature.signature,
        signature.reward,
        signature.reward_recipient,
        signature.reward_signature,
        callOptions
      );
      writeLog.info('Transaction hash: ' + (tx as Transaction).hash);
    } catch (e) {
      const error = e as EthersError;
      if (error.code == 'NETWORK_ERROR') {
        writeLog.error(
          'Problem connecting to the Polygon node, check your configuration or try again later'
        );
        break;
      }
      writeLog.error('Cannot relay: ' + e);
    } finally {
      RelayCache.markAsProcessed(signature.id);
    }
  }
  writeLog.info('Done!');
}

const CXORelayABI = [
  'function relayCall(address from, address recipient, bytes memory encodedFunction, uint256 nonce, bytes memory signature, uint256 reward, address rewardRecipient, bytes memory rewardSignature)',
  'event TransactionRelayed(address indexed from, uint256 indexed nonce, bytes32 indexed encodedFunctionHash)',
];

function signatureOrder(sig1: SignatureDto, sig2: SignatureDto) {
  if (sig1.times_shown < sig2.times_shown) {
    return -1;
  }
  if (sig1.times_shown > sig2.times_shown) {
    return 1;
  }
  return 0;
}
