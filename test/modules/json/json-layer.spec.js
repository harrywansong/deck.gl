import test from 'tape-catch';
import {JSONLayer} from '@deck.gl/json';

test('import "deck.gl"', t => {
  t.notOk(JSONLayer, 'No empty top-level export');
  t.end();
});
