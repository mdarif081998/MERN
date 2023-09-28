import React, { useContext } from "react";
import { NavLink } from "react-router-dom";

import { AuthContext } from "../../context/auth-context";
import './NavLinks.css';
import Button from "../FormElements/Button";

const NavLinks = props => {
    const auth = useContext(AuthContext);
    return <ul className="nav-links">
        <li>
            <NavLink to="/" exact>ALL USERS</NavLink>
        </li>
        {auth.isLoggedIn && <li>
            <NavLink to={`/${auth.userId}/places`} >MY PLACES</NavLink>
        </li>}
        {auth.isLoggedIn && <li>
            <NavLink to="/places/new">ADD PLACE</NavLink>
        </li>}
        {!auth.isLoggedIn && <li>
            <NavLink to="/auth">LOGIN</NavLink>
        </li>}
        {auth.isLoggedIn && <li>
            <Button onClick={auth.logout} >LOGOUT</Button>
        </li>}
    </ul>
}

export default  NavLinks;