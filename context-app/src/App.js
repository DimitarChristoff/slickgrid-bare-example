import React from "react";
import { Context } from "./Store";
import "./App.css";

const App = () => {
  const handleClientChange = e => {
    window.FSBL.Clients.LinkerClient.publish({
      dataType: "counterparty",
      data: { counterparty: e.target.value }
    });
  };
  return (
    <Context.Consumer>
      {({ counterparty, clients }) => (
        <div className="card" style={{ flex: 1, height: "100%" }}>
          <header className="card-header">
            <p className="card-header-title">
              <div className="select">
                {clients.length !== 0 && (
                  <select onChange={handleClientChange} value={counterparty}>
                    {clients.map(client => (
                      <option value={client}>{client}</option>
                    ))}
                  </select>
                )}
              </div>
            </p>
            <a href="#" className="card-header-icon" aria-label="more options">
              <span className="icon">
                <i className="fas fa-angle-down" aria-hidden="true" />
              </span>
            </a>
          </header>
          <div className="card-content" style={{ flex: 1 }}>
            <div className="content" style={{ flex: 1 }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
              nec iaculis mauris.
              <a href="#">@bulmaio</a>. <a href="#">#css</a>{" "}
              <a href="#">#responsive</a>
              <br />
              <time dateTime="2016-1-1">11:09 PM - 1 Jan 2016</time>
            </div>
          </div>
          <footer className="card-footer">
            <a className="card-footer-item">Save</a>
          </footer>
        </div>
      )}
    </Context.Consumer>
  );
};

export default App;
