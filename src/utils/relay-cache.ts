class RelayCache {
  static alreadyProcessed: Record<string, boolean> = {};

  public static markAsProcessed(id: string) {
    this.alreadyProcessed[id] = true;
  }

  public static wasAlreadyProcessed(id: string): boolean {
    return this.alreadyProcessed[id];
  }
}

export default RelayCache;
