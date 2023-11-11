import { expect, test } from 'vitest';
import { suika } from './proto';

test('protobuf example', () => {
  const o = suika.Test.create();
  o.n = 5;
  o.s = 'foo';
  const encoded = suika.Test.encode(o).finish();
  const decoded = suika.Test.decode(encoded);
  expect(decoded.n).toBe(5);
  expect(decoded.s).toBe('foo');
});
