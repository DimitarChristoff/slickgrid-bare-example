import React from "react";
import { Context } from "./Store";
import "./App.css";

const App = () => {
  const [client, setClient] = React.useState();
  const handleChange = ({ target }) => {
    setClient(target.value);
  };
  const handleFilterChange = counterparty => {
    window.FSBL.Clients.LinkerClient.publish({
      dataType: "filter",
      data: { counterparty: client || counterparty }
    });
  };
  return (
    <Context.Consumer>
      {({ counterparty, id, currency, clients, paymentDate, price, amount }) =>
        counterparty ? (
          <div className="card" style={{ flex: 1, minHeight: "100%", flexDirection: 'column' }}>
            <header className="card-header">
              <p className="card-header-title">
                <div className="select">
                  {clients.length !== 0 && (
                    <select defaultValue={client} onChange={handleChange}>
                      {clients.map(client => (
                        <option value={client}>{client}</option>
                      ))}
                    </select>
                  )}
                </div>
              </p>
              <a
                href="#"
                className="card-header-icon"
                aria-label="more options"
              >
                <span className="icon">
                  <i className="fas fa-angle-down" aria-hidden="true" />
                </span>
              </a>
            </header>
            <div className="card-content" style={{ flex: 1 }}>
              <div className="content">
                <h1 className={"title"}>GBP{currency}</h1>
                <h2 className="subtitle is-5">
                  {amount} @ {price}
                </h2>
                <br />
                <time dateTime={paymentDate} />
              </div>
            </div>
            <footer className="card-footer">
              <a className="card-footer-item">Close</a>
              <a
                onClick={() => handleFilterChange(counterparty)}
                className="card-footer-item"
              >
                Show trades
              </a>
            </footer>
          </div>
        ) : (
          <div className="loader" />
        )
      }
    </Context.Consumer>
  );
};

export default App;
