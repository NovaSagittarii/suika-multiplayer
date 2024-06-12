// import Ball from '@/suika/Ball';
// import RapierInstance from './lib/RapierInstance.ts';
import RAPIER from '@dimforge/rapier2d-compat';
RAPIER.init().then(() => console.log(RAPIER));

// console.log(RapierInstance.initialize())

// RapierInstance.initialize().then(() => {
//   const Rapier = RapierInstance.getRapier();
//   const world = new Rapier.World(new Rapier.Vector2(0, 9.81));

//   const ball = new Ball(world, 0, 0, 0);
//   console.log(ball.translation());

//   world.step();
//   console.log(ball.translation());
// });
