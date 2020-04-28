import * as Synks from '../../src';
import { RouterContext } from '../app';

export function* Hello({ what }) {
  const [router] = yield RouterContext;

  return <h1>Hello {what}</h1>;
}
