import population from './../population.csv'
import React, { useState, useRef, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import avgFit from '../avg_fit.json'

let config = {"posColorStart":"#d3e5ff",
"posColorEnd":"#08306B",
"negColorStart": "#fbc1c9",
"negColorEnd": "#8300ff"}
            
let WIDTH = 800, HEIGHT = 500;

let COLOR_COUNTS = 9;

let SCALE = 1;

function Interpolate(start, end, steps, count) {
    let s = start,
        e = end,
        final = s + (((e - s) / steps) * count);
    return Math.floor(final);
}

function Color(_r, _g, _b) {
    let r, g, b;
    let setColors = function(_r, _g, _b) {
        r = _r;
        g = _g;
        b = _b;
    };

    setColors(_r, _g, _b);
    this.getColors = function() {
        let colors = {
            r: r,
            g: g,
            b: b
        };
        return colors;
    };
}

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function valueFormat(d) {
  if (d > 1000000000) {
    return Math.round(d / 1000000000 * 10) / 10 + "B";
  } else if (d > 1000000) {
    return Math.round(d / 1000000 * 10) / 10 + "M";
  } else if (d > 1000) {
    return Math.round(d / 1000 * 10) / 10 + "K";
  } else {
    return d;
  }
}

let COLOR_FIRST = config.posColorStart, COLOR_LAST = config.posColorEnd;

let rgb = hexToRgb(COLOR_FIRST);

let POS_COLOR_START = new Color(rgb.r, rgb.g, rgb.b);

rgb = hexToRgb(COLOR_LAST);
let POS_COLOR_END = new Color(rgb.r, rgb.g, rgb.b);

let MAP_STATE = config.stateDataColumn;
let MAP_VALUE = config.valueDataColumn;

let width = WIDTH,
    height = HEIGHT;


    let positive_colors = []
    
    let startColors = POS_COLOR_START.getColors(),
    endColors = POS_COLOR_END.getColors();

// This array contains the gradients of colors
//  this.colors = [];

for (let i = 0; i < COLOR_COUNTS; i++) {
  let r = Interpolate(startColors.r, endColors.r, COLOR_COUNTS, i);
  let g = Interpolate(startColors.g, endColors.g, COLOR_COUNTS, i);
  let b = Interpolate(startColors.b, endColors.b, COLOR_COUNTS, i);
  positive_colors.push(new Color(r, g, b));
}




class App2 extends React.Component {
    constructor(props) {
      super(props);
      this.selector = React.createRef();
      this.state = {us:null, data: null, names:null, mapPaths:[]}
      this.valueById = d3.map()
      this.quantize = null
      // this.colors = []
      this.idNameMap = null
    }
    updateFunc(){
            
          

            
            // Discrete scale, used somewhat as a dictionary
            // https://github.com/d3/d3-3.x-api-reference/blob/master/Quantitative-Scales.md#quantize-scales
            this.quantize = d3.scale.quantize()
                .domain([0, 0])
                .range(d3.range(COLOR_COUNTS).map((i)=> { return i }));
            let path = d3.geo.path();
            
            let name_id_map = {};
            let id_name_map = {};
            
            for (let i = 0; i < this.state.names.length; i++) {
              name_id_map[this.state.names[i].name] = this.state.names[i].id;
              id_name_map[this.state.names[i].id] = this.state.names[i].name;
            }
            this.idNameMap = id_name_map
            // console.log(name_id_map)

            // For every row in the CSV File
            // console.log("printing Data")
            // console.log(this.state.data['2010'])
            // console.log(Object.entries(this.state.data[this.props.year]))


            let maxPopulation = 0
            let minPopulation = Infinity

            let maxGrowth = 0
            let minGrowth = Infinity

            // let comparisonYear = this.state.data["2010"]

            const mode = true? "growth": "population"
            console.log("Logging Data")
            console.log(this.state.data)
            console.log(this.props.year)
            Object.entries(this.state.data[this.props.year[0]]).forEach(([key, value])=> {
              let comparisonYear = this.state.data[this.props.year[1]]
              if(value > maxPopulation){
                maxPopulation = value
              }else if (value < minPopulation){
                minPopulation = value
              }

              let growthSince2010 = comparisonYear[key] - value

              if(growthSince2010 > maxGrowth){
                maxGrowth = growthSince2010
              }else if (growthSince2010 < minGrowth){
                minGrowth = growthSince2010
              }
              
              
              
              let id = name_id_map[key];
              // access our valueById hash array
              // key = id, value = population (Converted to an integer)
              // This is for when we map to HTML Elements, we can lookup a value by ID
              if(mode == "population"){
              this.valueById.set(id, +value); 
              }else{
                this.valueById.set(id, +growthSince2010); 
              }
            });
            console.log("Logging min growth", minGrowth, maxGrowth)

            // return
          

            // Changes the domain to be between the min and max of the populations

            if(mode == "population"){
            this.quantize.domain([
              minPopulation,
              maxPopulation]);
            }else{
              this.quantize.domain([
                minGrowth,
                maxGrowth]);
            }


              let pathData = topojson.feature(this.state.us, this.state.us.objects.states).features.map(feature => {
                return {id:feature.id, path:path(feature)}
              })

        //       pathData = pathData.filter(function(x) {
        //         return x !== undefined;
        //    });
              this.setState({mapPaths:pathData})

    }

    componentDidMount(){
        d3.tsv("https://gist.githubusercontent.com/amartone/5e9a82772cf1337d688fe47729e99532/raw/65a04d5b4934beda724630f18c475d350628f64d/us-state-names.tsv", (error, names) => {
            d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json", (error, us)=> {
                // d3.csv(population, (err, data) => {
                  console.log("Logging mount data")
                  console.log(avgFit)
                this.setState({names, us, data:avgFit})
                // })
    })
    })
    }

    componentDidUpdate(prevProps, prevState, snapshot){
        if(prevProps.year != this.props.year || prevState.us != this.state.us || prevState.names != this.state.names){
            this.updateFunc()
        }
        // This fixes bug with tooltip not showing
        ReactTooltip.rebuild()
    }
    render() {
      return (
      <div id="canvas-svg" ref={this.selector}>
          <ReactTooltip border={false} />
          <svg width={1000} height={500}>
          {this.state.mapPaths.map(( item)=>{
              let style = ""
              if (this.valueById.get(item.id) != undefined) {
                          let i = this.quantize(this.valueById.get(item.id));
                          let color = positive_colors[i].getColors();
                          style =  "rgb(" + color.r + "," + color.g +
                              "," + color.b + ")";
                        } else {
                            style = "rgb(255, 0, 0)";
                        }
                    

              return <path style={{"outline":"none"}} key={item.id} data-tip={this.idNameMap[item.id] + " : " + this.valueById.get(item.id)} d={item.path} fill={style}/>
          })}
          </svg>
          
      </div>
      )
    }
  }


export default App2;