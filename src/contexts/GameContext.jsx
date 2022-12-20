import React, { createContext, useState, useEffect, useMemo } from 'react';
import { userInputPrefix, spacer, outputPrefix } from 'utils';
import 'App.scss';

import {
  failSound,
  readyForInput,
  successSound,
  mainMusic,
  intenseMusic,
} from 'sounds/sounds';

import { puzzle1 } from 'puzzles/puzzle1';
import { puzzle2 } from 'puzzles/puzzle2';
import { puzzle3 } from 'puzzles/puzzle3';
import { puzzle4 } from 'puzzles/puzzle4';
import Intro from 'views/Intro/Intro';
import Dialog from 'components/Dialog';

export const GameContext = createContext({});

export const GameProvider = ({ children }) => {
  const [gameHidden, setGameHidden] = useState(false);
  const [inputValue, setInputValue] = useState(''); // player input
  const [game, setGame] = useState([<Intro />]); // game is an array of views
  const [firstLogin, setFirstLogin] = useState(true); // used to determine if the user has logged in for the first time
  const [firstJoke, setFirstJoke] = useState(true); // used to determine if the user has heard the first joke
  const [glitching, setGlitching] = useState(false); // used to determine if the screen is glitching
  const [startTime, setStartTime] = useState(0); // used to determine the start time of the game
  const [gameState, setGameState] = useState({
    // used to store the state of the game
    currentExpectedInput: '',
    lastInput: '',
    playerInput: '',
    gameStarted: false,
    gameEnded: false,
    currentPuzzle: 0,
    currentPuzzleIndex: 12,
    musicPlaying: false,
    currentMusic: mainMusic,
  });

  useEffect(() => {
    setStartTime(Date.now());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.gameStarted]);

  const timeline = useMemo(
    () => [
      {
        id: 1,
        puzzle: puzzle1(
          gameState.lastInput,
          failSound,
          successSound,
          readyForInput,
          setGlitching
        ),
      },
      {
        id: 2,
        puzzle: puzzle2(
          gameState.playerInput,
          failSound,
          successSound,
          readyForInput
        ),
      },
      {
        id: 3,
        puzzle: puzzle3(
          gameState.playerInput,
          setGlitching,
          failSound,
          successSound,
          readyForInput
        ),
      },
      {
        id: 4,
        puzzle: puzzle4(
          gameState.playerInput,
          setGlitching,
          failSound,
          successSound,
          readyForInput,
          setGameState,
          gameState,
          setGameHidden
        ),
      },
    ],
    [gameState]
  );

  const incrementPuzzle = (puzzle, puzzleIndex) => {
    setGameState({
      ...gameState,
      currentPuzzle: puzzle,
      currentPuzzleIndex: puzzleIndex,
      currentExpectedInput:
        timeline[puzzle]?.puzzle[puzzleIndex].dialog.expectedInput,
    });
  };

  useEffect(() => {
    if (gameState.currentExpectedInput === 'username') {
      const usernameLocal = () => {
        localStorage.setItem('CIAusername', gameState.playerInput);
      };
      usernameLocal();
      setGameState({
        ...gameState,
        playerInput: 'username',
      });
    }

    if (gameState.currentExpectedInput === 'password') {
      const passwordLocal = () => {
        localStorage.setItem('CIApassword', gameState.playerInput);
      }
      passwordLocal();
      setGameState({
        ...gameState,
        playerInput: 'password',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.playerInput]);

  useEffect(() => {
    const successResponse = () =>
      timeline[gameState.currentPuzzle].puzzle[
        gameState.currentPuzzleIndex
      ].dialog.responses.successResponse?.map((resp, i) => {
        if (typeof resp === 'string') return resp;
        setTimeout(() => {
          if (typeof resp === 'function') resp();
          if (typeof resp === 'object') return resp;
        }, 1000 * i);
        return null;
      });

    const failureResponse = () =>
      timeline[gameState.currentPuzzle].puzzle[
        gameState.currentPuzzleIndex
      ].dialog.responses.failureResponse?.map((resp, i) => {
        if (typeof resp === 'string') return resp;
        setTimeout(() => {
          if (typeof resp === 'function') resp();
          if (typeof resp === 'object') return resp;
        }, 1000 * i);
        return null;
      });

    if (gameState.playerInput.toLowerCase() === 'login' && firstLogin) {
      setGameState({
        ...gameState,
        playerInput: '',
        gameStarted: true,
        musicPlaying: true,
      });
      gameState.musicPlaying
        ? gameState.currentMusic.pause()
        : (gameState.currentMusic.loop = true) && gameState.currentMusic.play();
      setFirstLogin(false);
    }

    if (
      gameState.gameStarted &&
      gameState.playerInput === gameState.currentExpectedInput &&
      gameState.lastInput.toLowerCase() !== 'music' &&
      gameState.playerInput.toLowerCase() !== 'login' &&
      gameState.playerInput.toLowerCase() !== 'hint'
    ) {
      if (successResponse) {
        setGame([...game, <Dialog response={successResponse} />]);
      }
      if (
        gameState.currentPuzzleIndex ===
        timeline[gameState.currentPuzzle].puzzle.length - 1
      ) {
        incrementPuzzle(gameState.currentPuzzle + 1, 0);
      } else {
        setGameState((prev) => ({
          ...prev,
          currentPuzzleIndex: prev.currentPuzzleIndex + 1,
          currentExpectedInput:
            timeline[prev.currentPuzzle].puzzle[prev.currentPuzzleIndex + 1]
              .dialog.expectedInput,
        }));
      }
    }

    if (
      gameState.gameStarted &&
      gameState.playerInput !== gameState.currentExpectedInput &&
      gameState.currentExpectedInput !== 'username' &&
      gameState.currentExpectedInput !== 'password' &&
      gameState.lastInput.toLowerCase() !== 'music' &&
      gameState.playerInput.toLowerCase() !== 'login' &&
      gameState.playerInput.toLowerCase() !== 'hint'
    ) {
      if (failureResponse) {
        setGame([...game, <Dialog response={failureResponse} />]);
      }
    }

    if (gameState.playerInput.toLowerCase() === 'hint') {
      setGame([
        ...game,
        <Dialog
          response={[
            `Your hint code is ${
              timeline[gameState.currentPuzzle].puzzle[
                gameState.currentPuzzleIndex
              ].dialog.hint
            }`,
          ]}
        />,
      ]);
    }

    if (
      gameState.playerInput === 'https://75896-29742-69504-22231' &&
      firstJoke
    ) {
      const joke = [
        `${userInputPrefix} '${gameState.lastInput}'`,
        `${outputPrefix} Decrypting...`,
        'loading',
        `${outputPrefix} Wait...`,
        `${outputPrefix} This is the EXAMPLE`,
        `${outputPrefix} VERY FUNNY, Mr. Funny Guy`,
        spacer,
        `${outputPrefix} ENTER "A REAL" URL TO HACK OR DECRYPT`,
        spacer,
        () => readyForInput.play(),
      ];

      setGame([...game, <Dialog response={joke} />]);
      setFirstJoke(false);
    }

    if (gameState.playerInput.toLowerCase() === 'music') {
      setGameState({
        ...gameState,
        playerInput: '',
        musicPlaying: !gameState.musicPlaying,
      });
      gameState.musicPlaying
        ? gameState.currentMusic.pause()
        : (gameState.currentMusic.loop = true) && gameState.currentMusic.play();
    }

    if (gameState.currentPuzzle === 4) {
      setGameState({
        ...gameState,
        currentMusic: intenseMusic,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.playerInput]);

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState,
        glitching,
        setGlitching,
        game,
        inputValue,
        setInputValue,
        gameHidden,
        startTime,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
