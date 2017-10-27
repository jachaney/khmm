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
import UpcomingTasks from './UpcomingTasks';

const history = createHistory();

export default class Mgmt extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstname: "",
      lastname: "",
      itemVisible: true,
      menuStatus: false,
      createUserModalIsOpen: false,
      tasks: [],
      currentUser: [],
      users: [],
      assignTaskModalIsOpen: false,
    }
  };

  componentDidMount() {
    document.getElementById('content').style.display = "none";
    this.infoTracker = Tracker.autorun(() => {
      Meteor.subscribe('tasks');
      const tasks = TaskList.find().fetch();
      this.setState ({ tasks });
      if (this.state.tasks.length !== 0) {
        this.setState({renderTasks: true});
      }
      Meteor.subscribe('users');
      const users = UserInfoDB.find({}, {sort: {lastname: 1}}).fetch();
      this.setState({ users });
      const currentUser = UserInfoDB.find({userId: Meteor.userId()}).fetch();
      this.setState({ currentUser })
      this.state.currentUser.map((currentUser) => {
        if (!currentUser.isAdmin) {
          this.refs.createANewTask.style.display = "none";
          this.refs.createANewUser.style.display = "none";
          this.refs.upcomingTasks.style.display = "none";
          this.refs.completedTasks.style.display = "none";
          this.refs.workNeeded.style.display = "none";
          this.refs.assignedTasks.className = "pure-u-1 item__middle";
        };
      });
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
      isAdmin = false;
    }
    Meteor.call('user.create', email, password, isAdmin, firstname, lastname);
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
        if (!task.assignedId && !!currentUser.isAdmin && !task.review) {
          return <div key={task._id} ref={task._id} className={taskDiv}>
            <div onClick={() => {
              localStorage.setItem("selectedTaskId", task.formId);
              history.push(`/${task.formId}`);
              history.go();
            }}>
              <p className="task-header-upcoming">{moment(task.dueDate).format('MM-DD-YYYY')}</p>
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
                this.refs.assignTaskModal.style.display = "block";
            }}>Assign Task</button>
            {/* Assign Task modal div starts here. */}
            <div ref="assignTaskModal" className="modal-assignTask">
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
                        this.refs.assignTaskModal.style.display = "none";
                      }}>
                        Assign Task
                    </button>
                    <button className="button__red"
                      onClick={(e) => {
                        e.preventDefault();
                        this.refs.assignTaskModal.style.display = "none";
                      }}>
                        Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
            {/* Assign Task Modal ends here */}
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
        if (!!currentUser.isAdmin && !!task.assignedId) {
          return <div key={task._id} className={taskDiv}>
            <div onClick={() => {
              localStorage.setItem("selectedTaskId", task.formId);
              history.push(`/${task.formId}`);
              history.go();
            }}>
            <p className="task-header-assigned">{moment(task.dueDate).format('MM-DD-YYYY')}</p>
            <h3 className="task-info">{task.subTask}</h3>
            <p className="task-info">{task.taskName}</p>
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
        } else if (task.assignedId === currentUser.userId) {
          return <div key={task._id} className={taskDiv}>
            <div onClick={() => {
              localStorage.setItem("selectedTaskId", task.formId);
              history.push(`/${task.formId}`);
              history.go();
            }}>
              <p className="task-header-assigned">{moment(task.dueDate).format('MM-DD-YYYY')}</p>
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
        if (!task.assignedId && !!currentUser.isAdmin && !!task.review) {
          return <div key={task._id} ref={task._id} className={taskDiv}>
            <div onClick={() => {
              localStorage.setItem("selectedTaskId", task.formId);
              history.push(`/${task.formId}`);
              history.go();
            }}>
              <p className="task-header-workneeded">{moment(task.dueDate).format('MM-DD-YYYY')}</p>
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
                this.refs.assignTaskModal.style.display = "block";
            }}>Assign Task</button>
            {/* Assign Task modal div starts here. */}
            <div ref="assignTaskModal" className="modal-assignTask">
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
                        this.refs.assignTaskModal.style.display = "none";
                      }}>
                        Assign Task
                    </button>
                    <button className="button__red"
                      onClick={(e) => {
                        e.preventDefault();
                        this.refs.assignTaskModal.style.display = "none";
                      }}>
                        Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        };
      })
    });
  }

  showContent() {
    setTimeout(function() {
      document.getElementById('loader').style.display = "none";
      document.getElementById('content').style.display = "block";
    }, 1500);
  }

  render () {
    return (
      <div className="wrapper" id="overLord">
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
            <div ref="completedTasks" className="pure-u-1 pure-u-sm-1-4 item__right">
              <div className="item--padding">
                <h3 className="item--border item--padding item--right--color">
                  <span className="mbri-like"></span>
                  <p>Completed Tasks</p>
                </h3>
                <p><strong>Coming Soon</strong></p>
              </div>
            </div>
          </div>
        </div>
        {this.showContent()}
      </div>
    );
  }
};
