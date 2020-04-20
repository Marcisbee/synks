const movieList = [
  {
    title: "Spider-Man: Homecoming"
  }
];

function sleep(ms = (window as any).sleepTimer || 1000) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getMovieList() {
  await sleep();

  return movieList;
}
