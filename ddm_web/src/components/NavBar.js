/*
   Copyright (c) 2018, Autonomous Networks Research Group. All rights reserved.
   Read license file in main directory for more details
*/

import { Icon, Menu } from "antd";
import React, { Component } from "react";
import { Link } from "react-router-dom";

class NavBar extends Component {
  render() {
    return (
      <div>
        <Menu defaultSelectedKeys={["1"]} mode="vertical-left">
          <Menu.Item key="1" className="menu-button">
            <Icon type="home" />
            <span>Home</span>
            <Link to="/" />
          </Menu.Item>

          <Menu.Item key="2" className="menu-button">
            <Icon type="login" />
            <span>Register Product</span>
            <Link to="/register" />
          </Menu.Item>
          <Menu.Item key="4" className="menu-button">
            <Icon type="login" />
            <span>Register (New)</span>
            <Link to="/register-new" />
          </Menu.Item>

          <Menu.Item key="3" className="menu-button">
            <Icon type="search" />
            <span>Search</span>
            <Link to="/search" />
          </Menu.Item>
          <Menu.Item key="5" className="menu-button">
            <Icon type="search" />
            <span>Search (New)</span>
            <Link to="/search-new" />
          </Menu.Item>
        </Menu>
      </div>
    );
  }
}

export default NavBar;
