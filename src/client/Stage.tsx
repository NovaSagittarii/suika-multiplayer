import { BlurFilter, TextStyle } from 'pixi.js';
import { Stage, Container, Sprite, Text } from '@pixi/react';
import { useMemo } from 'react';
import PIXIBoard from './PIXIBoard';
import Board from '../lib/Board';

export default function PIXIStage() {
  const blurFilter = useMemo(() => new BlurFilter(4), []);

  return (
    <Stage>
      <Sprite
        image='https://pixijs.io/pixi-react/img/bunny.png'
        x={400}
        y={270}
        anchor={{ x: 0.5, y: 0.5 }}
      />

      <Container x={400} y={330}>
        <Text
          text='Hello World'
          style={
            {
              fill: 'red',
            } as TextStyle
          }
          anchor={{ x: 0.5, y: 0.5 }}
          filters={[blurFilter]}
        />
      </Container>
    </Stage>
  );
}
