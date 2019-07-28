import { writeFileSync, readFileSync, readFile, existsSync } from 'fs';
import { promisify } from 'util';
import { get } from 'axios';
import { handlePromise, art, info } from './utils/';
import Hangman from './game/Hangman';

const path = './shows.txt';
// TODO: clean this up.
console.log(art);
console.log(info);
console.log(`  waiting for list of tv shows...`);

const getTvShows = async () => {
  // call tv maze to get tv shows for the game
  const apiUrl = get('http://api.tvmaze.com/shows');
  const [getShowsError, getShowsSuccess] = await handlePromise(apiUrl);
  // if  api error
  if (getShowsError) {
    console.log(getShowsError);
    return;
  }
  // if promise resolves
  const { data } = getShowsSuccess;
  return writeThenRead(data);
};

const writeThenRead = data => {
  try {
    writeFileSync(path, JSON.stringify(data));
    console.log(
      `  tv show data has been fetched from api and added to ${path}`
    );
  } catch (err) {
    console.log(err);
  } finally {
    // read file
    const showData = readFileSync(path);
    // parse data
    const shows = JSON.parse(showData);
    // return array of only names
    return shows.map(show => show.name);
  }
};

const checkFile = showListSuccess => {
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
    console.log(
      `  ${path} is corrupt. Deleting file and fetching data again...`
    );
    try {
      // delete file
      unlinkSync(path);
      // run again
      start();
    } catch (err) {
      console.error(err);
    }
  }
};

const createNewGame = (arr, path) => {
  console.log(`  tv show list loaded from ${path}`);
  // load shows into hangman constructor
  const hangman = new Hangman(arr);
  // log theme
  console.log(`  GUESS THE TV SHOW! `);
  // TODO: write instructions here.
  // start game
  hangman.playGame();
};

const start = async () => {
  try {
    // if shows.txt doesn't exist
    if (!existsSync(path)) {
      // await return data from getTvShows
      const tvShowList = await getTvShows();
      createNewGame(tvShowList, path);
    } else {
      // if file does exist
      // check if file is in correct state
      const readFileAsync = promisify(readFile);
      const fileData = await handlePromise(readFileAsync(path));
      const [showListError, showListSuccess] = fileData;

      if (showListError) {
        console.log(showListError);
        return;
      }
      checkFile(showListSuccess);
    }
  } catch (err) {
    console.error(err);
  }
};

start();
