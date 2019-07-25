const guessPrompt = [
  {
    type: 'input',
    name: 'letterChoice',
    message: 'Guess a letter',
    validate: value => /[a-z1-9]/gi.test(value)
  }
];

const playPrompt = [
  {
    type: 'confirm',
    name: 'choice',
    message: 'Play Again?'
  }
];

export { guessPrompt, playPrompt };
