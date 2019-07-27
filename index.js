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
      // stringify data and write to file
      fs.writeFileSync(path, JSON.stringify(data));
      console.log(
        `tv show data has been fetched from api and added to ${path}`
      );
    } catch (err) {
      console.log(err);
    } finally {
      // read file
      const showData = fs.readFileSync(path);
      // parse data
      const shows = JSON.parse(showData);
      // return array of only names
      return shows.map(show => show.name);
    }
  }
};

const start = async () => {
  try {
    // if shows.txt doesn't exist
    if (!fs.existsSync(path)) {
      // await return data from getTvShows
      const tvShowList = await getTvShows();
      console.log(`tv show list loaded from ${path}`);
      // load shows into hangman constructor
      const hangman = new Hangman(tvShowList);
      // log theme
      console.log(` GUESS THE TV SHOW! `);
      // start game
      hangman.playGame();
    } else {
      // if file does exist
      fs.readFile(path, 'utf8', (err, data) => {
        // TODO: account for edge case where file does exist but it isn't intact or is empty
        if (err) {
          console.log(err);
        }
        // parse data
        let tvShowList = JSON.parse(data);
        // get array of only names
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
