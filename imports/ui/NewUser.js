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
    constructor(props) {
      super(props);
      this.state = {
        error: ''
      };
    }

    componentDidMount() {
      this.newTracker = Tracker.autorun(() => {
        console.log('NewUser loaded');
      });
    };

    componentWillUnmount() {
      this.newTracker.stop();
      console.log('NewUser unloaded');
    };

    backLogin() {
      this.props.history.push('/');
    };

    onSubmit(e) {
      e.preventDefault();
      let email = this.refs.email.value.trim();
      let password = this.refs.password.value.trim();
      let cong = this.refs.cong.value.trim();
      let firstname = this.refs.firstname.value.trim();
      let lastname = this.refs.lastname.value.trim();

      if (!email) {
        return (alert('Please enter a valid e-mail address.'));
      } else if (password.length < 8) {
        return (alert('Your password must be at least 8 characters.'));
      } else if (!firstname) {
        return (alert("Please enter your first name."));
      } else if (!lastname) {
        return (alert("Please enter your last name."))
      } else if (!cong) {
        return (alert("Please enter the name of your congregation."));
      }
      let newId = Accounts.createUser({
          email,
          password,
          profile: {
            isAdmin: true,
            primeId: cong
          }
        }, (err) => {
        if (err) {
          return (alert(err.reason));
        } else {
          Meteor.call('userinfo.insert', email, firstname, lastname, cong);
          this.props.history.push('/mgmt');
          this.props.history.go();
        };
      });
    };

    render() {
      return (
        <div className="wrapper">
          <div>
            <Banner title="Create a new Kingdom Hall Maintenance account"
            image="/images/userprofile.svg"/>
          </div>
          <form className="pure-g" onSubmit={this.onSubmit.bind(this)} noValidate>
              <div className="pure-u-1 item__middle">
                <input className="item--textbox" type="email" ref="email"
                  name="email" placeholder="Please enter your e-mail address"/>
              </div>
              <div className="pure-u-1 item__middle">
                <input className="item--textbox" type="password" ref="password"
                  name="password" placeholder="Please enter a password"/>
              </div>
              <div className="pure-u-1 item__middle">
                <input className="item--textbox" ref="firstname"
                  name="firstname" placeholder="Please enter your first name"/>
              </div>
              <div className="pure-u-1 item__middle">
                <input className="item--textbox" ref="lastname"
                  name="lastname" placeholder="Please enter your last name"/>
              </div>
              <div className="pure-u-1 item__middle">
                <input className="item--textbox" ref="cong"
                  name="cong" placeholder="Please enter your congregation number"/>
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
};
