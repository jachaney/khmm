import React from 'react';
import createHistory from 'history/createBrowserHistory';
import { BrowserRouter as Router, Route, Switch, Link, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Metor } from 'meteor/meteor';

import Mgmt from './Mgmt';
import NewUser from './NewUser';
import Banner from './Banner';

const history = createHistory();

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: ''
    };
  };

  goForward() {
    this.props.history.push('/mgmt');
    this.props.history.go();
  };

  onSubmit(e) {
    e.preventDefault();

      let email = this.refs.email.value.trim();
      let password = this.refs.password.value.trim();

      Meteor.loginWithPassword({email}, password, (err) => {
        console.log('Login callback', err);
        if (err) {
          if (!email) {
            return (alert('Please enter a username.'));
          } else if (!password) {
            return (alert('Please enter a password.'));
          };
            alert (err.reason);
            return this.refs.password.value = "";
        } else {
            this.props.history.push('/mgmt');
            this.props.history.go()
        }
      });
    };

  render() {
    return (
      <div className="wrapper">
        <div>
          <Banner title="Kingdom Hall Maintenance Manager"
          image = "/images/khall.svg"/>
        </div>
        <form className="item-login" id="login" onSubmit={this.onSubmit.bind(this)} noValidate>
          <p className="form">
            <input className="item-input" type="email" ref="email" name="email" placeholder="Please enter your e-mail address"/>
          </p>
          <p className="form">
            <input className="item-input" type="password" ref="password" name="password" placeholder="Please enter your password"/>
          </p>
          <p className="button_center">
            <button className="button__green">
              Login
            </button>
          </p>
        </form>
        <p><Link to="/newuser" title="NewUser">Create a new Kingdom Hall account</Link></p>
      </div>
    );
  };
}
