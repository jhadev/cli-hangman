class Letter {
  constructor(character) {
    this.isLetter = new RegExp(!/[a-z1-9]/i).test(character);

    this.character = character;
  }

  toString() {
    return this.isLetter ? this.character : '_';
  }

  solution() {
    return this.character;
  }

  guessLetter(guess) {
    if (guess.toUpperCase() === this.character.toUpperCase()) {
      this.isLetter = true;
      return true;
    }

    return false;
  }
}

export default Letter;
