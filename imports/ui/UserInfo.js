import React from 'react';
import createHistory from 'history/createBrowserHistory';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

import { UserInfoDB } from '../api/methods';

import Banner from './Banner';

const history = createHistory();

export default class UserInfo extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        cancStatus: false,
        saved: false,
        userinfo: [],
        firstname: String,
        lastname: String,
        menuStatus: ""
      };
  };

  componentDidMount() {
    this.refs.save.disabled = true;
    this.userTracker = Tracker.autorun(() => {
      Meteor.subscribe('userinfo');
      const userinfo = UserInfoDB.find().fetch();
      this.setState ({ userinfo });
      console.log("mapping user database...");
      this.state.userinfo.map((currentUser) => {
        this.setState({firstname: currentUser.firstname});
        this.setState({lastname: currentUser.lastname});
        console.log(this.state.username);
        if (!!this.state.firstname) {
          this.refs.firstname.value = this.state.firstname;
        };
        if (!!this.state.lastname) {
          this.refs.lastname.value = this.state.lastname;
        };
        console.log("all components mounted");
      });
    });
  };

  componentWillUnmount() {
    this.userTracker.stop();
  };

  saveInfo(e) {
    e.preventDefault();
    const firstname = this.refs.firstname.value.trim();
    const lastname = this.refs.lastname.value.trim();
    Meteor.call('userinfo.update', firstname, lastname);
    setTimeout(() => {this.setState({saved: false})}, 2000);
    this.refs.firstname.value = firstname;
    this.refs.lastname.value = lastname;
    this.setState({saved: true});
    this.refs.save.disabled = true;
    this.setState({cancStatus: false});
    this.refs.save.blur();
    };

  cancelInfo() {
      if (this.state.cancStatus === false){
        history.push('/mgmt');
        history.go();
      } else {
        this.refs.firstname.value = this.state.firstname;
        this.refs.lastname.value = this.state.lastname;
        this.setState({cancStatus: false});
        this.refs.save.disabled=true;
        this.refs.back_button.blur();
      };
  };

  saveStatus() {
      const thisFirstNameVal = this.refs.firstname.value;
      const thisLastNameVal = this.refs.lastname.value;
      const stateFirstName = this.state.firstname;
      const stateLastName = this.state.lastname;
      if (thisFirstNameVal === stateFirstName  && thisLastNameVal === stateLastName){
        this.refs.save.disabled = true;
        this.setState ({cancStatus: false});
      } else if (thisFirstNameVal != stateFirstName || thisLastNameVal != stateLastName) {
        this.refs.save.disabled=false;
        this.setState ({cancStatus: true});
        this.setState ({saved: false});
      }
  }

  openNav(e) {
    if (!this.state.menuStatus) {
      e.preventDefault();
      document.getElementById("mySidenav").style.width = "25rem";
      document.getElementById("sidenav-button").style.left = "25rem";
      this.setState({menuStatus: true});
      document.getElementById("sidenav-button-icon").className = "mbri-close";
    } else {
      document.getElementById("mySidenav").style.width = "0";
      document.getElementById("sidenav-button").style.left = "0";
      this.setState({menuStatus: ""})
      document.getElementById("sidenav-button-icon").className = "mbri-menu";
    }
  }

  onLogout() {
    Accounts.logout();
    setTimeout(function() {
      history.push('/');
      history.go();
    },50);
  }

  render () {
    return(
      <div className="wrapper">
        <div>
          <div id="mySidenav" className="sidenav">
            <a onClick={() => {this.props.history.push('/userinfo')}}>
              My Profile
            </a>
            <a onClick={() => {this.props.history.push('/newtask')}}>
              Create a New Task
            </a>
            <a onClick={this.onLogout.bind(this)}>
              Logout
            </a>
          </div>
          <a id="sidenav-button" title="Menu" className="button__menu" onClick={this.openNav.bind(this)}>
            <span id="sidenav-button-icon" className="mbri-menu"/>
          </a>
        </div>
        <div>
          <Banner title="User Profile"
            image="/images/userprofile.svg"/>
        </div>
        <form className="pure-g" onSubmit={this.saveInfo.bind(this)}>
          <div className="pure-u-1 item__middle">
            <p className="item__text">First Name:</p>
            <input className="item--textbox" type="text" ref="firstname"
              name="firstname" id="firstname" placeholder="Please enter your first name"
              onChange={this.saveStatus.bind(this)}/>
          </div>
          <div className="pure-u-1 item__middle">
            <p className="item__text">Last Name:</p>
            <input className="item--textbox" type="text" ref="lastname"
              name="lastname" id="lastname" placeholder="Please enter your last name"
              onChange={this.saveStatus.bind(this)}/>
          </div>
          <div className="pure-u-1 item__middle">
            <button  className="button button--pos" ref="save" id="save"
              name="save" type="submit">
              {this.state.saved ? 'Saved!' : 'Save'}
            </button>
            <button className="button button--pos" onClick={this.cancelInfo.bind(this)}
              ref="back_button" id="back_button" name="back_button">
              {this.state.cancStatus ? 'Cancel' : 'Home'}
            </button>
          </div>
        </form>
      </div>
    )
  };
};
