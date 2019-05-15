import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import EntityManager from './EntityManager';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import './style/index.scss';

window.EM = new EntityManager();
(async function(){
    ReactDOM.render(<App />, document.getElementById('root'));
})();
