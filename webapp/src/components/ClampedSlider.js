import { Slider } from '@mui/material';
import React from 'react';

const minDistance = 1;

const maxYear = 2030

export default function App(props) {
  const handleChange2 = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {

      return;
    }

    if (newValue[1] - newValue[0] < minDistance) {
      if (activeThumb === 0) {
        const clamped = Math.min(newValue[0], maxYear - minDistance);
        props.onChange([clamped, clamped + minDistance]);
      } else {
        const clamped = Math.max(newValue[1], minDistance);
        props.onChange([clamped - minDistance, clamped]);
      }
    } else {
      props.onChange(newValue);
    }
  };

  return (
    <Slider
      getAriaLabel={() => 'Minimum distance'}
      value={props.yearSliderValue}
      onChange={handleChange2}
      valueLabelDisplay="auto"
      getAriaValueText={(value) => value}
      marks min={2010} max={maxYear}
    />
  );
}
