import React, { useEffect, useState } from 'react';

const LoadingAnimation = ({color = null}) => {
  const [bars, setBars] = useState('');
  const [number, setNumber] = useState(0);

  useEffect(() => {
    const loading = [
      ' █2%',
      ' ██5%',
      ' ███8%',
      ' ████11%',
      ' █████14%',
      ' ██████17%',
      ' █████████19%',
      ' ████████████25%',
      ' ██████████████████45%',
      ' ████████████████████████50%',
      ' ██████████████████████████████████████75%',
      ' ██████████████████████████████████████████████████100%',
    ];

    if (number < 100) {
      setTimeout(() => {
        setNumber(number + 1);
        setBars(loading[number]);
      }, 80);
    }
  }, [number]);

  return (
    <div className={color === 'blue' ? 'blue-loading' : 'loading-animation'}>
      {bars}
    </div>
  );
};

export default LoadingAnimation;
