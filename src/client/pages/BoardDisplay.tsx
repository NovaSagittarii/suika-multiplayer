import { useContext, useEffect, useRef, useState } from 'react';
import { SioContext, SioDispatchContext } from '../SioProvider';

import { Stage } from '@pixi/react';
import PIXIBoard from '../PIXIBoard';

export default function BoardDisplay() {
  const sio = useContext(SioContext);
  const dispatch = useContext(SioDispatchContext);

  const requestRef = useRef<number>(0);
  const [ticks, setTicks] = useState<number>(0);
  const [mousePosition, setMousePosition] = useState([0, 0]);

  // TODO: use time argument of animate callback for how many ticks?
  const animate = (_time: number) => {
    requestRef.current = requestAnimationFrame(animate);

    if (!(sio && sio.clientBoard && sio.boards)) return;
    const { clientBoard, boards } = sio;

    // TODO: move this section into something memoized, or maybe another sio state
    // where the server sends a second start after everyone is connected.
    let ready = true;
    for (const board of boards.values()) ready &&= board.isInitialized();

    if (ready) {
      setTicks(clientBoard.getTicks());
      clientBoard.requestPlacing(mousePosition[0]);

      // manual ticking
      const wasTicked = clientBoard.tick();
      if (!wasTicked) {
        clientBoard.step(); // step the physics engine for yourself if events were processed instead
      }

      for (const otherBoard of boards.values()) {
        otherBoard.tick();
        otherBoard.tick(); // tick to catch up the physics engine
        otherBoard.tick(); // tick to catch up with events if you were lagging
      }
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [mousePosition]); // Make sure the effect runs only once

  /**
   * while animate also uses this, DO NOT move it out of animate and put it above animate since animate is
   * a dependency of the useEffect above and weird things happen when you have hooks that happen conditionally
   * see: https://react.dev/warnings/invalid-hook-call-warning
   */
  if (!(sio && sio.clientBoard && sio.boards)) return;
  const { clientBoard, boards } = sio;

  return (
    sio?.boards && (
      <div>
        <div className='flex align-middle w-full h-[100vh]'>
          <Stage
            className='m-auto w-full h-full object-contain block opacity-50 hover:opacity-100 transition-opacity'
            onMouseMove={(e) => {
              const { clientX, clientY } = e;
              const x = clientX - e.currentTarget.offsetLeft;
              const y = clientY - e.currentTarget.offsetTop;
              // console.log(clientX, e.currentTarget.offsetLeft, x);
              setMousePosition([
                (x + 80) / 20 - clientBoard.getWidth(),
                y / 20,
              ]);
            }}
            onMouseDown={() => {
              clientBoard.requestPlace(mousePosition[0]);
            }}
          >
            {clientBoard && (
              <PIXIBoard
                x={-80}
                y={0}
                ticks={ticks}
                width={clientBoard.getWidth()}
                height={clientBoard.getHeight()}
                balls={clientBoard.getBalls()}
                walls={clientBoard.getWalls()}
                nextX={mousePosition[0]}
                nextBall={clientBoard.getNextBall()}
                debugText={clientBoard.getTicks() + ''}
              />
            )}
            {[...boards.entries()].map(
              ([_id, otherBoard], index) =>
                otherBoard.isInitialized() &&
                otherBoard.getId() !== clientBoard.getId() && (
                  <PIXIBoard
                    key={index}
                    x={320}
                    y={index * 10}
                    ticks={ticks}
                    width={otherBoard.getWidth()}
                    height={otherBoard.getHeight()}
                    balls={otherBoard.getBalls()}
                    walls={otherBoard.getWalls()}
                    nextX={otherBoard.getInputX()}
                    nextBall={otherBoard.getNextBall()}
                    debugText={otherBoard.getTicks() + ''}
                  />
                ),
            )}
          </Stage>
        </div>
      </div>
    )
  );
}
