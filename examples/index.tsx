import * as Synks from '../src';
import { getMovieList } from './api';

import './app.css';

async function MovieList() {
  const movies = await getMovieList();

  return (
    <div>
      <span>Data loaded!</span>
      {movies.map(movie => (
        <div>
          <strong>{movie.title}</strong>
        </div>
      ))}
    </div>
  );
}

function DateTime() {
  return (
    <div>
      <h6>State:</h6>
      <time>{new Date().toLocaleTimeString()}</time>{" "}
      <button onclick={() => this.next()}>update</button>
    </div>
  );
}

function* Counter({ initial }) {
  let mounted = true;
  let count = initial || 0;

  const decrement = () => {
    count -= 1;
    this.next();
  };

  const increment = () => {
    count += 1;
    this.next();
  };

  const unmount = () => {
    mounted = false;
    this.next();
  };

  while (mounted) {
    const randomNumber = Math.round(Math.random() * 10);
    yield (
      <div>
        <h1>
          {count} - {randomNumber}
        </h1>
        [
        {new Array(count + 1).fill(1).map(() => (
          <strong>*</strong>
        ))}
        ]
        <button onClick={decrement} disabled={count <= 0}>
          -
        </button>
        <button onClick={increment}>+</button>
        <button onClick={unmount}>unmount</button>
      </div>
    );
  }

  return <div>Done</div>;
}

function Loading() {
  return <div>Loading data...</div>;
}

async function* Suspense({ fallback, children }: any) {
  for await ({ fallback, children } of this) {
    yield fallback;
    yield <div>{children}</div>;
  }
}

// Error boundary still doesn't work
function ErrorBoundary({ children }) {
  try {
    return <div>{children}</div>;
  } catch (e) {
    return <div>Error</div>;
  }
}

function Sample1() {
  throw new Error("Weeeee");
}

let kids = [];
function App() {
  return (
    <div>
      <h1>App</h1>
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill-rule="evenodd"
          clip-rule="evenodd"
        >
          <path d="M21 11a1 1 0 10-2 0 1 1 0 002 0m3 .486c-1.184 2.03-3.29 4.081-5.66 5.323-1.336-1.272-2.096-2.957-2.103-4.777-.008-1.92.822-3.704 2.297-5.024 2.262.986 4.258 2.606 5.466 4.478m-6.63 5.774a9.989 9.989 0 01-1.861.573C14.388 19.181 12.713 20 10.222 20c-.387 0-.794-.02-1.222-.061a5.195 5.195 0 001.02-2.653C7.303 16.282 5.344 14.412 4 12.999c-1.038 1.175-2.432 2-4 2 1.07-1.891 1.111-4.711 0-6.998 1.353.021 3.001.89 4 1.999 1.381-1.2 3.282-2.661 6.008-3.441-.1-.828-.399-1.668-1.008-2.499.429-.04.837-.06 1.225-.06 2.467 0 4.135.801 5.256 2.128.68.107 1.357.272 2.019.495-1.453 1.469-2.271 3.37-2.263 5.413.008 1.969.773 3.799 2.133 5.224" />
        </svg>
      </div>
      before <br />
      --
      <div>
        <DateTime />
        <h6>Keyed Diffing:</h6>
        <button
          onclick={() => {
            kids = kids.concat(
              <div key={kids.length}>hello {kids.length + 1}</div>
            );
            this.next();
          }}
        >
          add child
        </button>
        <button
          onclick={() => {
            kids = kids.slice();
            let secondLast = kids[kids.length - 2];
            kids[kids.length - 2] = kids[1];
            kids[1] = secondLast;
            this.next();
          }}
        >
          swap 2nd ↔ 2nd last
        </button>
        <div class="kids">{kids}</div>
        {/* <Suspense fallback={<Loading />}> */}
          lalala
          <div>
          <h2>asd</h2>
          <MovieList />
        </div>
        {/* </Suspense> */}
      </div>
      --
      <Counter initial={0} />
      after
      <hr />
      Context:
      {/* <ContextApp /> */}
    </div>
  );
}

var num = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" ");
var tens = "twenty thirty forty fifty sixty seventy eighty ninety".split(" ");

function number2words(n) {
  if (n < 20) return num[n];
  var digit = n % 10;
  if (n < 100) return tens[~~(n / 10) - 2] + (digit ? "-" + num[digit] : "");
  if (n < 1000) return num[~~(n / 100)] + " hundred" + (n % 100 == 0 ? "" : " " + number2words(n % 100));
  return number2words(~~(n / 1000)) + " thousand" + (n % 1000 != 0 ? " " + number2words(n % 1000) : "");
}
// class NumberContext extends Synks.Context {
//   name = 'zero';
//   toWord(number) {
//     this.name = number2words(number);
//   }
// }

// class CountContext extends Synks.Context {
//   count = 0;
//   increment() {
//     return this.count += 1;
//   }
// }

// function* Comp() {
//   const [countContext, next] = yield CountContext;
//   // @TODO: Do multiple contexts
//   const [numberContext] = yield NumberContext;

//   while (true) {
//     yield (
//       <div>
//         <h1 className={countContext.count}>
//           {countContext.count} ({numberContext.name}) <CountButton />
//         </h1>
//         <button onclick={() => numberContext.toWord(countContext.increment())}>
//           +
//         </button>
//         <button onclick={() => { next({ count: countContext.count - 1 }) }}>
//           -
//         </button>
//       </div>
//     )
//   }
// }

// function ContextApp() {
//   return (
//     <div>
//       {/* <Comp /> */}
//       <CountContext>
//         <NumberContext>
//           {Math.random().toString()}
//           <CountButton />
//           <Comp />
//           <hr />
//           <Comp />
//         </NumberContext>
//       </CountContext>
//     </div >
//   );
// }

function* CountButton() {
  let count = 0;

  while (true) {
    yield (
      <button onclick={() => { count++, this.next() }}>
        {count}
      </button>
    );
  }
}


// class CountContext2 extends Synks.Context {
//   count = 0;
//   constructor() {
//     super();
//     // const next = () =>
//     //   requestAnimationFrame(() => {
//     //     this.increment();
//     //     next();
//     //   });
//     // next();
//     setInterval(() => {
//       this.increment();
//     }, 1000);
//   }
//   increment() {
//     this.count += 1;
//   }
// }

// function* Header() {
//   const [countContext] = yield CountContext2;

//   while (true) {
//     yield <h1>{countContext.count}</h1>;
//   }
// }

// function* StateCounter() {
//   const [countContext] = yield CountContext2;
//   let clicks = 0;

//   const onClick = () => {
//     clicks++;
//     countContext.increment();
//   }

//   while (true) {
//     yield (
//       <button onclick={onClick}>
//         add ({countContext.count} : {clicks})
//       </button>
//     );
//   }
// }

(async () => {
  // For HMR
  console.clear();
  document.body.innerHTML = 'Rendering started..<br/><br/><div id="root"></div>';

  // await Synks.mount(<ErrorBoundary><Sample1 /></ErrorBoundary>, document.getElementById('root'));
  await Synks.mount(<App />, document.getElementById('root'));
  // await Synks.mount(<div>
  //   <CountContext2>
  //     <Header />
  //     <StateCounter />
  //   </CountContext2>
  // </div>, document.getElementById('root'));
  // await Synks.mount(<ContextApp />, document.getElementById('root'));
})();
