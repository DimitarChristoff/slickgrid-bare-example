import * as React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import Orders from './App';
import SNP from './SNP';
import * as serviceWorker from './serviceWorker';
import {Helmet} from 'react-helmet';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import FSBLoader from './components/FSBLoader';

function generateUID() {
  // I generate the UID from two parts here
  // to ensure the random number provide enough bits.
  let firstPart = (Math.random() * 46656) | 0;
  let secondPart = (Math.random() * 46656) | 0;
  firstPart = ('000' + firstPart.toString(36)).slice(-3);
  secondPart = ('000' + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
}

ReactDOM.render(
  <FSBLoader>
    <Router basename={'slickgrid-bare-example'}>
      <Switch>
        <Route path={'/components/snp'}>
          <Helmet>
            <title>SNP 500 viewer</title>
          </Helmet>
          <SNP />
        </Route>
        <Route path={'/components/orders'}>
          <Helmet>
            <title>Order Book</title>
          </Helmet>
          <Orders />
        </Route>
        <Route exact path="/">
          <div className="tile is-parent is-vertical">
            <div className="tile is-child">
              <Orders />
            </div>
            <div className="tile is-child">
              <SNP />
            </div>
          </div>
        </Route>
      </Switch>
    </Router>
  </FSBLoader>,

  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
