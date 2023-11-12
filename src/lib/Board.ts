import Ball from './Ball';

import * as RAPIER from '@dimforge/rapier2d/rapier';
import DynamicEntity, { ColliderHandlerMap } from './DynamicEntity';
import Wall from './Wall';
const Rapier = await import('@dimforge/rapier2d');

export default class Board {
  private world: RAPIER.World;
  private balls: Ball[] = [];
  private walls: Wall[] = [];
  private handlers: ColliderHandlerMap = new Map();

  private score: number = 0;
  private ballsPlaced: number = 0;
  private seed: number = -1;
  
  private ticks: number = 0;
  private events: number = 0;

  constructor() {
    this.world = new Rapier.World(new Rapier.Vector2(0, -9.81));
  }

  /**
   * initialize the board with a set configuration
   * @param seed seed to initialize board with
   * @param width width of the board in meters
   * @param height height of the board in meters
   */
  initialize(seed: number, width: number, height: number) {
    this.seed = seed|0;
    this.walls.push(new Wall(this.world, -width/2-1, 0, 1, height*2));
    this.walls.push(new Wall(this.world,  width/2+1, 0, 1, height*2));
    this.walls.push(new Wall(this.world, 0, height+1, width, 1));
  }

  /**
   * places the next ball; which ball is determined by the randomizer state
   * @param x where along the x-axis to place the next ball
   */
  place(x: number) {
    this.placeBall(x, 0);
    ++this.ballsPlaced;
  }

  /**
   * places the next ball
   * @param x where along the x-axis to place the next ball
   * @param ball what ball id to use
   */
  placeBall(x: number, ball: 0|1|2|3|4|5|6|7|8|9|10) {
    const radius = 0.05;
    this.balls.push(new Ball(this.world, x, -radius, radius));
  }
}