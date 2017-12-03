import { Meteor } from 'meteor/meteor';
import React from 'react';
import { BrowserRouter as Router,
    Route,
    Switch,
    Redirect,
    withRouter,
    Link } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';
import PropTypes from 'prop-types';

import Login from '../ui/Login';
import Mgmt from '../ui/Mgmt';
import NewUser from '../ui/NewUser';
import NotFound from '../ui/NotFound';
import UserInfo from '../ui/UserInfo';
import NewTask from '../ui/NewTask';
import WorkTask from '../ui/Task';
import EditTask from '../ui/EditTask';
import jha from '../ui/JHA';

const history = createHistory();

const unAuthPages = ['/', '/newuser'];
const authPages = ['/mgmt', '/userinfo', '/newtask', '/worktask', '/edittask', '/jha', '/DC-85i.pdf'];
const pathname = location.pathname;
const isUnAuthPage = unAuthPages.includes(pathname);
const isAuthPage = authPages.includes(pathname);
const isAuth = !!Meteor.userId();

  const PublicRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => (
      !isAuth ? (
        <Component {...props}/>
      ) : (
        <Redirect to={{
          pathname: '/mgmt',
          state: { from: props.location }
        }}/>
      )
    )}/>
  );

  const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => (
      isAuth ? (
        <Component {...props}/>
      ) : (
        <Redirect to={{
          pathname: '/login',
          state: { from: props.location }
        }}/>
      )
    )}/>
  );


  export const Routes = (
    <Router history = { history }>
      <Switch>
        <PublicRoute exact path="/" component={ Login }/>
        <PublicRoute exact path="/login" component={ Login }/>
        <PublicRoute exact path="/newuser" component={ NewUser }/>
        <PrivateRoute exact path="/mgmt" component={ Mgmt }/>
        <PrivateRoute exact path="/jha" component={ jha }/>
        <PrivateRoute exact path="/userinfo" component={ UserInfo }/>
        <PrivateRoute exact path="/newtask" component={ NewTask }/>
        <PrivateRoute exact path="/edit_:id" component={ EditTask }/>
        <PrivateRoute exact path="/:id" component={ WorkTask }/>
        <Route component={ NotFound }/>
      </Switch>
    </Router>
  );
