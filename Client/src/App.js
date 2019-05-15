import React, { Component } from 'react';
import Home from './pages/Home';

class App extends Component {
    render() {
        return (         
            <div className={'page-container'}>
                <Home {...this.props} />
            </div>     
        );
    }
}

export default App;
