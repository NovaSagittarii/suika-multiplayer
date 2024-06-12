/**
 * Utility class for handling one-time disposals when cleaning up
 */
export default class DisposableEntity {
  /**
   * whether this object has been marked for disposal already
   * (should only be disposed once)
   */
  private disposed: boolean;

  constructor() {
    this.disposed = false;
  }

  /**
   * call to mark for disposal, returns true if already disposed
   * @returns whether it had been disposed already
   */
  dispose() {
    if (this.disposed) return true;
    this.disposed = true;
    return false;
  }
}
