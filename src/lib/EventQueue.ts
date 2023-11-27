// Imports
import { suika } from '@/proto';

export type GameEvent = suika.Event;

// Something
export default class EventQueue {
  // State
  private currentEventNumber: number;
  private lastEventPoppedTick: number;

  // Cache
  private frontCache: suika.Event | null;

  // Buffer
  private eventBuffer: Array<suika.Event>;

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
  push(newEvent: suika.Event): void {
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
  front(): suika.Event | null {
    if (this.frontCache !== null) {
      return this.frontCache;
    } else {
      if (this.eventBuffer.length === 0) {
        return null;
      }
      const reqEvent = this.eventBuffer.find(
        (iterEvent) => iterEvent.eventType === 'request',
      ) || null;
      if (reqEvent) {
        console.log('request event found');
      }
      const frontEvent =
        this.eventBuffer.find(
          (iterEvent) => iterEvent.id === this.currentEventNumber,
        ) || null;
      if (frontEvent) {
        this.frontCache = frontEvent;
      } else {
        const futureEvent = this.eventBuffer.find(
          (iterEvent) => iterEvent.id > this.currentEventNumber,
        ) || null;
        // ask server for past events if there are events > currentEventNumber
        if (futureEvent) {
          const reqEvent = suika.Event.create();
          return reqEvent;
        }

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
