import React, { Component } from 'react';
import { NavLink } from "react-router-dom";
import { Navbar, Nav, NavItem } from 'reactstrap';

class Header extends Component {
    render() {
        return (
            <Navbar className="mb-3 justify-content-between" color="dark" dark expand="lg">
                <NavLink className={"navbar-brand " + (this.props.domain ? 'small' : '')} to="/">
                    <h5 className="display">Pike County Regional Democratic Event Calendar</h5>
                </NavLink>
            </Navbar>
        );
    }
}

export default Header;