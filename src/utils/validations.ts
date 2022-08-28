import { ethers } from 'ethers';
import { isValidMnemonic } from 'ethers/lib/utils';

export function isValidMnemonicOrPrivateKey(
  value: string
): 'mnemonic' | 'privateKey' | 'invalid' {
  // First check if it's a mnemonic
  if (isValidMnemonic(value)) {
    // Mark valid too short mnemonics as invalid
    const nWords = value.split(' ').length;
    if (nWords < 12) {
      return 'invalid';
    }
    return 'mnemonic';
  }
  // Check for private key
  if (ethers.utils.isHexString(value)) {
    return 'privateKey';
  } else if (value.length === 64 && ethers.utils.isHexString(`0x${value}`)) {
    return 'privateKey';
  }
  return 'invalid';
}

export function isURL(value: string) {
  try {
    new URL(value);
    return true;
  } catch (_) {
    return false;
  }
}
