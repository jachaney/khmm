import { Accounts } from 'meteor/accounts-base';
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
        <form className="pure-g" id="login" onSubmit={this.onSubmit.bind(this)} noValidate>
          <div className="pure-u-1 item__middle item-margin">
            <p>Please enter your e-mail address:</p>
            <input className="item--textbox" type="email" ref="email" name="email"/>
          </div>
          <div className="pure-u-1 item__middle item-margin">
            <p>Please enter your password:</p>
            <input className="item--textbox" type="password" ref="password" name="password"/>
          </div>
          <div className="pure-u-1 item__middle">
            <button className="button__green">
              Login
            </button>
          </div>
        </form>
        <p><Link to="/newuser" title="Sign Up">Create a new Kingdom Hall account</Link></p>
        {/* <a onClick={() => {
          emailAddress = prompt("Please enter your e-mail address");
          if (!!emailAddress) {
            Accounts.forgotPassword({email: emailAddress},(err) => {
              if (err) {
                return alert(err.reason);
              } else {
                return alert("A link to reset your password has been sent to",<br/>,"the e-mail address you provided.");
              }
            })
          }
        }}>I forgot my password</a> */}
      </div>
    );
  };
}
