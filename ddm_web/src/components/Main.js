/*
   Copyright (c) 2018, Autonomous Networks Research Group. All rights reserved.
   Read license file in main directory for more details
*/

import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./Home";
import Order from "./Order";
import QueryProduct from "./QueryProduct";
import { QueryProductNew } from "./QueryProductNew";
import { NewRegistrationForm } from "./RegisterFormNew";
import RegistrationForm from "./RegistrationForm";

class Main extends React.Component {
  render() {
    return (
      <div className="main">
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/register" component={RegistrationForm} />
          <Route exact path="/register-new" component={NewRegistrationForm} />
          <Route exact path="/search" component={QueryProduct} />
          <Route exact path="/search-new" component={QueryProductNew} />
          <Route path="/order" component={Order} />
          <Route component={Home} />
        </Switch>
      </div>
    );
  }
}

export default Main;
