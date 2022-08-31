// Used for truncating the decimals of ethereum-like balances
// Keep in mind that parseFloat will result in loss of precision,
// however we choose to ignore this
export function toFixed(value: string, nDecimals = 3) {
  return parseFloat(value).toFixed(nDecimals).toString();
}
