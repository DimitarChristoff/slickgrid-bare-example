import * as React from 'react';
import ReactDOM from 'react-dom';
import Data from 'slickgrid-bare/dist/data';
import Grid from 'slickgrid-bare/dist/6pac';
import {
  symbols,
  priceFormatter,
  percentFormatter,
  volumeFormatter,
  symbolFormatter,
  timeFormatter,
  rates
} from './lib/utils';
import FSBLoader from './components/FSBLoader';

const options = {
  rowHeight: 32,
  editable: true,
  enableAddRow: !true,
  enableCellNavigation: true,
  // asyncEditorLoading: false,
  enableAsyncPostRender: !false,
  autoEdit: false,
  forceFitColumns: true,
  showHeaderRow: true,
  headerRowHeight: 32,
  explicitInitialization: true
};

const companyNames = [];
const columnFilters = {};

// data view
const dv = new Data.DataView();
dv.setFilter(item => {
  let pass = true;

  for (let key in item) {
    if (key in columnFilters && columnFilters[key].length) {
      pass =
        pass && String(item[key]).match(new RegExp(columnFilters[key], 'ig'));
    }
  }
  return pass;
});

// dv.getItemMetadata = index => {
//   const row = dv.getItem(index);
//   return row.type === 'BUY' ? {cssClasses: 'buy'} : {cssClasses: ''};
// };
// end data view

// column definitions
const sortable = true;
const columns = [
  ...Object.keys(symbols.meta.field.shortName).map(field => {
    let formatter;
    let cssClass;
    let comparer = (a, b, args) =>
      a[args.sortCol.field] > b[args.sortCol.field] ? 1 : -1;
    switch (symbols.meta.field.type[field]) {
      case 'price':
        if (['lowPrice', 'highPrice'].indexOf(field) === -1)
          formatter = priceFormatter;
        cssClass = 'amount';
        break;
      case 'priceChange':
        cssClass = 'amount';
        formatter = priceFormatter;
        break;
      case 'percentChange':
        cssClass = 'amount';
        formatter = percentFormatter;
        break;
      case 'integer':
        formatter = volumeFormatter;
        cssClass = 'amount';
        break;
      case 'time':
        formatter = timeFormatter;
        break;
    }
    if (field === 'symbol') {
      cssClass = 'is-actions';
      formatter = symbolFormatter;
    }
    const colDef = {
      id: field,
      name: symbols.meta.field.shortName[field],
      title: symbols.meta.field.description[field],
      field,
      sortable,
      cssClass,
      comparer,
      minWidth: 110
    };

    if (formatter) {
      colDef.formatter = formatter;
    }

    return colDef;
  })
];

// fake data
const data = Array.from(symbols.data).map((item, id) => ({
  ...item,
  tradeTime: item.raw.tradeTime * 1000,
  priceChange: item.raw.priceChange,
  percentChange: item.raw.percentChange,
  volume: item.raw.volume,
  id: item.symbol
}));
dv.setItems([]);
// console.log(data, Array.isArray(data));

// filter renderer is a react component
class Filter extends React.Component {
  handleChange = ({target}) => {
    const value = target.value.trim();
    if (value.length) {
      this.props.columnFilters[this.props.columnId] = value;
    } else {
      delete this.props.columnFilters[this.props.columnId];
    }

    this.props.dv.refresh();
  };

  render() {
    return (
      <input
        defaultValue={this.props.columnFilters[this.props.columnId]}
        type="text"
        className="editor-text"
        onChange={this.handleChange}
      />
    );
  }
}

// main!
class SNP extends React.Component {
  state = {
    height: '100%',
    width: '100%'
  };

