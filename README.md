# <img src='https://user-images.githubusercontent.com/16621507/81100885-f4101000-8f15-11ea-8b68-b47f56f6a473.png' height='100' alt='Synks' />

**Synks** is a tiny javascript view renderer, that is built async first components.

It uses JSX/hyperscript for it's templating.
Functions, promises and generators for component composition. And classes for contexts.

[![npm version](https://img.shields.io/npm/v/synks.svg?style=flat-square)](https://www.npmjs.com/package/synks)
[![npm downloads](https://img.shields.io/npm/dm/synks.svg?style=flat-square)](https://www.npmjs.com/package/synks)
[![npm bundle size (version)](https://img.shields.io/bundlephobia/minzip/synks/latest?style=flat-square)](https://bundlephobia.com/result?p=synks)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/Marcisbee/synks/Tests?style=flat-square)](https://github.com/Marcisbee/synks/actions?query=workflow%3ATests)

## Installation

> **NOTE:** This is proof of concept. Altho it's working as intended it might not be ready for production use!

To install the stable version:

```
npm install --save synks
```

This assumes you are using [npm](https://www.npmjs.com/package/synks) as your package manager.

If you're not, you can [access these files on unpkg](https://unpkg.com/synks/dist/), download them, or point your package manager to them.

## Documentation

<!-- [Getting started guide](/docs) -->

I'm assuming you already know what JSX is and how to set it up with custom pragma (`Synks.h`), so let's cut the chase and start with component composition.

#### Hello World example

For simple output we can use simple functional component.

```jsx
function Hello({ what }) {
  return <h1>Hello {what}</h1>;
}

Synks.mount(<Hello what="World" />, document.body);
```

This example will mount h1 to body like so `<body><h1>Hello World</h1></body>`

#### Counter example

For this we'll need to use generators as they can have state inside them.

```jsx
function *Counter() {
  let count = 0;

  const increment = () => {
    count++;
    this.next();
  }

  while(true) {
    yield (
      <button onclick={increment}>
        {count}
      </button>
    )
  }
}
```

#### Data fetch example

To handle async data fetching, we can use `async` functionaly component for this.

```jsx
async function Movies() {
  const movieList = await api.getMovieList();

  return (
    <ul>
      {movieList.map((movie) => (
        <li>{movie.title}</li>
      ))}
    </ul>
  );
}
```

_NOTE:_ This will halt all rendering of it's sibling components.

#### Suspense example

This will allow sibling components to render even when all of the childrens here are not yet ready.

```jsx
function Loading() {
  return <div>Loading...</div>;
}

async function *Suspense({ fallback, children }) {
  // Here we are saying when fallback is mounted, go to next yield.
  this.onMount = this.next;

  while (true) {
    yield fallback;
    yield (
      <div>{children}</div>
    );
  }
}
```

This will not stop DOM rendering at async components.

#### Context example

And finally we can use context to sync multiple components with ony state.
For this we need to extend `Synks.Context` class to build our own context.

```jsx
class CountContext extends Synks.Context {
  count = 0;
  increment() {
    this.count += 1;
  }
}
```

`count` is a state variable that defaults to `0` and `increment` is a method that increments that count variable. Easy.

Now let's use this context.

```jsx
Synks.mount(
  <div>
    <CountContext>
      <StateCounter />
      <div>
        <StateCounter />
      </div>
    </CountContext>
  </div>
);
```

No extra steps or requirements here, just wrap your context around child components that will use this context.

Ok, this is not that hard, but where's the catch? Do I need to do some extra stuff when using context in actual component? Well, no. Let's look at our `StateCounter` we used inside `CountContext`.

```jsx
function *StateCounter() {
  const [countContext] = yield CountContext;

  while (true) {
    yield (
      <button onclick={countContext.increment}>
        {countContext.count}
      </button>
    )
  }
}
```

Ok so when you `yield` a context it automatically spits out corresponding context with it's update function: `[context, next]`.

It works just like `useState` where `next({ count: 10 })` will update context state. And trigger update for all components using it.

_NOTE_: Do not destruct `countContext` as it will be transformed to simple value and not be updateable.

Here's a more in depth example of Contexts: [codesandbox.io/s/synks-30bze](https://codesandbox.io/s/synks-30bze?file=/src/index.tsx)

#### Code reuse (mixins vs hooks story)

Let's take for example React hooks. You can create function and reuse that function in multiple components. Hooks can trigger updates, so basically it is extension of component.

Ok, lets take a look at how mixins usually work. You create also some kind of a function and then this function or methods of this mixin gets used in component.

So basically these are kind of 2 different solutions. I might have gone the route of either one of these, but instead I think I've found a solution for this that takes the best of both worlds.

I currently call them hooks internally as they work more like hooks.

It's just a generator function with ability to get parent components scope.

Let's create our first hook, that will listen to keypressed events and increment value accordingly.

```jsx
function* countHook() {
  /**
   * First of all lets get scope of parent component.
   * This will allow us to call `scope.next()` to update
   * component, just like we do in components.
   */
  const scope = yield Synks.SCOPE;
  let count = 0;

  // If pressed key is our target key then set to true
  const downHandler = ({ key }) => {
    if (key === 'ArrowUp') {
      // Increment count state
      count++;
      // And update component
      scope.next();
    }
  }

  // Add event listeners
  window.addEventListener('keydown', downHandler);

  scope.onDestroy = () => {
    // Remove event listeners on cleanup
    window.removeEventListener('keydown', downHandler);
  }

  while (true) {
    // Return count value back to component
    yield count;
  }
}
```

Ok this is how we create hook, but how do we use it?

```jsx
function* Counter() {
  const count = yield countHook();

  while (true) {
    yield (
      <h1>
        {count.value}
      </h1>
    );
  }
}
```

This example available in [https://codesandbox.io/s/synks-hooks-9fehi](https://codesandbox.io/s/synks-hooks-9fehi?file=/src/app/app.tsx)

This is it, now it's fully functional - locally scoped hook used in Counter component.

Note that we use `count.value` instead of `count`, because this is what generator functions return. Also this helps to pass new value without calling `countHook` in while loop.

But that is not all!

Hooks can also use Context!

```jsx
function* countHook() {
  const [countContext] = yield CountContext;

  const downHandler = ({ key }) => {
    if (key === 'ArrowUp') {
      countContext.increment();
      // We don't need to call `.next` here because
      // context updates components itself
    }
  }

  window.addEventListener('keydown', downHandler);
}
```

## Architecture

Synks renders everything to DOM asyncronously. This means every exported method except `h` returns Promise. It waits for every component in it's child tree to be ready and only then it renders it.

This is poverful when using async data fetching and syncing all dom tree together.

It doesn't do incremental rendering, except when you specifically allow it with suspended async generators.

For re-rendering - when updating parent component using `this.next` method, it's child components will ONLY be re-rendered again if props actually change.

Context changes will only trigger update for components that are using that specific Context, not the whole context tree.

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2020, [Marcis (Marcisbee) Bergmanis](https://twitter.com/marcisbee)
