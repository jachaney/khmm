import React from 'react';
import { Accounts } from 'meteor/accounts-base';
import createHistory from 'history/createBrowserHistory';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import moment from 'moment';

import { TaskList } from './../api/methods';
import { UserInfoDB } from './../api/methods';

import Banner from './Banner';
import Login from './Login';
import Logout from './Logout';

const history = createHistory();

export default class Mgmt extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstname: "",
      lastname: "",
      itemVisible: true,
      menuStatus: false,
      completedTasks: [],
      createUserModalIsOpen: false,
      tasks: [],
      currentUser: [],
      users: [],
      showAssignTaskModal: false,
      showInviteUserModal: false,
      showUserProfileModal: false,
    }
  };

  componentDidMount() {
    document.getElementById('content').style.display = "none";
    this.infoTracker = Tracker.autorun(() => {
      let noUserFound = localStorage.getItem('noUserFound');
      let taskSub = Meteor.subscribe('tasks');
      const tasks = TaskList.find().fetch();
      this.setState ({ tasks });
      let userSub = Meteor.subscribe('users');
      const users = UserInfoDB.find({}, {sort: {lastname: 1}}).fetch();
      this.setState({ users });
      const currentUser = UserInfoDB.find({userId: Meteor.userId()}).fetch();
      this.setState({ currentUser })
      this.state.currentUser.map((currentUser) => {
        if (!currentUser.isAdmin) {
          this.refs.createANewTask.style.display = "none";
          this.refs.createANewUser.style.display = "none";
          this.refs.inviteAUser.style.display = "none";
          this.refs.upcomingTasks.style.display = "none";
          this.refs.completedTasks.style.display = "none";
          this.refs.workNeeded.style.display = "none";
          this.refs.assignedTasks.className = "pure-u-1 item__middle";
        }
        if(!!currentUser.newPrimeId) {
          let yes = confirm("You have been invited to join " + currentUser.inviter + "'s domain.");
          if (yes == true) {
            let newPrimeId = currentUser.newPrimeId;
            let willBeAdmin = currentUser.willBeAdmin;
            Meteor.call('user.invite.accept', newPrimeId, willBeAdmin);
            location.reload();
          } else {
            Meteor.call('user.invite.reject');
          }
        }
      });
      if (taskSub.ready() && userSub.ready()) {
        document.getElementById('loader').style.display = "none";
        document.getElementById('content').style.display = "block";
        document.getElementById('completedFrom').value = moment().startOf('year').format('YYYY-MM-DD');
        document.getElementById('completedTo').value = moment().format('YYYY-MM-DD');
      }
      this.state.tasks.map((task) => {
        let completedFromObj = document.getElementById('completedFrom').value;
        let completedToObj = document.getElementById('completedTo').value;
        let completedFrom = moment(completedFromObj).format('YYYY-MM-DD');
        let completedTo = moment(completedToObj).add(1,'d').format('YYYY-MM-DD');
        let sortedTasks = moment(task.completedOn).format('YYYY-MM-DD');
        const completedTasks = TaskList.find({completed: true, completedOn: {$gte: completedFrom, $lte: completedTo}},{sort:{completedOn: 1}}).fetch();
        this.setState ({ completedTasks });
      })
    });
  }

  componentWillUnmount() {
    this.infoTracker.stop();
  }

  goUserProf() {
    history.push('/userinfo');
    history.go();
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
      isAdmin = "";
    }
    Meteor.call('user.create', email, password, isAdmin, firstname, lastname);
    alert("User created")
    this.refs.createUserModal.style.display = "none";
  }

  createUserModal(e) {
    e.preventDefault();
    this.setState({createUserModalIsOpen: true});
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("sidenav-button").style.left = "0";
    this.setState({menuStatus: ""})
    document.getElementById("sidenav-button-icon").className = "mbri-menu";
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

  renderOptions(i) {
    return this.state.users.map((user) => {
      return <option key={user._id}
        value={user.userId}
        >{user.lastname} , {user.firstname}</option>
    });
  }

  renderUpcomingTasks() {
    return this.state.tasks.map((task) => {
      return this.state.currentUser.map((currentUser) => {
        let taskDiv = `task-div`;
        let findYellowTask = moment(task.dueDate).subtract(15, 'days');
        let yellowTask = findYellowTask.format("YYYY-MM-DD");
        if (moment().isAfter(task.dueDate)) {
          taskDiv = `task-div task-pastdue`;
        } else if (moment().isAfter(yellowTask) && moment().isBefore(task.dueDate) ) {
          taskDiv = `task-div task-comingdue`;
        }
        if (!task.assignedId && !!currentUser.isAdmin && !task.review && !task.completed) {
          return <div key={task._id} ref={task._id} className={taskDiv}
            style={{display: currentUser.isAdmin ? 'block' : 'none'}}>
            <div onClick={() => {
              localStorage.setItem("selectedTaskId", task.formId);
              history.push(`/${task.formId}`);
              history.go();
            }}>
              <p className="task-header-upcoming">{moment(task.dueDate).format('dddd, MMM Do YYYY')}</p>
              <h3 className="task-info">
                {task.subTask}
              </h3>
              <p className="task-info">
                {task.taskName}
              </p>
            </div>
            <button className="button-upcomingTask" ref="assignTaskButton"
              title="Assign Task"
              onClick={(e) => {
                e.preventDefault();
                localStorage.setItem("selectedTaskId", task._id);
                this.setState({showAssignTaskModal: true});
              }}
              >Assign Task</button>
            <button className="button__green" ref="editTaskButton"
              title="Edit Task"
              onClick={(e) => {
                e.preventDefault();
                localStorage.setItem("formId", task.formId);
                history.push(`/edit_${task.formId}`);
                history.go();
              }}>Edit Task</button>
            <button className="button__red" ref="delTaskButton"
              title="Delete Task"
              onClick={(e) => {
                e.preventDefault();
                localStorage.setItem("selectedTaskId", task.formId);
                this.refs.delTaskModal.style.display = "block";
            }}>Delete Task</button>
            {/* Delete Task modal div starts here. */}
            <div ref="delTaskModal" className="modal-assignTask">
              <div className="modal-content">
                <span className="mbri-trash modal_usericon"/>
                <h2 ref="delTaskLabel" className="modal_text">Are you sure that you want to delete this task?</h2>
                <form>
                  <div>
                    <button className="button__red"
                      onClick={(e) => {
                        e.preventDefault();
                        let formId = localStorage.getItem('selectedTaskId');
                        Meteor.call('task.remove', formId);
                        this.refs.delTaskModal.style.display = "none";
                      }}>
                        Yes
                    </button>
                    <button className="button__red"
                      onClick={(e) => {
                        e.preventDefault();
                        this.refs.delTaskModal.style.display = "none";
                      }}>
                        No
                    </button>
                  </div>
                </form>
              </div>
            </div>
            {/* Delete Task Modal ends here */}
          </div>
        };
      })
    });
  }

  renderAssignedTasks() {
    return this.state.tasks.map((task) => {
      return this.state.currentUser.map((currentUser) => {
        let taskDiv = `task-div`;
        let findYellowTask = moment(task.dueDate).subtract(15, 'days');
        let yellowTask = findYellowTask.format("YYYY-MM-DD");
        if (moment().isAfter(task.dueDate)) {
          taskDiv = `task-div task-pastdue`;
        } else if (moment().isAfter(yellowTask) && moment().isBefore(task.dueDate) ) {
          taskDiv = `task-div task-comingdue`;
        }
        if (!!currentUser.isAdmin && !!task.assignedId && !task.completed) {
          return <div key={task._id} className={taskDiv}
            style={{display: currentUser.isAdmin ? 'block' : 'none'}}>
            <div onClick={() => {
              localStorage.setItem("selectedTaskId", task.formId);
              history.push(`/${task.formId}`);
              history.go();
            }}>
            <p className="task-header-assigned">{moment(task.dueDate).format('dddd, MMM Do YYYY')}</p>
            <h3 className="task-info">{task.subTask}</h3>
            <p className="task-info">{task.taskName}</p>
            <p className="task-info">Assigned to: {task.firstname} {task.lastname}</p>
            <p className="task-info">Assigned on: {moment(task.assignedOn).format('dddd, MMM Do YYYY')}</p>
          </div>
            <button className="button-assignedTask" onClick={(e) => {
              let taskId = task._id;
              let firstname = "";
              let lastname = "";
              let assignedId = "";
              let assignedOn = "";
              Meteor.call('task.assign', taskId, assignedId, firstname, lastname, assignedOn);
            }}>Unassign Task</button>
          </div>
        } else if (task.assignedId === currentUser.userId && !task.completed) {
          return <div key={task._id} className={taskDiv}>
            <div onClick={() => {
              localStorage.setItem("selectedTaskId", task.formId);
              history.push(`/${task.formId}`);
              history.go();
            }}>
              <p className="task-header-assigned">{moment(task.dueDate).format('dddd, MMM Do YYYY')}</p>
              <h3 className="task-info">{task.subTask}</h3>
              <p className="task-info">{task.taskName}</p>
            </div>
          </div>
        };
      })
    });
  }

  renderWorkNeeded() {
    return this.state.tasks.map((task) => {
      return this.state.currentUser.map((currentUser) => {
        let taskDiv = `task-div`;
        let findYellowTask = moment(task.dueDate).subtract(15, 'days');
        let yellowTask = findYellowTask.format("YYYY-MM-DD");
        if (moment().isAfter(task.dueDate)) {
          taskDiv = `task-div task-pastdue`;
        } else if (moment().isAfter(yellowTask) && moment().isBefore(task.dueDate) ) {
          taskDiv = `task-div task-comingdue`;
        }
        if (!task.assignedId && !!currentUser.isAdmin && !!task.review && !task.completed) {
          return <div key={task._id} ref={task._id} className={taskDiv}
            style={{display: currentUser.isAdmin ? 'block' : 'none'}}>
            <div onClick={() => {
              localStorage.setItem("selectedTaskId", task.formId);
              history.push(`/${task.formId}`);
              history.go();
            }}>
              <p className="task-header-workneeded">{moment(task.dueDate).format('dddd, MMM Do YYYY')}</p>
              <h3 className="task-info">
                {task.subTask}
              </h3>
              <p className="task-info">
                {task.taskName}
              </p>
            </div>
            <button className="button__yellow" ref="assignTaskButton"
              title="Assign Task"
              onClick={(e) => {
                e.preventDefault();
                localStorage.setItem("selectedTaskId", task._id);
                this.setState({showAssignTaskModal: true});
            }}>Assign Task</button>
          </div>
        };
      })
    });
  }

  renderCompletedTasks() {
    return this.state.completedTasks.map((completedTask) => {
      return this.state.currentUser.map((currentUser) => {
        if (!!currentUser.isAdmin) {
          return <div key={completedTask._id} ref={completedTask._id} className="task-div"
            style={{display: currentUser.isAdmin ? 'block' : 'none'}}>
            <div onClick={() => {
              localStorage.setItem("selectedTaskId", completedTask.formId);
              history.push(`/${completedTask.formId}`);
              history.go();
            }}>
              <p className="task-header-completed">{moment(completedTask.completedOn).format('dddd, MMM Do YYYY')}</p>
              <h3 className="task-info">
                {completedTask.subTask}
              </h3>
              <p className="task-info">
                {completedTask.taskName}
              </p>
              <p className="task-info">
                {completedTask.completedDate}
              </p>
            </div>
          </div>
        };
      })
    });
  }
//End Task Rendering
//Begin Modal Section
  renderAssignedTaskModal() {
    return <div ref="assignTaskModal" className="modal-assignTask"
      style={{display: this.state.showAssignTaskModal ? 'block' : 'none'}}>
      <div className="modal-content">
        <span className="mbri-share modal_usericon"/>
        <h2 ref="assignTaskLabel" className="modal_text">Assign this task to...</h2>
        <form>
          <select id="userSelect" ref="userSelect" onChange={(e) => {
            e.preventDefault();
          }}>
            <option value="">Select a user</option>
            {this.renderOptions()}
          </select>
          <div>
            <button className="button__green"
              onClick={(e) => {
                e.preventDefault();
                let taskId = localStorage.getItem('selectedTaskId');
                let opt = this.refs.userSelect.options[this.refs.userSelect.selectedIndex];
                let res = opt.text.split(" , ");
                let firstname = res[1];
                let lastname = res[0];
                let assignedOn = new Date();
                let assignedId = this.refs.userSelect.value;
                Meteor.call('task.assign', taskId, assignedId, firstname, lastname, assignedOn);
                this.setState({showAssignTaskModal: false});
              }}>
                Assign Task
            </button>
            <button className="button__red"
              onClick={(e) => {
                e.preventDefault();
                this.setState({showAssignTaskModal: false});
              }}>
                Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  }

  renderInviteUserModal() {
    return this.state.currentUser.map((currentUser) => {
      return <div key={currentUser._id} ref="inviteUserModal" className="modal-assignTask"
        style={{display: this.state.showInviteUserModal ? 'block' : 'none'}}>
        <div className="modal-content">
          <span className="mbri-paper-plane modal_usericon"/>
          <h2 ref="iniviteModalLabel" className="modal_text">Invite someone to your domain</h2>
            <div>
              <input className="modal_text" id="inviteeWillBeAdmin" type="checkbox" value="true"/>
              <label className="modal_text">Check this box if this user will be an administrator.</label>
            </div>
            <div>
              <input className="modal_text modal_input" id="inviteEmail" type="email"
                placeholder="Please enter the user's e-mail address"/>
              <input className="modal_text modal_input" id="confirmInviteEmail"
                type="email" placeholder="Please confirm the user's e-mail address"/>
            </div>
            <div>
              <button className="button__green"
                onClick={(e) => {
                  let a = document.getElementById("inviteEmail").value;
                  let b = document.getElementById("confirmInviteEmail").value;
                  if (a === b) {
                    e.preventDefault();
                    let invitee = document.getElementById("inviteEmail").value;
                    let inviter = currentUser.firstname + " " + currentUser.lastname;
                    let newPrimeId = currentUser.primeId;
                    let willBeAdmin = document.getElementById("inviteeWillBeAdmin").checked;
                    Meteor.call('user.verify', invitee, function(err, userVerified) {
                      if (!userVerified) {
                        alert("User not found");
                      } else {
                        Meteor.call('user.invite', invitee, inviter, newPrimeId, willBeAdmin);
                        this.setState({showInviteUserModal: false});
                        document.getElementById("inviteEmail").value = "";
                        document.getElementById("confirmInviteEmail").value = "";
                        document.getElementById("inviteeWillBeAdmin").checked = false;
                      }
                    }.bind(this));
                  } else {
                    e.preventDefault();
                    alert("E-mail addresses do not match.");
                  }
                }}>
                  Send
              </button>
              <button className="button__red"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("inviteEmail").value = '';
                  document.getElementById("confirmInviteEmail").value = '';
                  document.getElementById("inviteeWillBeAdmin").checked = false;
                  this.setState({showInviteUserModal: false});
                }}>
                  Cancel
              </button>
            </div>
        </div>
      </div>
    })
  }

  renderUserProfileModal() {
    return this.state.currentUser.map((currentUser) => {
      return <div key={currentUser._id} ref="inviteUserModal" className="modal-assignTask"
        style={{display: this.state.showUserProfileModal ? 'block' : 'none'}}>
        <div className="modal-content">
          <span className="mbri-users modal_usericon"/>
          <h2 ref="userProfileModalLabel" className="modal_text">User Profile</h2>
            <div>
              <input className="modal_text modal_input" id="userProfileFirstName" type="text"
                placeholder="Please enter your first name"/>
              <input className="modal_text modal_input" id="userProfileLastName"
                type="text" placeholder="Please enter your last name"/>
            </div>
            <div>
              <button className="button__green"
                onClick={(e) => {
                  let a = document.getElementById("inviteEmail").value;
                  let b = document.getElementById("confirmInviteEmail").value;
                  if (a === b) {
                    e.preventDefault();
                    let invitee = document.getElementById("inviteEmail").value;
                    let inviter = currentUser.firstname + " " + currentUser.lastname;
                    let newPrimeId = currentUser.primeId;
                    let willBeAdmin = document.getElementById("inviteeWillBeAdmin").checked;
                    Meteor.call('user.verify', invitee, function(err, userVerified) {
                      if (!userVerified) {
                        alert("User not found");
                      } else {
                        Meteor.call('user.invite', invitee, inviter, newPrimeId, willBeAdmin);
                        this.setState({showInviteUserModal: false});
                        document.getElementById("inviteEmail").value = "";
                        document.getElementById("confirmInviteEmail").value = "";
                        document.getElementById("inviteeWillBeAdmin").checked = false;
                      }
                    }.bind(this));
                  } else {
                    e.preventDefault();
                    alert("E-mail addresses do not match.");
                  }
                }}>
                  Send
              </button>
              <button className="button__red"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("inviteEmail").value = '';
                  document.getElementById("confirmInviteEmail").value = '';
                  document.getElementById("inviteeWillBeAdmin").checked = false;
                  this.setState({showInviteUserModal: false});
                }}>
                  Cancel
              </button>
            </div>
        </div>
      </div>
    })
  }