  rates = Object.keys(rates);

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.height !== prevState.height || this.state.width !== prevState.width){
      this.gridInstance.resizeCanvas();
    }
  }

  static contextType = FSBLoader;

  componentDidMount() {
    this.FSBL = this.context;
    const grid = (this.gridInstance = new Grid(
      this.grid,
      dv,
      columns,
      options
    ));

    this.rootnode = this.grid.parentNode.parentNode;

    this.sizer = new ResizeObserver(entities => {
      const {height, width} = entities[0].contentRect;
      this.setState({
        width,
        height
      })
    });

    this.sizer.observe(this.rootnode);

    grid.onHeaderRowCellRendered.subscribe((e, {node, column}) => {
      ReactDOM.render(
        <Filter columnId={column.id} columnFilters={columnFilters} dv={dv} />,
        node
      );
      node.classList.add('slick-editable');
    });

    grid.onSort.subscribe(function(e, args) {
      const {comparer} = args.sortCol;

      // Delegate the sorting to DataView.
      // This will fire the change events and update the grid.

      dv.sort((a, b) => comparer(a, b, args), args.sortAsc);
    });

    dv.onRowCountChanged.subscribe(() => {
      grid.updateRowCount();
      grid.render();
    });

    grid.onBeforeEditCell.subscribe((e, {item}) => {
      this.setState({editing: item});
    });

    grid.onBeforeCellEditorDestroy.subscribe(() =>
      this.setState({editing: null})
    );

    grid.onCellChange.subscribe((e, {item}) => {
      dv.updateItem(item.id, item);
    });

    grid.onActiveCellChanged.subscribe((e, {row}) => {
      // this.registerInterest(dv.getItem(row));
    });

    dv.onRowsChanged.subscribe((e, {rows}) => {
      grid.invalidateRows(rows);
      grid.render();
    });

    grid.onClick.subscribe((e, {row, column}) => {
      if (e.target.classList.contains('intent-bookmark')) {
        this.bookmark(row);
      }

      if (!e.target.classList.contains('intent-viewChart')) return;
      const cell = grid.getCellFromEvent(e);
      if (grid.getColumns()[cell.cell].id == 'symbol') {
        const {symbol} = dv.getItem(row);

        if (!window.FSBL) return;
        window.FSBL.Clients.LauncherClient.getComponentsThatCanReceiveDataTypes(
          {dataTypes: 'Chart'},
          (_, response) => {
            console.log(response);
          }
        );
        window.FSBL.Clients.LauncherClient.showWindow(
          {
            windowName: `${symbol}`,
            componentType: 'Chart'
          },
          {
            spawnIfNotFound: true,
            dockOnSpawn: true,
            name: symbol,
            url: `https://uk.tradingview.com/chart/?symbol=${symbol}`
          }
        );
      }
    });

    dv.setItems(data);
    grid.init();

    // this.mutate();
    this.grid = grid;

    window.addEventListener('resize', this.handleResize);
    this.setFSBL();
  }

  bookmark = row => {
    const item = dv.getItem(row);
    item.fav = item.fav ? false : true;
    dv.updateItem(item.id, item);
    this.gridInstance.invalidateRow(row);
    this.gridInstance.render();

    if (!window.FSBL) return;

    window.FSBL.Clients.LinkerClient.publish({
      dataType: 'addToWatchlist',
      data: {id: item.symbol, fav: item.fav}
    });

    alert('event sent');
  };

  setFSBL = () => {
    if (!window.FSBL) return;
    // cant message before ready is fired across the apps.
    window.FSBL.Clients.LinkerClient.subscribe(
      'addToWatchlist',
      (payload, envelope) => {
        alert(window.FSBL.Clients.RouterClient.getClientName());
        if (envelope.originatedHere()) return;

        if (payload.id) {
          const item = dv.getItemById(payload.id);
          item.fav = payload.fav;
          dv.updateItem(item.id, item);
          dv.refresh();
        }
      }
    );
  };

  componentWillUnmount() {
    clearTimeout(this._timer);
    this.grid.destroy();
    window.removeEventListener('resize', this.handleResize);
  }

  render() {
    return (
      <div style={{height: this.state.height}} className={'resizer'}>
        <div
          className="slickgrid-container mygrid"
          ref={grid => (this.grid = grid)}
        />
      </div>
    );
  }
}

export default SNP;
