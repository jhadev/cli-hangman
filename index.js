import {
  writeFileSync,
  readFileSync,
  readFile,
  existsSync,
  unlinkSync
} from 'fs';
import { promisify } from 'util';
import { get } from 'axios';
import { handlePromise, title, instructions } from './utils/';
import Hangman from './game/Hangman';

const path = './logs/shows.txt';
// TODO: clean this up.
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
  // TODO: fix logic here
  let tvShowList = showListSuccess.length ? JSON.parse(showListSuccess) : [];
  // check if every object in array has a name property
  // RETURNS TRUE ON EMPTY ARRAY
  const isListCorrect = tvShowList.every(show => show.name);
  // if it does AND tvShowLists isn't an empty array.
  if (isListCorrect && tvShowList.length) {
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
  const hangman = new Hangman(title, instructions, arr);
  hangman.displayTitle();
  hangman.displayInstructions();
  // log theme
  console.log(`  GUESS THE TV SHOW! `);
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
