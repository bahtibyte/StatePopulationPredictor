import React from 'react';
import ReactTooltip from 'react-tooltip';


let config = {
  "posColorStart": "#c7ffbc",
  "posColorEnd": "#22cd00",
  "negColorStart": "#ffecd0",
  "negColorEnd": "#ff0000"
}

let COLOR_COUNTS = 40;

function Interpolate(start, end, steps, count) {
  let s = start,
    e = end,
    final = s + (((e - s) / steps) * count);
  return Math.floor(final);
}

function Color(_r, _g, _b) {
  let r, g, b;
  let setColors = function (_r, _g, _b) {
    r = _r;
    g = _g;
    b = _b;
  };

  setColors(_r, _g, _b);
  this.getColors = function () {
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


let rgb = hexToRgb(config.posColorStart);
let POS_COLOR_START = new Color(rgb.r, rgb.g, rgb.b);

rgb = hexToRgb(config.posColorEnd);
let POS_COLOR_END = new Color(rgb.r, rgb.g, rgb.b);



rgb = hexToRgb(config.negColorStart);
let NEG_COLOR_START = new Color(rgb.r, rgb.g, rgb.b);

rgb = hexToRgb(config.negColorEnd);
let NEG_COLOR_END = new Color(rgb.r, rgb.g, rgb.b);





let positive_colors = []

let pos_startColors = POS_COLOR_START.getColors(),
  pos_endColors = POS_COLOR_END.getColors();

// This array contains the gradients of colors
//  this.colors = [];


let negative_colors = []

let neg_startColors = NEG_COLOR_START.getColors(),
  neg_endColors = NEG_COLOR_END.getColors()


for (let i = 0; i < COLOR_COUNTS; i++) {
  let r = Interpolate(pos_startColors.r, pos_endColors.r, COLOR_COUNTS, i);
  let g = Interpolate(pos_startColors.g, pos_endColors.g, COLOR_COUNTS, i);
  let b = Interpolate(pos_startColors.b, pos_endColors.b, COLOR_COUNTS, i);
  positive_colors.push(new Color(r, g, b));

  r = Interpolate(neg_startColors.r, neg_endColors.r, COLOR_COUNTS, i);
  g = Interpolate(neg_startColors.g, neg_endColors.g, COLOR_COUNTS, i);
  b = Interpolate(neg_startColors.b, neg_endColors.b, COLOR_COUNTS, i);
  negative_colors.push(new Color(r, g, b));
}




class App2 extends React.Component {
  constructor(props) {
    super(props);
    this.selector = React.createRef();
    this.state = { us: null, data: null, names: null, mapPaths: [] }
    this.valueById = d3.map()
    this.positive_quantize = null
    this.negative_quantize = null
    // this.colors = []
    this.idNameMap = null
    this.outlinePathData = null
  }
  updateFunc() {




    // Discrete scale, used somewhat as a dictionary
    // https://github.com/d3/d3-3.x-api-reference/blob/master/Quantitative-Scales.md#quantize-scales
    this.positive_quantize = d3.scale.quantize()
      .domain([0, 0])
      .range(d3.range(COLOR_COUNTS).map((i) => { return i }));

    this.negative_quantize = d3.scale.quantize()
      .domain([0, 0])
      .range(d3.range(COLOR_COUNTS).map((i) => { return i }));

    let path = d3.geo.path();

    let name_id_map = {};
    let id_name_map = {};

    for (let i = 0; i < this.state.names.length; i++) {
      name_id_map[this.state.names[i].name] = this.state.names[i].id;
      id_name_map[this.state.names[i].id] = this.state.names[i].name;
    }
    this.idNameMap = id_name_map

    let rateOfChangeDict = {
      maxGrowth: 0,
      minGrowth: Infinity,
      maxLoss: -Infinity,
      minLoss: 0
    }

    // Default Dict Equivalent. Default growth is = 0
    let totalGrowthDict = new Proxy({}, {
      get: function (object, property) {
        return object.hasOwnProperty(property) ? object[property] : 0;
      }
    });

    for (let currentYear = this.props.year[0]; currentYear < this.props.year[1] + 1; currentYear++) {
      Object.entries(this.props.data[currentYear]).forEach(([state, data]) => {
        totalGrowthDict[state] += data.net_change
      })
    }

    Object.entries(totalGrowthDict).forEach(([state, growth]) => {

      // The end 'Year' that we want to compare to

      if (growth >= 0) {
        rateOfChangeDict.maxGrowth = Math.max(rateOfChangeDict.maxGrowth, growth)
        rateOfChangeDict.minGrowth = Math.min(rateOfChangeDict.minGrowth, growth)
      } else {
        rateOfChangeDict.maxLoss = Math.max(rateOfChangeDict.maxLoss, growth)
        rateOfChangeDict.minLoss = Math.min(rateOfChangeDict.minLoss, growth)
      }




      let id = name_id_map[state];
      // access our valueById hash array
      // key = id, value = population (Converted to an integer)
      // This is for when we map to HTML Elements, we can lookup a value by ID

      this.valueById.set(id, +growth);
    });



    // Changes the domain to be between the min and max of the populations
    this.positive_quantize.domain([
      rateOfChangeDict.minGrowth,
      rateOfChangeDict.maxGrowth]);

    this.negative_quantize.domain([
      rateOfChangeDict.maxLoss,
      rateOfChangeDict.minLoss]);



    let pathData = topojson.feature(this.state.us, this.state.us.objects.states).features.map(feature => {
      return { id: feature.id, path: path(feature) }
    })

    this.outlinePathData = path(topojson.mesh(this.state.us, this.state.us.objects.states, function (a, b) { return a !== b; }))
    this.setState({ mapPaths: pathData })

  }


  componentDidMount() {
    d3.tsv(require('../data/us-state-names.tsv'), (error, names) => {
      this.setState({ names, us: require('../data/states-10m.json') })

    })
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.year != this.props.year || prevProps.data != this.props.data || prevState.us != this.state.us || prevState.names != this.state.names) {
      this.updateFunc()
    }
    // This fixes bug with tooltip not showing
    ReactTooltip.rebuild()
  }
  render() {
    return (
      <div id="canvas-svg" ref={this.selector}>
        <ReactTooltip border={false}
          getContent={(dataTip) => {
            if (!dataTip) {
              return "";
            }
            const [name, change, population] = dataTip.split("|")

            return <div><div style={{ "fontSize": "18px" }}>{name}</div>△ Population: {change}<br />New Population: {population}</div>
          }
          }

        />
        <svg width={1000} height={500}>
          {this.state.mapPaths.map((item) => {
            let style = ""
            if (this.valueById.get(item.id) != undefined) {
              let value = this.valueById.get(item.id)

              let color = null;
              if (value >= 0) {
                let i = this.positive_quantize(value);
                color = positive_colors[i].getColors();
              } else {
                let i = this.negative_quantize(value);
                color = negative_colors[i].getColors();
              }

              style = "rgb(" + color.r + "," + color.g +
                "," + color.b + ")";
            } else {
              style = "rgb(255, 0, 0)";
            }
            return <path style={{ "outline": "none" }} key={item.id} data-tip={
              `${this.idNameMap[item.id]}|${this.valueById.get(item.id)}|${this.props.data[this.props.year[1]][this.idNameMap[item.id]]?.population}`
            }
              d={item.path} fill={style} />
          })}

          <path style={{ "stroke": "grey", "strokeLinejoin": "round", "fill": "none" }} d={this.outlinePathData} />

        </svg>

      </div>
    )
  }
}


export default App2;