import fetch from './utils/fetch';
import { ethers } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import { toFixed } from './utils/math';
import { SignatureDto } from './utils/hooks';

export function getSignatures(url: string, rewardRecipient = '') {
  const params = new URLSearchParams({
    rewardRecipient,
  });
  return fetch(`${url}?${params}`).then((res) => res.json()) as Promise<
    SignatureDto[]
  >;
}

export type RelayConstantsDto = { cxo_address: string; relay_address: string };
export function getRelayConstants(url: string): Promise<RelayConstantsDto> {
  return fetch(url).then((res) => res.json()) as Promise<RelayConstantsDto>;
}

export function getBalance(wallet: ethers.Wallet) {
  return wallet.getBalance().then((balance) => {
    return toFixed(formatEther(balance), 5);
  });
}

const CXOABI = [
  'function balanceOf(address who) public view returns (uint256)',
];
export function getCXOBalance(
  provider: ethers.providers.Provider,
  cxoAddress: string,
  userAddress: string
) {
  const contract = new ethers.Contract(cxoAddress, CXOABI, provider);
  return contract.balanceOf(userAddress).then((balance: string) => {
    return toFixed(formatEther(balance), 3);
  });
}

export type GasPriceDto = {
  result: {
    SafeGasPrice: string;
  };
};
export function getGasPrice(url: string) {
  return fetch(url).then((res) => res.json()) as Promise<GasPriceDto>;
}

export type LatestReleaseDto = {
  tag_name: string;
  target_commitish: string;
  name: string;
  // And many others, which are not relevant in this case
};
export function getLatestRelease(url: string) {
  return fetch(url).then((res) => res.json()) as Promise<LatestReleaseDto>;
}
