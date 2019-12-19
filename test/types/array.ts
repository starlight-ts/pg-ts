import { ArrayParser } from '../../dist';
import ava from 'ava';

ava('array(empty)', (t): void => {
    t.deepEqual(new ArrayParser('{}').parse(), [], 'Empty');
});

ava('array(empty string)', (t): void => {
    t.deepEqual(new ArrayParser('{""}').parse(), [''], 'Empty string');
});

ava('array(nested)', (t): void => {
    t.deepEqual(new ArrayParser<string[]>('{{""}}').parse(), [['']], 'Nested array');
});

ava('array(numeric strings)', (t): void => {
    t.deepEqual(new ArrayParser('{1,2,3}').parse(), ['1', '2', '3'], 'Numeric strings');
});
