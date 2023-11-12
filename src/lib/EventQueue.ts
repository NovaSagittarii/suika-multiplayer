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

  push(newEvent: suika.event.game.GameEvent): void {
    this.eventBuffer.push(newEvent);
  }

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

  lastTick(): number {
    return this.lastEventPoppedTick;
  }

  empty(): boolean {
    return this.eventBuffer.length === 0;
  }

  canPop(): boolean {
    return this.front() !== null;
  }
}
