import axios from 'axios';
import handlePromise from './utils/promiseHandler';
import Hangman from './game/Hangman';
import fs from 'fs';
import { promisify } from 'util';

const path = './shows.txt';

const readFileAsync = promisify(fs.readFile);
// TODO: clean this up.
console.log(`waiting for list of tv shows...`);
// call tv maze to get tv shows for the game
const getTvShows = async () => {
  const apiUrl = axios.get('http://api.tvmaze.com/shows');
  const [showsError, showsSuccess] = await handlePromise(apiUrl);
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
      // FIXME: account for is file exists but is empty or not in correct state.
      // await return data from getTvShows
      const tvShowList = await getTvShows();
      createNewGame(tvShowList, path);
    } else {
      // if file does exist
      const fileData = await handlePromise(readFileAsync(path));

      const [showListError, showListSuccess] = fileData;

      if (showListError) {
        console.log(showListError);
        return;
      }

      if (showListSuccess) {
        let tvShowList = JSON.parse(showListSuccess);
        // get array of only names
        tvShowList = tvShowList.map(show => show.name);
        createNewGame(tvShowList, path);
      }
    }
  } catch (err) {
    console.error(err);
  }
};

const createNewGame = (arr, path) => {
  console.log(`tv show list loaded from ${path}`);
  // load shows into hangman constructor
  const hangman = new Hangman(arr);
  // log theme
  console.log(` GUESS THE TV SHOW! `);
  // start game
  hangman.playGame();
};

start();
