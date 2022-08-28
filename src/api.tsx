import { ethers } from 'ethers';
import { formatEther } from 'ethers/lib/utils';

export function getSignatures(url: string, rewardRecipient = '') {
  const params = new URLSearchParams({
    rewardRecipient,
  });
  return fetch(`${url}?${params}`).then((res) => res.json());
}

export type RelayConstantsDto = { cxo_address: string; relay_address: string };
export function getRelayConstants(url: string): Promise<RelayConstantsDto> {
  return fetch(url).then((res) => res.json());
}

export function getBalance(wallet: ethers.Wallet) {
  return wallet.getBalance().then((balance) => {
    return formatEther(balance);
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
    return formatEther(balance);
  });
}
