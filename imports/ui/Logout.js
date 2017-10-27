import React from 'react';
import { Accounts } from 'meteor/accounts-base';
import createHistory from 'history/createBrowserHistory';

const history = createHistory();

export default class Logout extends React.Component {

  onLogout() {
    Accounts.logout();
    setTimeout(function() {
      history.push('/');
      history.go();
    },50);
  };

  render () {
    let logoutButton = "button button__red";
    return (
      <div>
        <button className={logoutButton} onClick={this.onLogout.bind(this)}>
          Logout
        </button>
      </div>
    );
  };
};
