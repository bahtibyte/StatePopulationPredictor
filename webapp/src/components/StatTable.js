import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import {
  SortingState,
  IntegratedSorting,
  IntegratedFiltering,
  SearchState,
} from '@devexpress/dx-react-grid';

import {
  Grid,
  Toolbar,
  SearchPanel,
  VirtualTable,
  TableHeaderRow,
} from '@devexpress/dx-react-grid-material-ui';



let tableComponent = (props) => {
  const [columns] = useState([
    { name: 'name', title: 'Name' },
    { name: 'change', title: '△ Population' },
    { name: 'population', title: 'Population' }
  ]);
  const [rows, setRows] = useState([]);


  const Root = props => <Grid.Root {...props} style={{ height: '100%' }} />;

  let data = props.data

  useEffect(() => {
    let tempRows = []

    let totalGrowthDict = new Proxy({}, {
      get: function (object, property) {
        return object.hasOwnProperty(property) ? object[property] : 0;
      }
    });

    for (let currentYear = props.yearRange[0]; currentYear < props.yearRange[1] + 1; currentYear++) {
      Object.entries(props.data[currentYear]).forEach(([state, data]) => {
        totalGrowthDict[state] += data.net_change
      })
    }

    Object.entries(data[props.yearRange[1]]).forEach(([state, data]) => {

      tempRows.push({ name: state, change: totalGrowthDict[state], population: data.population })
    })


    setRows(tempRows)



  }, [props.yearRange, props.data]);


  return (
    <Paper style={{ height: '100%' }}>
      <Grid
        rows={rows}
        columns={columns}
        rootComponent={Root}
      >
        <SortingState
          defaultSorting={[{ columnName: 'name', direction: 'asc' }]}
        />
        <SearchState />
        <IntegratedFiltering />
        <IntegratedSorting />
        <VirtualTable
          height="auto"
        />
        <TableHeaderRow showSortingControls />
        <Toolbar />

        <SearchPanel />



      </Grid>
    </Paper>
  );
};

export default React.memo(tableComponent, (prevProps, nextProps) => {
  return nextProps.mouseInUseOptimization
});