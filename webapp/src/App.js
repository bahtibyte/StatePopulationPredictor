import React, { useState, useRef } from 'react';


import './App.css';


import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';


import FormControl from '@mui/material/FormControl';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';

import Map from './components/MapV3'
import ClampedSlider from './components/ClampedSlider'
import StatTable from './components/StatTable';


import avg_fit_population from './data/avg_fit.json'
import best_fit_population from './data/best_fit.json'




function App() {
  // const [usstate, setUSState] = useState("New York");
  // const [mapDimensions, setMapDimensions] = useState({width: 500, height: 500});

  const [yearSliderValue, yearSliderChange] = useState([2012, 2013]);
  const [metricData, changeMetricData] = useState(best_fit_population)
  const [metric, metricChange] = useState("Best-Fit");
  const [mouseInUse, changeMouseStatus] = useState(false)



  let mapRef = React.createRef();

  // Stretch Goal: Improve responsiveness
//   React.useEffect(() => {
//      let handleResize = () => {
//        if(mapRef.current != null){
//         let ch = mapRef.current.clientHeight
//         let cw = mapRef.current.clientWidth
//         console.log({width: cw, height: ch})
//        setMapDimensions({width: cw, height: ch})
//        }

    
// }
//     window.addEventListener('resize', handleResize)
//   })


  return (
    <div className="App">
      <div id="leftPanel">
        <div id="toggleContainer">
        <FormControl>
          <FormLabel>Extrapolation Method</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            value={metric}
            onChange={(e) => {
              metricChange(e.target.value)
              if(e.target.value == "Best-Fit"){
                changeMetricData(best_fit_population)
              }else{
                changeMetricData(avg_fit_population)
              }
            }}
          >
            <FormControlLabel value="Best-Fit" control={<Radio />} label="Best-Fit" />
            <FormControlLabel value="Average-Fit" control={<Radio />} label="Average-Fit" />
          </RadioGroup>
        </FormControl>

       
        </div>

    <div id="tableContainer">
<StatTable yearRange={yearSliderValue} data={metricData} mouseInUseOptimization={mouseInUse}/>
    </div>
    
      </div>
      <div id="rightPanel">
        <div id="headerBar">
          <div id="header_spacer">

          </div>
          <div id="header_text">
            Population Predictor
          </div>
          <div id="header_dropdown">
            {/* <FormControl></FormControl>
            <FormControl >
              <InputLabel id="demo-simple-select-label">State</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={usstate}
                label="State"
                onChange={(e)=>setUSState(e.target.value)}
              >
                <MenuItem value={"New York"}>New York</MenuItem>
                <MenuItem value={"California"}>California</MenuItem>
                <MenuItem value={"Texas"}>Texas</MenuItem>
              </Select>
            </FormControl> */}
          </div>
        </div>
        <div ref={mapRef} id="Map">
          <Map data={metricData} year={yearSliderValue}/>
        </div>
        <div onMouseDown={ ()=> changeMouseStatus(true) } onMouseUp={ ()=> changeMouseStatus(false) } id="slider">
  <ClampedSlider yearSliderValue={yearSliderValue} onChange={(state) => { yearSliderChange(state) }}/>
        </div>

      </div>
    </div>
  );
}

export default App;
