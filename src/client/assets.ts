import f1 from '../assets/f1.png';
import f2 from '../assets/f2.png';
import f3 from '../assets/f3.png';
import f4 from '../assets/f4.png';
import f5 from '../assets/f5.png';
import f6 from '../assets/f6.png';
import f7 from '../assets/f7.png';
import f8 from '../assets/f8.png';
import f9 from '../assets/f9.png';
import f10 from '../assets/f10.png';
import f11 from '../assets/f11.png';

type FruitData = {
  /**
   * relative path from /src/client/* of location image
   */
  path: string;

  /**
   * center of sprite
   */
  anchor: [number, number];

  /**
   * radius of sprite to match hitbox
   */
  radius: number;
};
export const FRUIT_DATA: FruitData[] = [
  {
    path: f1,
    anchor: [0.5, 0.5],
    radius: 0.5,
  },
  {
    path: f2,
    anchor: [0.5, 0.5],
    radius: 0.6,
  },
  {
    path: f3,
    anchor: [0.5, 0.55],
    radius: 0.55,
  },
  {
    path: f4,
    anchor: [0.5, 0.5],
    radius: 0.5,
  },
  {
    path: f5,
    anchor: [0.5, 0.5],
    radius: 0.5,
  },
  {
    path: f6,
    anchor: [0.5, 0.53],
    radius: 0.52,
  },
  {
    path: f7,
    anchor: [0.5, 0.7],
    radius: 0.7,
  },
  {
    path: f8,
    anchor: [0.5, 0.5],
    radius: 0.52,
  },
  {
    path: f9,
    anchor: [0.5, 0.6],
    radius: 0.6,
  },
  {
    path: f10,
    anchor: [0.5, 0.5],
    radius: 0.51,
  },
  {
    path: f11,
    anchor: [0.5, 0.5],
    radius: 0.5,
  },
];
