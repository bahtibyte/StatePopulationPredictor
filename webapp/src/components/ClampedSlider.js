import { Slider } from '@mui/material';
import React, { useState, useRef } from 'react';

const minDistance = 1;

export default function App(props) {
    // const [yearSliderValue, yearSliderChange] = useState(2012);
  
    const handleChange2 = (event, newValue, activeThumb) => {
        if (!Array.isArray(newValue)) {
          
          return;
        }
    
        if (newValue[1] - newValue[0] < minDistance) {
          if (activeThumb === 0) {
            const clamped = Math.min(newValue[0], 2099 - minDistance);
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
        // <Slider getAriaLabel={() => 'Minimum distance'} step={1} marks min={2010} max={2099} getAriaValueText={(value)=> value}
        // valueLabelDisplay="auto" value={props.yearSliderValue} onChange={handleChange2} />
        <Slider
        getAriaLabel={() => 'Minimum distance'}
        value={props.yearSliderValue}
        onChange={handleChange2}
        valueLabelDisplay="auto"
        getAriaValueText={(value)=> value}
        // disableSwap
         marks min={2010} max={2099}
      />
    );
  }
  