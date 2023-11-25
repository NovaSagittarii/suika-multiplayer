const prefix = "src/assets/";
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
    path: prefix + "f1.png",
    anchor: [0.5, 0.5],
    radius: 0.5,
  },
  {
    path: prefix + "f2.png",
    anchor: [0.5, 0.5],
    radius: 0.6,
  },
  {
    path: prefix + "f3.png",
    anchor: [0.5, 0.55],
    radius: 0.55,
  },
  {
    path: prefix + "f4.png",
    anchor: [0.5, 0.5],
    radius: 0.5,
  },
  {
    path: prefix + "f5.png",
    anchor: [0.5, 0.5],
    radius: 0.5,
  },
  {
    path: prefix + "f6.png",
    anchor: [0.5, 0.53],
    radius: 0.52,
  },
  {
    path: prefix + "f7.png",
    anchor: [0.5, 0.7],
    radius: 0.7,
  },
  {
    path: prefix + "f8.png",
    anchor: [0.5, 0.5],
    radius: 0.52,
  },
  {
    path: prefix + "f9.png",
    anchor: [0.5, 0.6],
    radius: 0.6,
  },
  {
    path: prefix + "f10.png",
    anchor: [0.5, 0.5],
    radius: 0.51,
  },
  {
    path: prefix + "f11.png",
    anchor: [0.5, 0.5],
    radius: 0.5,
  },
];