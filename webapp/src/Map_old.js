import population from './population.csv'
import React, { useState, useRef, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';


let config = {"color1":"#d3e5ff","color2":"#08306B","stateDataColumn":"state_or_territory","valueDataColumn":"population_estimate_for_july_1_2013_number"}
            
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

let COLOR_FIRST = config.color1, COLOR_LAST = config.color2;

let rgb = hexToRgb(COLOR_FIRST);

let COLOR_START = new Color(rgb.r, rgb.g, rgb.b);

rgb = hexToRgb(COLOR_LAST);
let COLOR_END = new Color(rgb.r, rgb.g, rgb.b);

let MAP_STATE = config.stateDataColumn;
let MAP_VALUE = config.valueDataColumn;

let width = WIDTH,
    height = HEIGHT;


    

class App2 extends React.Component {
    constructor(props) {
      super(props);
      this.selector = React.createRef();
      this.state = {us:null, data: null, names:null, mapPaths:[]}
      this.valueById = d3.map()
      this.quantize = null
      this.colors = []
      this.idNameMap = null
    }
    updateFunc(){
            
          
            let startColors = COLOR_START.getColors(),
                endColors = COLOR_END.getColors();
            
            // This array contains the gradients of colors
             this.colors = [];
            
            for (let i = 0; i < COLOR_COUNTS; i++) {
              let r = Interpolate(startColors.r, endColors.r, COLOR_COUNTS, i);
              let g = Interpolate(startColors.g, endColors.g, COLOR_COUNTS, i);
              let b = Interpolate(startColors.b, endColors.b, COLOR_COUNTS, i);
              this.colors.push(new Color(r, g, b));
            }
            
            // Discrete scale, used somewhat as a dictionary
            // https://github.com/d3/d3-3.x-api-reference/blob/master/Quantitative-Scales.md#quantize-scales
            this.quantize = d3.scale.quantize()
                .domain([0, 1.0])
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
            this.state.data.forEach((d)=> {
              // Get the ID from state name
            //   console.log(d)
              let id = name_id_map[d["state_or_territory"]];
              // access our valueById hash array
              // key = id, value = population (Converted to an integer)
              this.valueById.set(id, +d[MAP_VALUE]); 
            });
          

            // Changes the domain to be between the min and max of the populations
          
            this.quantize.domain([
              d3.min(this.state.data,
              // This function will be the bases by which the min element is found
              function(d){ 
                return +d[MAP_VALUE] 
              }),
              d3.max(this.state.data, function(d){ return +d[MAP_VALUE] })]);
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
                d3.csv(population, (err, data) => {
                  console.log(data)
                this.setState({names, us, data})
                })
    })
    })
    }

    componentDidUpdate(prevProps, prevState, snapshot){
        if(prevProps.year != this.props.year || prevState.us != this.state.us || prevState.names != this.state.names){
            this.updateFunc()
        }
        // This fixes bug with tooltop not showing
        ReactTooltip.rebuild()
    }
    render() {
      return (
      <div id="canvas-svg" ref={this.selector}>
          <ReactTooltip border={false} />
          <svg width={1000} height={500}>
          {this.state.mapPaths.map(( item)=>{
              let style = ""
              if (this.valueById.get(item.id)) {
                          let i = this.quantize(this.valueById.get(item.id));
                          let color = this.colors[i].getColors();
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