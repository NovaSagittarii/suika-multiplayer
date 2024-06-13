import { BOARD_HEIGHT, BOARD_WIDTH, FRUIT_DIAMETER } from '@/constants';
import { constrain, encodeRange } from '@/lib/util';
import Ball from '@/suika/Ball';
import P5 from 'p5';

const sketch = (p5: P5) => {
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
    const n = data.length;
    balls = new Array(n / 4)
      .fill(0)
      .map((_, i) => data.substring(i * 4, i * 4 + 4))
      .map((s) => Ball.deserialize(s, BOARD_WIDTH, BOARD_HEIGHT));
    // balls = parsed;
  };

  p5.setup = () => {
    const canvas = p5.createCanvas(400, 400);
    canvas.parent('root');
    p5.noStroke();
    p5.noSmooth();
    p5.rectMode(p5.CENTER);
    p5.textAlign(p5.CENTER, p5.CENTER);
  };
  let mp = false;
  p5.mousePressed = () => (mp = true);
  p5.draw = () => {
    const { mouseX, mouseY } = p5;

    p5.background(255);

    p5.fill(0, 255, 0, 50);
    p5.rect(200, 90, 10 * BOARD_WIDTH, 15);
    const mlo = 200 - 5 * BOARD_WIDTH;
    const mhi = 200 + 5 * BOARD_WIDTH;
    const mx = constrain(mouseX, mlo, mhi);
    p5.ellipse(mx, 90, 5, 5);
    if (mp) {
      ws.send(encodeRange(mx, mlo, mhi, 8).toString(36));
    }

    p5.push();
    p5.translate(200, 100);
    p5.scale(10);

    p5.fill(0, 10);
    p5.rect(0, BOARD_HEIGHT / 2, BOARD_WIDTH, BOARD_HEIGHT);

    p5.textSize(1.2);
    for (const [x, y, t] of balls) {
      p5.fill(255, 0, 0, 100);
      p5.ellipse(x, -y, FRUIT_DIAMETER[t], FRUIT_DIAMETER[t]);
      p5.fill(0);
      p5.text(t, x, -y);
    }
    p5.pop();

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
