// Imports
import { error } from 'console';
import { suika } from './proto';

// Something
export default class EventQueue {
  // State
  private currentEventNumber: number;
  private lastEventPoppedTick: number;

  // Cache
  private frontCache: suika.event.game.GameEvent | null;

  // Buffer
  private eventBuffer: Array<suika.event.game.GameEvent>;

  constructor() {
    this.currentEventNumber = 0;
    this.lastEventPoppedTick = 0;

    this.frontCache = null;

    this.eventBuffer = [];
  }

  /**
   * add event to queue
   * @param newEvent event to be pushed onto the buffer
   */
  push(newEvent: suika.event.game.GameEvent): void {
    this.eventBuffer.push(newEvent);
  }

  /**
   * pop front event from queue
   * @throws 'invalid pop operation' if no valid front element found
   */
  pop(): void {
    const eventToRemove = this.front();
    if (eventToRemove !== null) {
      const indexToRemove = this.eventBuffer.indexOf(eventToRemove);
      this.eventBuffer.splice(indexToRemove, 1);

      // Update State
      this.lastEventPoppedTick = eventToRemove.ticks;
      this.currentEventNumber += 1;
      this.frontCache = null;
    } else {
      throw 'invalid pop operation';
    }
  }

  /**
   * gets the front event from the buffer safely
   * @returns front event or nullf if none
   */
  front(): suika.event.game.GameEvent | null {
    if (this.frontCache !== null) {
      return this.frontCache;
    } else {
      const frontEvent =
        this.eventBuffer.find(
          (iterEvent) => iterEvent.id === this.currentEventNumber,
        ) || null;
      if (frontEvent) {
        this.frontCache = frontEvent;
      }

      return frontEvent;
    }
  }

  /**
   * get last event popped tick
   * @returns tick of last event popped
   */
  lastTick(): number {
    return this.lastEventPoppedTick;
  }

  /**
   * check if buffer is empty
   * @returns if buffer is empty
   */
  empty(): boolean {
    return this.eventBuffer.length === 0;
  }

  /**
   * if expected event is in queue
   * @returns true if expected front is in buffer
   */
  canPop(): boolean {
    return this.front() !== null;
  }
}
