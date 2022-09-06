import NodeCache from 'node-cache';

const CACHE_EXPIRATION_SECONDS = 24 * 60 * 60;

class RelayCache {
  static relayerCache = new NodeCache({
    stdTTL: CACHE_EXPIRATION_SECONDS,
    deleteOnExpire: true,
    checkperiod: 60 * 60,
  });

  public static markAsProcessed(id: string) {
    this.relayerCache.set(id, true, CACHE_EXPIRATION_SECONDS);
  }

  public static wasAlreadyProcessed(id: string): boolean {
    return Boolean(this.relayerCache.get(id));
  }
}

export default RelayCache;
