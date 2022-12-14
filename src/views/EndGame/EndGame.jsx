import React, { useState, useContext, useEffect, useRef } from 'react';
import { GameContext } from 'contexts/GameContext';
import { alabasterMusic, failSound } from 'sounds/sounds';
import { jumblyLines, rollCredits } from './endGameData';
import Alabaster from 'components/Banners/Alabaster';
import LoadingAnimation from 'components/LoadingAnimation';
import { determineTime } from 'utils';
import 'App.scss';
const alabasterBG =
  'https://esc-room-games.s3.us-west-1.amazonaws.com/Daffodil362/Assets/Grid%202.jpg';

const EndGame = () => {
  const { gameState, setGameState, startTime, setGlitching } =
    useContext(GameContext);
  const [entered, setEntered] = useState(false);
  const [jumbles, setJumbles] = useState([]);
  const [credits, setCredits] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setGlitching(false);
    }, 500);
    document.getElementById('end-game').focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const jumble = setTimeout(() => {
      setJumbles((jumbles) => [
        ...jumbles,
        <React.Fragment key={jumblyLines[jumbles.length]}>
          <div
            className="blue-text-line"
            aria-label={jumblyLines[jumbles.length]}
          >
            {jumblyLines[jumbles.length]}
          </div>
          <br />
        </React.Fragment>,
      ]);
    }, 50);
    return () => clearTimeout(jumble);
  }, [jumbles]);

  useEffect(() => {
    if (credits.length === rollCredits.length) return;
    if (entered) {
      if (rollCredits[credits.length] === 'loading') {
        setCredits((credits) => [
          ...credits,
          <React.Fragment key={rollCredits[credits.length]}>
            <LoadingAnimation color={'blue'} />
          </React.Fragment>,
        ]);
      }
      if (rollCredits[credits.length] === 'GAMEPLAY TIME') {
        setCredits((credits) => [
          ...credits,
          <React.Fragment key={rollCredits[credits.length]}>
            <div className="blue-text-line" aria-label="play-time">
              Your time: {determineTime(startTime)} Minutes
            </div>
            <br />
          </React.Fragment>,
        ]);
      } else if (rollCredits[credits.length] === 'USERNAME') {
        setCredits((credits) => [
          ...credits,
          <React.Fragment key={rollCredits[credits.length]}>
            <div className="blue-text-line" aria-label="credits">
              {localStorage.getItem('CIAusername')}
            </div>
            <br />
          </React.Fragment>,
        ]);
      } else {
        const credit = setTimeout(() => {
          setCredits((credits) => [
            ...credits,
            <React.Fragment key={rollCredits[credits.length]}>
              <div
                className="blue-text-line"
                aria-label={rollCredits[credits.length]}
              >
                {rollCredits[credits.length]}
              </div>
              <br />
            </React.Fragment>,
          ]);
        }, 1000);
        return () => clearTimeout(credit);
      }
    }
  }, [entered, credits, startTime]);

  useEffect(() => {
    setGameState({
      ...gameState,
      musicPlaying: true,
      currentMusic: alabasterMusic,
    });
    (alabasterMusic.loop = true) && alabasterMusic.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setEntered(true);
    } else {
      failSound.play();
    }
  };

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [credits]);

  return (
    <div
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        background: `url(${alabasterBG})`,
        backgroundSize: 'cover',
        height: '100vh',
        width: '100vw',
        paddingLeft: '2rem',
        textAlign: 'center',
      }}
    >
      <>
        {!entered && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              top: '0',
              left: '0',
              height: '100vh',
              width: '100vw',
              background: 'rgba(0,0,0,0.5)',
            }}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            id="end-game"
          >
            <div
              className="instructions"
              style={{
                background: 'gray',
                padding: '2rem',
                border: 'groove #797979 5px',
                fontSize: '2rem',
                color: 'black',
              }}
            >
              Call (818) 665 - 3245<br />
              Enter code 701<br />
              Then press ENTER on your keyboard.
            </div>
          </div>
        )}

        <Alabaster />
        <br />
        {!entered ? (
          jumbles
        ) : (
          <div style={{ overflow: 'auto', height: '100%' }}>
            {credits}
            <div ref={messagesEndRef} />
          </div>
        )}
      </>
    </div>
  );
};

export default EndGame;
