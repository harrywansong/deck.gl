import test from 'tape-catch';
import {JSONDeck} from '@deck.gl/json';

test('import "deck.gl"', t => {
  t.notOk(JSONDeck, 'No empty top-level export');
  t.end();
});
