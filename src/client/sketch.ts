import { BOARD_HEIGHT, BOARD_WIDTH, FRUIT_DIAMETER } from '@/constants';
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
  p5.draw = () => {
    const { mouseX, mouseY } = p5;

    p5.background(255);

    p5.push();
    p5.translate(200, 100);
    p5.scale(10);

    p5.fill(240);
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
    p5.text(`rx ${transmit.sz} ${(Date.now() - transmit.last).toString().padStart(2, '0')} ms ago`, 200, 50);
  };
};

new P5(sketch);
