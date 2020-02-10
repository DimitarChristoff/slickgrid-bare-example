import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import Orders from './App';
import SNP from './SNP';
import * as serviceWorker from './serviceWorker';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

ReactDOM.render(
  <Router>
    <Switch>
      <Route path={'/components/snp'}>
        <SNP />
      </Route>
      <Route path={'/components/orders'}>
        <Orders />
      </Route>
      <Route exact path="/">
        <div className="tile is-parent is-vertical">
          <div className="tile is-child">
            <Orders/>
          </div>
          <div className="tile is-child">
            <SNP/>
          </div>
        </div>
      </Route>
    </Switch>

  </Router>
  , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