//End Modal Section
  render () {
    return (
      <div className="wrapper" id="overLord">
        {this.renderAssignedTaskModal()}
        {this.renderInviteUserModal()}
        {this.renderUserProfileModal()}
        <div id="loader" className="loader"></div>
        <div id="content">
          {/* Sidenav starts here */}
          <div>
            <div id="mySidenav" className="sidenav">
              <a ref="myProfile" onClick={() => {
                  history.push('/userinfo');
                  history.go();
                }}>
                My Profile
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
              <a ref="inviteAUser" onClick={() => {
                  document.getElementById("mySidenav").style.width = "0";
                  document.getElementById("sidenav-button").style.left = "0";
                  this.setState({menuStatus: ""})
                  document.getElementById("sidenav-button-icon").className = "mbri-menu";
                  this.setState({showInviteUserModal: true});
                }
              }>
                Invite a User
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
                  <label className="modal_text">Check this box if the user will be an administrator</label>
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
            <Banner title="Kingdom Hall Maintenance Manager"
            image = "/images/maintenance.svg"/>
          </div>
          <div className="pure-g">
            <div ref="upcomingTasks" className="pure-u-1 pure-u-sm-1-4 item__left">
              <div className="item--padding">
                <h3 className="item--border item--padding item--left--label">
                  <span className="mbri-clock"></span>
                  <p>Upcoming Tasks</p>
                </h3>
                {this.renderUpcomingTasks()}
              </div>
            </div>
            <div ref="assignedTasks" className="pure-u-1 pure-u-sm-1-4 item__middle">
              <div className="item--padding">
                <h3 className="item--border item--padding item--middle--color">
                  <span className="mbri-share item-icon"></span>
                  <p>Assigned Tasks</p>
                </h3>
                {this.renderAssignedTasks()}
              </div>
            </div>
            <div ref="workNeeded" className="pure-u-1 pure-u-sm-1-4 item__middle">
              <div className="item--padding">
                <h3 className="item--border item--padding item-needs-work-label">
                  <span className="mbri-flag item-icon"></span>
                  <p>Additional Work Needed</p>
                </h3>
                {this.renderWorkNeeded()}
              </div>
            </div>
            <div ref="completedTasks" className="pure-u-1 pure-u-sm-1-4 item-completed-tasks">
              <div className="item--padding">
                <div className="item--border item-completed-tasks item-completed-color pure-u-1">
                  <h3 className="item-completed-banner item--padding item--right--color">
                    <span className="mbri-like"></span>
                    <p>Completed Tasks</p>
                  </h3>
                  <div className="item-completed-label pure-u-1-2">
                    <label>Show Tasks From:</label>
                  </div>
                  <div className="pure-u-1-2">
                    <input type="date" id="completedFrom"
                      className="item-completed-datepicker" ref="completedFrom"
                      onChange={() => {
                        let completedFrom = this.refs.completedFrom.value;
                        let completedTo = this.refs.completedTo.value;
                        const completedTasks = TaskList.find({completed: true, completedOn: {$gte: completedFrom, $lte: completedTo}},{sort:{completedOn: 1}}).fetch();
                        this.setState ({ completedTasks });
                      }}/>
                  </div>
                  <br/>
                  <div className="item-completed-label pure-u-1-2">
                    <label>Show Tasks To:</label>
                  </div>
                  <div className="pure-u-1-2">
                    <input type="date" id="completedTo" ref="completedTo"
                      className="item-completed-datepicker"
                      onChange={() => {
                        let completedFrom = this.refs.completedFrom.value;
                        let completedTo = this.refs.completedTo.value;
                        const completedTasks = TaskList.find({completed: true, completedOn: {$gte: completedFrom, $lte: completedTo}},{sort:{completedOn: 1}}).fetch();
                        this.setState ({ completedTasks });
                      }}/>
                    </div>
                </div>
                {this.renderCompletedTasks()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
