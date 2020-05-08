import * as Synks from '../src';
import { Hello } from './hello';

export class RouterContext extends Synks.Context {
  route = location.pathname || '/';
  constructor() {
    super();

    window.addEventListener('popstate', () => {
      if (location.pathname !== this.route) {
        this.replace(location.pathname);
      }
    }, false);
  }
  navigate(route) {
    this.route = route;
    history.pushState({}, document.title, route);
  }
  replace(route) {
    this.route = route;
    history.replaceState({}, document.title, route);
  }
}

export function* Router(props: { routes: Record<string, any> }) {
  const router = yield RouterContext;

  while (true) {
    const { routes } = props;

    const route = routes[router.route];

    switch (true) {
      case route instanceof Function: {
        yield route();
        break;
      }

      default: {
        const error = routes['*'];

        if (error instanceof Function) {
          yield error();
        } else {
          yield <div>ERROR 404</div>;
        }
      }
    }
  }
}

const routes = {
  '/': () => <div>Examples</div>,
  '/hello': () => <Hello what="cool" />,
  '/hello2': () => <Hello what="cool" />,
  '*': () => <div>Error 404</div>,
};

function* Header() {
  const router = yield RouterContext;

  while (true) {
    yield (
      <div class="header">
        <ul>
          <li onclick={() => router.navigate('/')}>Start</li>
          <li onclick={() => router.navigate('/hello')}>Hello</li>
          <li onclick={() => router.navigate('/hello2')}>Hello2</li>
        </ul>
      </div>
    );
  }
}

export function App() {
  return (
    <RouterContext>
      <Header />
      <hr />
      <Router routes={routes} />
    </RouterContext>
  );
}