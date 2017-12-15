import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { browserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import  createHistory  from 'history/createBrowserHistory';
import PropTypes from 'prop-types';
import React from 'react';
import { Tracker } from 'meteor/tracker';

import Banner from './Banner';

const history = createHistory();

export default class NewUser extends React.Component {
  backLogin() {
    this.props.history.push('/');
  }

  onSubmit(e) {
    e.preventDefault();
    let email = this.refs.email.value.trim();
    let password = this.refs.password.value.trim();
    let passwordConfirm = this.refs.passwordConfirm.value.trim();
    let firstname = this.refs.firstname.value.trim();
    let lastname = this.refs.lastname.value.trim();

    if (!email) {
      return (alert('Please enter a valid e-mail address.'));
    } else if (password.length < 8) {
      return (alert('Your password must be at least 8 characters.'));
    } else if (password != passwordConfirm) {
      return (alert('Your passwords do not match.'));
    } else if (!firstname) {
      return (alert("Please enter your first name."));
    } else if (!lastname) {
      return (alert("Please enter your last name."))
    }

    Accounts.createUser({
        email,
        password,
      }, (err) => {
      if (err) {
        return (alert(err.reason));
      } else {
        Meteor.call('userinfo.insert', email, firstname, lastname);
        this.props.history.push('/mgmt');
        this.props.history.go();
      }
    });
  }

  render() {
    return (
      <div className="wrapper">
        <div>
          <Banner title="Create a new Kingdom Hall Maintenance account"
          image="/images/userprofile.svg"/>
        </div>
        <form className="pure-g" onSubmit={this.onSubmit.bind(this)} noValidate>
            <div className="pure-u-1 item__middle item-margin">
              <input className="item--textbox" type="email" ref="email"
                name="email" placeholder="Please enter your e-mail address"/>
            </div>
            <div className="pure-u-1 item__middle item-margin">
              <input className="item--textbox" type="password" ref="password"
                name="password" placeholder="Please enter a password"/>
            </div>
            <div className="pure-u-1 item__middle item-margin">
              <input className="item--textbox" type="password" ref="passwordConfirm"
                name="passwordConfirm" placeholder="Please confirm your password"/>
            </div>
            <div className="pure-u-1 item__middle item-margin">
              <input className="item--textbox" ref="firstname"
                name="firstname" placeholder="Please enter your first name"/>
            </div>
            <div className="pure-u-1 item__middle item-margin">
              <input className="item--textbox" ref="lastname"
                name="lastname" placeholder="Please enter your last name"/>
            </div>
            <div className="pure-u-1 item__middle">
              <button className="button__green">Create account</button>
            </div>
        </form>
        <p>
          <Link to="/" title="Back to Login page">
            Back to Login page
          </Link>
        </p>
      </div>
    );
  };
}
