import EventQueue, { GameEvent } from './EventQueue';

export abstract class BufferedEvents {
  protected events: number = 0;
  protected readonly eventBuffer: EventQueue = new EventQueue();
  constructor() {}

  /**
   * pushes an event into the event buffer (id is set)
   * @param event
   */
  public pushEvent(event: GameEvent) {
    // TODO: can race conditions result in desync?
    event.id = this.events++;
    this.eventBuffer.push(event);
  }

  /**
   * pushes an event into the event buffer (when receiving); does not set id
   * @param event
   */
  public acceptEvent(event: GameEvent) {
    this.eventBuffer.push(event);
  }

  /**
   * Called as the buffered events handler.
   * Might drain all events, or some.
   */
  abstract drainEvents(): void;
}
