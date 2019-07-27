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
  const [getShowsError, getShowsSuccess] = await handlePromise(apiUrl);
  // if  api error
  if (getShowsError) {
    console.log(getShowsError);
    return;
  }
  // if promise resolves
  const { data } = getShowsSuccess;
  return handleReadWrite(data);
};

const handleReadWrite = data => {
  try {
    fs.writeFileSync(path, JSON.stringify(data));
    console.log(`tv show data has been fetched from api and added to ${path}`);
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
};

const handleSetupCheck = showListSuccess => {
  let tvShowList = JSON.parse(showListSuccess);
  // check if every object in array has a name property
  const isListCorrect = tvShowList.every(show => show.name);
  // if it does
  if (isListCorrect) {
    // create array of only names
    tvShowList = tvShowList.map(show => show.name);
    // load into new game function
    createNewGame(tvShowList, path);
  } else {
    // file does not pass check
    console.log(`${path} is corrupt. Deleting file and fetching data again...`);
    try {
      // delete file
      fs.unlinkSync(path);
      // run again
      start();
    } catch (err) {
      console.error(err);
    }
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

const start = async () => {
  try {
    // if shows.txt doesn't exist
    if (!fs.existsSync(path)) {
      // await return data from getTvShows
      const tvShowList = await getTvShows();
      createNewGame(tvShowList, path);
    } else {
      // if file does exist
      // check if file is in correct state
      const fileData = await handlePromise(readFileAsync(path));

      const [showListError, showListSuccess] = fileData;

      if (showListError) {
        console.log(showListError);
        return;
      }
      handleSetupCheck(showListSuccess);
    }
  } catch (err) {
    console.error(err);
  }
};

start();
