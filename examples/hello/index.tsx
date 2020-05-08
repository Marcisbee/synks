import * as Synks from '../../src';
import { RouterContext } from '../app';

let count = 0;

export function* Hello({ what }) {
  const router = yield RouterContext;
  let localCounter = 0;

  while (true) {
    yield <h1 onclick={() => {
      localCounter++;
      count++;
      this.next();
    }}>Hello {what} - {count} - {localCounter} - {router.route}</h1>;
  }
}
