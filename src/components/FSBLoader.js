import React from 'react';

const FS = Boolean(window.FSBL);
const FSBL = FS ? window.FSBL : {};

const FSBLContext = React.createContext({});

class FSBLoader extends React.Component {
  state = {
    hasFSBL: Boolean(window.FSBL),
    readyFSBL: false
  };

  componentWillMount() {
    if (this.state.hasFSBL) {
      window.FSBL.addEventListener('onReady', () => {
        this.setState({readyFSBL: true});
      });
    }
  }

  render() {
    return this.hasFSBL ? (
      !this.readyFSBL ? (
        <FSBL.Provider FSBL={FSBL}>{this.props.children}</FSBL.Provider>
      ) : (
        <div className="icon is-large">
          <i className="fas fa-spinner fa-pulse" />
        </div>
      )
    ) : (
      this.props.children
    );
  }
}

FSBLoader.FSBL = FSBLContext;

export default FSBLoader;
