import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  FRUIT_DIAMETER,
  FRUIT_RADIUS,
} from '@/constants';
import { constrain, encodeRange } from '@/lib/util';
import Ball from '@/suika/Ball';
import P5 from 'p5';
import drawBoard from './Board';
import SuikaBoard from '@/suika/SuikaBoard';

const sketch = (p5: P5) => {
  let nextBall = 0;
  let balls = [] as [number, number, number][];
  let transmit = {
    last: 0,
    sz: 0,
  };

  const ws = new WebSocket('ws://localhost:8080');
  ws.onopen = () => console.log('connected');
  ws.onclose = () => console.log('disconnected');
  ws.onmessage = ({ data }) => {
    // console.log('rx', data.length);
    transmit.last = Date.now();
    transmit.sz = data.length;
    const [dnx, dnext, dballs] = SuikaBoard.deserialize(data);
    nextBall = dnext;
    balls = dballs;
  };

  p5.setup = () => {
    const canvas = p5.createCanvas(800, 400);
    canvas.parent('root');
    p5.noStroke();
    p5.noSmooth();
    p5.rectMode(p5.CENTER);
    p5.textAlign(p5.CENTER, p5.CENTER);
  };

  /**
   * whether mouse pressed since last frame
   */
  let mp = false;
  p5.mousePressed = () => (mp = true);

  p5.draw = () => {
    const { mouseX, mouseY } = p5;

    p5.background(250);

    const mlo = 200 - 5 * BOARD_WIDTH;
    const mhi = 200 + 5 * BOARD_WIDTH;
    const mx = constrain(mouseX, mlo, mhi);
    const nx = p5.map(mx, mlo, mhi, -BOARD_WIDTH / 2, BOARD_WIDTH / 2);

    if (mp) {
      ws.send(encodeRange(mx, mlo, mhi, 8).toString(36));
    }

    p5.push();
    p5.translate(200, 100);
    p5.scale(10);
    drawBoard(p5, { balls, nextBall, nx });
    p5.pop();

    // 1
    // p5.push();
    // p5.translate(600, 100);
    // p5.scale(10);
    // drawBoard(p5, {balls, nextBall, nx});
    // p5.pop();

    // 2-6
    // p5.push();
    // p5.translate(400, 100);
    // for (var i = 0; i < 6; ++i) {
    //   const ix = i % 3;
    //   const iy = Math.floor(i / 3);
    //   p5.push();
    //   p5.translate(ix/3*400, iy/2*300);
    //   p5.scale(5);
    //   drawBoard(p5, {balls, nextBall, nx});
    //   p5.pop();
    // }
    // p5.pop();

    p5.textSize(12);
    p5.fill(0);
    const debugString =
      `rx ${transmit.sz} ` +
      `${(Date.now() - transmit.last).toString().padStart(2, '0')} ms ago`;
    p5.text(debugString, 200, 50);
    mp = false;
  };
};

new P5(sketch);
