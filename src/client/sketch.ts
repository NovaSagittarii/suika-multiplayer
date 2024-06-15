import { BOARD_WIDTH } from '@/constants';
import { constrain, encodeRange } from '@/lib/util';
import P5 from 'p5';
import drawBoard from './Board';
import SuikaBoard from '@/suika/SuikaBoard';

const sketch = (p5: P5) => {
  /**
   * Player id, unset initially until after connecting.
   */
  let pid = -1;
  let boards: ReturnType<typeof SuikaBoard.deserialize>[] = [];
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
    if (data[0] === '!') {
      pid = +data.substring(1);
      console.log('set pid', pid);
    } else {
      const d = JSON.parse(data) as string[];
      boards = d.map((x) => SuikaBoard.deserialize(x));
    }
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
    const emx = encodeRange(mx, mlo, mhi, 8).toString(36);

    if (ws.readyState === ws.OPEN) {
      if (mp) {
        ws.send('!' + emx);
      } else {
        ws.send('?' + emx);
      }
    }

    const nx = p5.map(mx, mlo, mhi, -BOARD_WIDTH / 2, BOARD_WIDTH / 2);

    p5.push();
    p5.translate(200, 100);
    p5.scale(10);
    if (pid !== -1 && boards[pid]) {
      drawBoard(p5, boards[pid], true);
    }
    p5.pop();

    const otherBoards = boards.length - (boards[pid] ? 1 : 0);
    let bi = 0;
    for (let b = 0; b < boards.length; ++b) {
      if (b === pid) continue;
      p5.push();

      // how to do positioning
      if (otherBoards === 1) {
        // [1, 1]
        p5.translate(600, 100);
        p5.scale(10);
      } else if (otherBoards <= 6) {
        // [2, 6]
        const ix = bi % 3;
        const iy = Math.floor(bi / 3);
        p5.translate(400, 100);
        p5.translate((ix / 3) * 400, (iy / 2) * 300);
        p5.scale(5);
      } else if (otherBoards <= 32) {
        // [7, 32]
        const ix = bi % 8;
        const iy = Math.floor(bi / 8);
        p5.translate(400, 100);
        p5.translate((ix / 8) * 400, (iy / 5) * 300);
        p5.scale(2);
      } else {
        // 33+ just shows the first 32
        const ix = bi % 8;
        const iy = Math.floor(bi / 8);
        p5.translate(400, 100);
        p5.translate((ix / 8) * 400, (iy / 5) * 300);
        p5.scale(2);
        if (bi >= 32) {
          p5.pop();
          break;
        }
      }

      // draw the other boards
      drawBoard(p5, boards[b]);
      p5.pop();
      ++bi;
    }

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
