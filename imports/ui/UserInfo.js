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
  }

  componentDidMount() {
    document.getElementById('content').style.display = "none";
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
  }

  componentWillUnmount() {
    this.userTracker.stop();
  }

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
  }

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
  }

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
      document.getElementById("sidenav-button-icon").className = "mbri-close mbri-close-white";
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

  showContent() {
    setTimeout(function() {
      document.getElementById('userInfoLoader').style.display = "none";
      document.getElementById('content').style.display = "block";
    }, 1500);
  }

  onCreateUser(e) {
    e.preventDefault();
    let email = this.refs.email.value.trim();
    let password = this.refs.password.value.trim();
    let firstname = this.refs.firstName.value.trim();
    let lastname = this.refs.lastName.value.trim();
    let isAdmin = Boolean;
    let b = document.getElementById('isAdminCheck');
    if (!email) {
      return (alert("Please enter a valid e-mail address"));
    } else if (password.length < 8) {
      return (alert("Your password must be at least 8 characters."));
    } else if (!firstname) {
      return (alert("Please enter the new user's first name."))
    } else if (!lastname) {
      return (alert("Please enter the new user's last name."))
    }
    if (b.checked) {
      isAdmin = true;
    } else {
      isAdmin = false;
    }
    Meteor.call('user.create', email, password, isAdmin, firstname, lastname);
    alert('User created');
    this.refs.createUserModal.style.display = "none";
  }

  render () {
    return(
      <div className="wrapper">
        <div id="userInfoLoader" className="loader"></div>
        <div id="content">
          <div>
            {/* Sidenav starts here */}
            <div id="mySidenav" className="sidenav">
              <a ref="myProfile" onClick={() => {
                  history.push('/mgmt');
                  history.go();
                }}>
                Home
              </a>
              <a ref="createANewTask" onClick={() => {this.props.history.push('/newtask')}}>
                Create a New Task
              </a>
              <a ref="createANewUser" onClick={() => {
                  document.getElementById("mySidenav").style.width = "0";
                  document.getElementById("sidenav-button").style.left = "0";
                  this.setState({menuStatus: ""})
                  document.getElementById("sidenav-button-icon").className = "mbri-menu";
                  this.refs.createUserModal.style.display = "block";
                }
              }>
                Create a New User
              </a>
              <a ref="logout" onClick={this.onLogout.bind(this)}>
                Logout
              </a>
            </div>
            <a id="sidenav-button" title="Menu" className="button__menu" onClick={this.openNav.bind(this)}>
              <span id="sidenav-button-icon" className="mbri-menu"/>
            </a>
          </div>
          {/* Sidenave ends here */}
          {/* Create User Modal starts here */}
          <div ref="createUserModal" className="modal-createUser">
            <div className="modal-content">
              <span className="mbri-users modal_usericon"/>
              <h2 className="modal_text">Add a New User</h2>
              <form onSubmit={this.onCreateUser.bind(this)} noValidate>
                <div>
                  <input className="modal_text" type="checkbox" id="isAdminCheck"/>
                  <label className="modal_text">Check this box if the user is an administrator</label>
                </div>
                <div>
                  <input className="modal_text modal_input" type="email" ref="email"
                    name="email" placeholder="Please enter the new user's e-mail address"/>
                </div>
                <div>
                  <input className="modal_text modal_input" type="password" ref="password"
                    name="password" placeholder="Please enter the new user's password"/>
                </div>
                <div>
                  <input className="modal_text modal_input" type="text" ref="firstName"
                    name="firstName" placeholder="Please enter the new user's first name"/>
                </div>
                <div>
                  <input className="modal_text modal_input" type="text" ref="lastName"
                    name="lastName" placeholder="Please enter the new user's last name"/>
                </div>
                <div>
                  <button className="button__green">Create account</button>
                  <button className="button__red"
                    onClick={(e) => {
                        e.preventDefault();
                        this.refs.createUserModal.style.display = "none"
                      }
                    }>
                      Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
          {/* Create user modal ends here */}
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
              <button  className="button__green" ref="save" id="save"
                name="save" type="submit">
                {this.state.saved ? 'Saved!' : 'Save'}
              </button>
              <button className="button__grey" onClick={this.cancelInfo.bind(this)}
                ref="back_button" id="back_button" name="back_button">
                {this.state.cancStatus ? 'Cancel' : 'Home'}
              </button>
            </div>
          </form>
        </div>
        {this.showContent()}
      </div>
    )
  };
};
