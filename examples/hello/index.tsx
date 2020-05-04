import * as Synks from '../../src';
import { RouterContext } from '../app';

let count = 0;

export function* Hello({ what }) {
  const [router] = yield RouterContext;

  while (true) {
    yield <h1 onclick={() => {
      count++;
      this.next();
    }}>Hello {what} - {count} - {router.route}</h1>;
  }
}
