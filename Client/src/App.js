import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { withRouter } from "react-router";
import Header from './components/Header';
import Home from './pages/Home';

const HomePage = withRouter(Home);

class App extends Component {
    render() {
        return (         
            <div className={'page-container'}>
                <Home {...this.props} />} />
            </div>     
        );
    }
}

export default App;
