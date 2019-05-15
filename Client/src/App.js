import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { withRouter } from "react-router";
import Header from './components/Header';
import Home from './pages/Home';

const HeaderComp = withRouter(Header);
const HomePage = withRouter(Home);

class App extends Component {
    render() {
        return (         
            <BrowserRouter key="router">  
                <div className={'page-container'}>
                    <Switch>
                        <Route exact path={'/'} render={() => <HomePage {...this.props} />} />
                    </Switch>  
                </div>
            </BrowserRouter>         
        );
    }
}

export default App;
