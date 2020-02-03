import React, { useState, useEffect } from "react";
import "./App.css";

const Context = React.createContext({clients: []});
export { Context };

const Store = ({ children }) => {
  const [state, setState] = useState({clients: []});
  useEffect(() => {
    if (window.FSBL) {
      window.FSBL.Clients.LinkerClient.subscribe("counterparty", payload => {
        if (payload.counterparty) {
          setState(old => ({ ...old, counterparty: payload.counterparty }));
        }
        if (payload.currency) {
          setState(old => ({ ...old, currency: payload.currency }));
        }
      });

      window.FSBL.Clients.LinkerClient.subscribe("SOTW", payload => {
        setState(old => ({ ...old, clients: payload }));
      });
    }
  }, []);

  return <Context.Provider value={state}>{children}</Context.Provider>;
};

export default Store;
