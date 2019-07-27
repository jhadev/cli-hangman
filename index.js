import axios from 'axios';
import handlePromise from './utils/promiseHandler';
import Hangman from './game/Hangman';
import fs from 'fs';

const path = './shows.txt';
// TODO: clean this up.
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

    try {
      fs.writeFileSync(path, JSON.stringify(data));
      console.log(
        `tv show data has been fetched from api and added to ${path}`
      );
    } catch (err) {
      console.log(err);
    } finally {
      const showData = fs.readFileSync(path);
      const shows = JSON.parse(showData);
      return shows.map(show => show.name);
    }
  }
};

const start = async () => {
  // wait for list of ~250 shows
  try {
    if (!fs.existsSync(path)) {
      //file exists

      const tvShowList = await getTvShows();

      console.log(`tv show list loaded from ${path}`);
      // load shows into hangman constructor
      const hangman = new Hangman(tvShowList);
      // log theme
      console.log(` GUESS THE TV SHOW! `);
      // start game
      hangman.playGame();
    } else {
      fs.readFile(path, 'utf8', (err, data) => {
        if (err) {
          console.log(err);
        }

        let tvShowList = JSON.parse(data);
        tvShowList = tvShowList.map(show => show.name);

        const hangman = new Hangman(tvShowList);
        console.log(`tv show list loaded from ${path}`);
        console.log(` GUESS THE TV SHOW! `);
        // start game
        hangman.playGame();
      });
    }
  } catch (err) {
    console.error(err);
  }
};

start();
