import axios from 'axios';
import handlePromise from './utils/promiseHandler';
import Hangman from './game/Hangman';

console.log(`waiting for list of tv shows...`);
// call tv maze to get tv shows for the game
const getTvShows = async () => {
  const [showsError, showsSuccess] = await handlePromise(
    axios.get('http://api.tvmaze.com/shows')
  );
  // api error -- add cached copy instead in the future
  if (showsError) {
    console.log(showsError);
    return;
  }
  // if promise resolves
  if (showsSuccess) {
    const { data } = showsSuccess;
    // return array only show names
    return data.map(show => show.name);
  }
};

const start = async () => {
  // wait for list of ~250 shows
  const tvShowList = await getTvShows();
  // load shows into hangman constructor
  const hangman = new Hangman(tvShowList);
  // log theme
  console.log(`  GUESS THE TV SHOW! `);
  // start game
  hangman.playGame();
};

start();
