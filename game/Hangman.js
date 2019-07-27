import fs from 'fs';
import inquirer from 'inquirer';
import chalk from 'chalk';
import handlePromise from '../utils/promiseHandler';
import { guessPrompt, playPrompt } from '../utils/prompts';
import Word from './Word';

const wrap = require('wordwrap')(2, 60);
const path = './shows.txt';

const wrongText = chalk.bgRedBright.white.bold;
const rightText = chalk.bgGreenBright.white.bold;
const chosenText = chalk.bgYellowBright.gray.bold;
const solutionText = chalk.underline.bold;

class Hangman {
  constructor(words) {
    this.guessesLeft = 10;
    this.currentWord = {};
    this.selectedLetters = [];
    this.wins = 0;
    this.losses = 0;
    // list of tv shows from api call
    this.words = words;
  }

  playGame() {
    this.guessesLeft = 10;
    this.nextWord();
  }

  nextWord() {
    // empty selected letters
    this.selectedLetters = [];
    // choose random word from imported array
    const randomWord = this.words[
      Math.floor(Math.random() * this.words.length)
    ];
    // create an object from that word with the Word constructor
    this.currentWord = new Word(randomWord);
    console.log(`
    ${this.currentWord}
    `);
    this.makeGuess();
  }

  async askForLetter() {
    // prompt user to input letter
    const answer = await handlePromise(inquirer.prompt(guessPrompt));

    const [answerError, answerSuccess] = answer;
    // if promise rejects return
    if (answerError) {
      console.log(answerError);
      return;
    }
    // if promise resolves
    if (answerSuccess) {
      // this is the actual letter(s)
      const { letterChoice } = answerSuccess;
      // check if letter has been picked already
      const hasLetterBeenChosen = this.wasLetterChosen(letterChoice);
      // if user selects multiple characters stop here
      if (letterChoice.length > 1) {
        console.log(
          `  You can only select one letter at a time... please try again.`
        );
        return;
      }
      // if letter has been selected already stop here
      if (hasLetterBeenChosen) {
        console.log(
          `  ${chosenText(' %s ')} has already been chosen try again`,
          letterChoice
        );
        return;
      }
      // store method return value in a variable
      const isCorrectGuess = this.currentWord.guessLetter(letterChoice);
      // if guess is correct
      if (isCorrectGuess) {
        // push the letter into the selected letters array
        this.selectedLetters.push(letterChoice.toLowerCase());
        console.log(`  ${rightText('DING DING DING! CORRECT!')}`);
      } else {
        // if guess is wrong
        this.selectedLetters.push(letterChoice.toLowerCase());
        this.guessesLeft -= 1;
        console.log(
          `  ${wrongText(
            'INCORRECT! UH OH, the hangman lost a vital organ and/or body part!'
          )}`
        );
        console.log(`  ${this.guessesLeft} guesses left...`);
      }
    }
  }

  wasLetterChosen(letter) {
    // check if the selectedLetters array includes the user guess
    return this.selectedLetters.includes(letter.toLowerCase());
  }

  makeGuess() {
    // this runs after the ask for letter function
    this.askForLetter().then(() => {
      // if no more guesses left user loses
      if (this.guessesLeft < 1) {
        this.losses += 1;
        console.log(
          `\n  No guesses left... \n  The word was ${solutionText(
            this.currentWord.solution()
          )}`
        );
        console.log(
          `\n  You have committed murder ${wrongText(
            ' %s '
          )} time(s). \n  RIP Hangman.`,
          this.losses
        );
        this.getShowInfo();
        this.playAgain();
      } else if (this.currentWord.correctGuess()) {
        // if user wins and completes the word
        this.wins += 1;
        console.log(`  You won!, the hangman has been spared.`);
        console.log(
          `  You have saved the hangman ${rightText(' %s ')} time(s).`,
          this.wins
        );
        this.getShowInfo();
        this.playAgain();
      } else {
        // recursively run again
        this.makeGuess();
      }
    });
  }

  async playAgain() {
    // prompt user to play again
    const answer = await handlePromise(inquirer.prompt(playPrompt));

    const [answerError, answerSuccess] = answer;
    // if promise rejects
    if (answerError) {
      console.log(answerError);
      return;
    }
    // if promise resolves
    if (answerSuccess) {
      const { choice } = answerSuccess;
      if (choice) {
        // if answer is truthy
        this.playGame();
      } else {
        // if answer is falsy
        this.quitGame();
      }
    }
  }

  getShowInfo() {
    // TODO: make this more reuseable
    try {
      const readFile = fs.readFileSync(path);
      const parseShows = JSON.parse(readFile);

      const findShow = parseShows.find(
        show => show.name === this.currentWord.solution()
      );

      const { url, summary, genres, name, status, rating, network } = findShow;

      console.log(`
  Show Name: ${name}
  Status: ${status}
  Genre(s): ${genres.length > 1 ? genres.join(', ') : genres[0]}
  Rating: ${rating.average}
  Network: ${network.name ? network.name : 'no data found'}
  URL: ${url}
  Summary: \n${wrap(summary.replace(/<(?:.|\n)*?>/gm, ''))}
      `);
    } catch (err) {
      console.log(err);
    }
  }

  quitGame() {
    console.log(`Hangman out!`);
    console.log(`Wins: ${this.wins}`);
    console.log(`Losses: ${this.losses}`);
    process.exit(0);
  }
}

export default Hangman;
