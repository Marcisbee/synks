# <img src='https://user-images.githubusercontent.com/16621507/79736025-da5dae80-8301-11ea-9980-528f97c7331d.png' height='46' alt='Sourc' />

**Sourc** is a tiny javascript view renderer, that is built async first components.

It uses JSX/hyperscript for it's templating.
Functions, promises and generators for component composition. And classes for contexts.

## Installation

> **NOTE:** This is proof of concept. Altho it's working as intended it might not be ready for production use!

To install the stable version:

```
npm install --save sourc
```

This assumes you are using [npm](https://www.npmjs.com/) as your package manager.

If you're not, you can [access these files on unpkg](https://unpkg.com/sourc/dist/), download them, or point your package manager to them.

## Documentation

<!-- [Getting started guide](/docs) -->

I'm assuming you already know what JSX is and how to set it up with custom pragma (`Sourc.h`), so let's cut the chase and start with component composition.

#### Hello World example

For simple output we can use simple functional component.

```jsx
function Hello({ what }) {
  return <h1>Hello {what}</h1>;
}

Sourc.mount(<Hello what="World" />, document.body);
```

This example will mount h1 to body like so `<body><h1>Hello World</h1></body>`

#### Counter example

For this we'll need to use generators as they can have state inside them.

```jsx
function *Counter() {
  let count = 0;

  function increment() {
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
  for await ({ fallback, children } of this) {
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
For this we need to extend `Sourc.Context` class to build our own context.

```jsx
class CountContext = Sourc.Context {
  count = 0;
  increment() {
    this.count += 1;
  }
}
```

`count` is a state variable that defaults to `0` and `increment` is a method that increments that count variable. Easy.

Now let's use this context.

```jsx
Sourc.mount(
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

## Architecture

Sourc renders everything to DOM asyncronously. This means every exported method except `h` returns Promise. It waits for every component in it's child tree to be ready and only then it renders it.

This is poverful when using async data fetching and syncing all dom tree together.

It doesn't do incremental rendering, except when you specifically allow it with suspended async generators.

For re-rendering - when updating parent component using `this.next` method, it's child components will ONLY be re-rendered again if props actually change.

Context changes will only trigger update for components that are using that specific Context, not the whole context tree.

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2020, [Marcis (Marcisbee) Bergmanis](https://twitter.com/marcisbee)
