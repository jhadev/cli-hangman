import { readFileSync } from 'fs';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { handlePromise, guessPrompt, playPrompt } from '../utils/';
import Word from './Word';
import Game from './Game';

const wrap = require('wordwrap')(2, 60);
const wordsPath = './logs/shows.txt';

const wrongText = chalk.bgRedBright.gray.bold;
const rightText = chalk.bgGreenBright.gray.bold;
const chosenText = chalk.bgYellowBright.gray.bold;
const guessesText = chalk.underline.bold;
const solutionText = chalk.underline.bold;

class Hangman extends Game {
  constructor(title, instructions, words) {
    super(title, instructions);
    this.currentWord = {};
    this.selectedLetters = [];
    // list of tv shows from txt file
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
    const randomWord = this.words[super.getRandomInt(0, this.words.length - 1)];
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
    // this is the actual letter(s)
    const { letterChoice } = answerSuccess;
    // check if letter has been picked already
    const hasLetterBeenChosen = this.wasLetterChosen(letterChoice);
    // if user selects multiple characters stop here
    if (letterChoice.length > 1) {
      console.log(
        `\n  You can only select one letter at a time... please try again.\n`
      );
      return;
    }
    // if letter has been selected already stop here
    if (hasLetterBeenChosen) {
      console.log(
        `\n  ${chosenText(' %s ')} has already been chosen try again.\n`,
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
      console.log(`  ${rightText('DING DING DING! CORRECT!\n')}`);
    } else {
      // if guess is wrong
      this.selectedLetters.push(letterChoice.toLowerCase());
      this.guessesLeft -= 1;
      console.log(
        `  ${wrongText(
          'INCORRECT! UH OH, the hangman lost a vital organ and/or body part!\n'
        )}`
      );
      console.log(guessesText(`  ${this.guessesLeft} guesses left...\n`));
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
        console.log(
          `\n  No guesses left... \n  The word was ${solutionText(
            this.currentWord.solution()
          )}`
        );
        this.getShowInfo();
        super.calculateScore('loss');
        console.log(
          `\n  You have committed murder ${wrongText(
            ' %s '
          )} time(s). \n  RIP Hangman.`,
          this.losses
        );
        console.log(`  You lost ${this.lossPoints} points for the execution.`);
        this.playAgain();
      } else if (this.currentWord.correctGuess()) {
        // if user wins and completes the word
        this.getShowInfo();
        super.calculateScore('win');
        console.log(`  You won!, the hangman has been spared.`);
        console.log(
          `  You have saved the hangman ${rightText(' %s ')} time(s).`,
          this.wins
        );
        console.log(`  You gained ${this.guessesLeft} points for the pardon.`);
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
    const { choice } = answerSuccess;
    if (choice) {
      // if answer is truthy
      this.playGame();
    } else {
      // if answer is falsy
      this.quitGame();
    }
  }

  getShowInfo() {
    try {
      const readFile = readFileSync(wordsPath);
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
  Network: ${network ? network.name : 'No data found'}
  URL: ${url}
  Summary: \n${wrap(summary.replace(/<(?:.|\n)*?>/gm, ''))}
      `);
    } catch (err) {
      console.log(err);
    }
  }

  quitGame() {
    console.log(
      `  The angry mob is attending a witchhunt. We will reconvene at dusk.\n`
    );
    console.log(`  Pardons: ${this.wins}`);
    console.log(`  Executions: ${this.losses}`);
    console.log(`  Score: ${this.score}`);
    console.log(`  High Score: ${this.highScore}`);
    console.log(
      `  Average # of guesses required to save the hangman: ${super.avgGuess()}`
    );
    process.exit(0);
  }
}

export default Hangman;
