import { Meteor } from 'meteor/meteor';
import React from 'react';
import createHistory from 'history/createBrowserHistory';
import { BrowserRouter as Router, Route, Switch, Link, Redirect } from 'react-router-dom';
import { Tracker } from 'meteor/tracker';
import { Session } from 'meteor/session';
import shortid from 'shortid';
import moment from 'moment';
import Checkbox from 'rc-checkbox';

import { Notes } from './../api/methods';
import { RemItems } from './../api/methods';
import { TaskList } from './../api/methods';
import { WorkItems } from './../api/methods';

const history = createHistory();
const formId = localStorage.getItem('selectedTaskId');
Session.set('checked', 0);

export default class WorkTask extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      funcBut: false,
      isCompleted: '',
      notes: [],
      remItems: [],
      tasks:[],
      workItems: []
    };
  }

  componentDidMount() {
    document.getElementById('content').style.display = "none";
    this.formTracker = Tracker.autorun(() => {
      let remItemsSub = Meteor.subscribe('remitems');
      const remItems = RemItems.find({formId}).fetch();
      this.setState({ remItems });
      let tasksSub = Meteor.subscribe('tasks');
      const tasks = TaskList.find({formId}).fetch();
      this.setState({ tasks });
      let workItemsSub = Meteor.subscribe('workitems');
      const workItems = WorkItems.find({formId}).fetch();
      this.setState({ workItems });
      this.state.tasks.map((task) => {
        if (!!task.completed) {
          this.setState({isCompleted: true});
        }
        if (!!task.assignedOn) {
          this.refs.assignedOn.innerHTML = `${moment(task.assignedOn).format('dddd, MMM Do YYYY')}`;
        } else {
          this.refs.assignedOn.innerHTML = "Unassigned";
        }
        if (task.firstname) {
          this.refs.assignedTo.innerHTML = `${task.firstname} ${task.lastname}`
        } else {
          this.refs.assignedTo.innerHTML = "Unassigned";
        }
        if (!!task.notes) {
          this.refs.notes.value = task.notes;
        } else {
          this.refs.notes.value = "";
        }
        this.refs.primeTask.innerHTML = task.taskName;
        this.refs.subTask.innerHTML = `Task: ${task.subTask}`;
        this.refs.instructions.innerHTML = task.instructions;
        this.refs.dueDate.innerHTML = `<strong>Due Date:</strong><br/>${moment(task.dueDate).format('dddd, MMM Do YYYY')}`;
        if (task.frequency === "1") {
          this.refs.frequency.innerHTML = `<strong>Frequency:</strong><br/>${task.frequency} month`;
        } else {
          this.refs.frequency.innerHTML = `<strong>Frequency:</strong><br/>${task.frequency} months`;
        }
        this.refs.createdBy.innerHTML = `<strong>Task Version Created By:</strong><br/>${task.createdBy}`;
        this.refs.createdDate.innerHTML = `<strong>Version Created Date:</strong><br/>${moment(task.createdOn).format('dddd, MMM Do YYYY')}`;
        if (!!task.reminder) {
          this.refs.reminder.innerHTML = task.reminder;
        } else {
          this.refs.reminder.innerHTML = "";
        }
        if (!!task.caution) {
          this.refs.caution.innerHTML = task.caution;
        } else {
          this.refs.caution.innerHTML = "";
        }
        if (!!task.assistedBy) {
          this.refs.assistedBy.value = task.assistedBy;
        } else {
          this.refs.assistedBy.value = "";
        }
      })
      if (remItemsSub.ready() && tasksSub.ready() && workItemsSub.ready()) {
        document.getElementById('content').style.display = "block";
        document.getElementById('loader').style.display = "none";
      }
    });
  }

  componentWillUnmount() {
    this.formTracker.stop();
  }

  onSubmit(e) {
    e.preventDefault();
    this.state.tasks.map((task) => {

    });
  }

  renderRemItems() {
    return this.state.remItems.map((remItem) => {
      let isChecked = remItem.checked;
      return <div name="checkboxes" key={remItem._id} className="item--checkbox--padding">
        <input className="pure-u-1-24 item--checkbox--padding" type="checkbox"
          ref={remItem._id} name="checkbox" value="1" id={remItem._id}
          disabled={this.state.isCompleted ? 'true' : null}
          checked={isChecked}
          onChange={(e) => {
            e.preventDefault();
            let _id = remItem._id;
            let checked = e.target.checked;
            Meteor.call('remItem.check', _id, checked);
          }}
        />
        <label className="pure-u-21-24 item--checkbox--padding" ref={remItem._id}>
          &nbsp; {remItem.label}
        </label>
      </div>
    });
  }

  renderWorkItems() {
    return this.state.workItems.map((workItem) => {
      let isChecked = workItem.checked;
      return <div key={workItem._id}>
        <label className="pure-u-1 item--checkbox--padding" ref={workItem.subTitleId} id={workItem.subTitleId}
          style={{display: workItem.subTitle ? 'block' : 'none'}}>
          <strong>{workItem.subTitle}</strong>
        </label>
        <input type="checkbox" className="pure-u-1-24 item--checkbox--padding" name="checkbox" ref={workItem._id}
          id={workItem._id} checked={isChecked}
          disabled={this.state.isCompleted ? 'true' : null}
          onChange={(e) => {
            e.preventDefault();
            let _id = workItem._id;
            let checked = e.target.checked;
            Meteor.call('workItem.check', _id, checked)
          }}
        />
        <label className="pure-u-21-24 item--checkbox--padding" ref={workItem.labelId}>
          &nbsp; {workItem.label}
        </label>
      </div>
    });
  }

  saveAssistedBy() {
    let assistedBy = this.refs.assistedBy.value;
    Meteor.call('assistedBy.update', formId, assistedBy);
  }

  saveNotes() {
    let notes = this.refs.notes.value;
    if (!this.refs.notes.value) {
      review = false;
    } else {
      review = true;
    }
    Meteor.call('notes.update', notes, formId, review);
  }

  render() {
    return (
      <div id="wrapper" className="wrapper">
        <div id="loader" className="loader"></div>
        <div id="content">
          <form name="taskOptions" id="primeForm">
            <div className="item-instruction">
              <h2>Task Instruction Card</h2>
            </div>
            <div className="pure-g">
              <div id="taskNames" className="pure-u-1 item--primeTask item--task--padding">
                <h2 ref="primeTask"/>
              </div>
              <div className="pure-u-1 item--subTask item--task--padding">
                <h2 ref="subTask"/>
              </div>
              <div className="pure-u-1 item">
                <h3>Instructions:</h3>
                <p ref="instructions"/>
              </div>
              <div className="pure-u-1">
                <div className="pure-u-1 pure-u-sm-1-6 item">
                  <p><strong>Assigned To:</strong></p>
                  <p ref="assignedTo"/>
                </div>
                <div className="pure-u-1 pure-u-sm-1-6 item">
                  <p><strong>Date Assigned:</strong></p>
                  <p ref="assignedOn"/>
                </div>
                <div className="pure-u-1 pure-u-sm-1-6 item">
                  <p ref="dueDate"/>
                </div>
                <div className="pure-u-1 pure-u-sm-1-6 item">
                  <p  ref="frequency"/>
                </div>
                <div className="pure-u-1 pure-u-sm-1-6 item">
                  <p><strong>Assisted By:</strong></p>
                  <input type="text" ref="assistedBy" id="assistedBy"
                    disabled={this.state.isCompleted ? 'true' : null}
                    onChange={this.saveAssistedBy.bind(this)}/>
                </div>
              </div>
              <div className="pure-u-1 item">
                <Link to="/jha">
                  Click here to view the Job Hazard Analysis for this task
                </Link>
              </div>
              <div id="reminder" className="pure-u-1 item">
                <h3>Reminder:</h3>
                <p ref="reminder"/>
                  {this.renderRemItems()}
                <h3>Caution:</h3>
                <p ref="caution"/>
              </div>
              <div ref="workItems" className="pure-u-1 item">
                <h3>Tasks:</h3>
                {this.renderWorkItems()}
              </div>
              <div className="pure-u-1 item">
                <h3>Notes/Additional Repairs Needed</h3>
                <textarea className="item--notes" ref="notes"
                  onChange={this.saveNotes.bind(this)}/>
              </div>
              <div className="pure-u-1 item">
                <p className="pure-u-1-2" ref="createdBy"/>
                <p className="pure-u-1-2" ref="createdDate"/>
              </div>
              <div className="pure-u-1 item__middle item-background">
                <button className="button__grey"
                  onClick={() => {this.props.history.push('/mgmt');}}>
                  Home
                </button>
                <button className="button__green"
                  style={{display: this.state.isCompleted ? 'none' : null}}
                  onClick={(e) => {
                    this.state.tasks.map((task) => {
                      try {
                        b = document.taskOptions.checkbox.length;
                        c = $('input[type=checkbox]:checked').length;
                      }
                      catch(err) {
                        b = 0;
                        c = 0;
                      }
                      let dueDateObj = moment(task.dueDate).add(task.frequency, 'months');
                      let dueDate = dueDateObj.format('YYYY-MM-DD');
                      let taskId = task._id;
                      if (c != b) {
                        e.preventDefault();
                        return alert('Please complete all tasks before completing the work order');
                      } else if (task.frequency === "0") {
                        Meteor.call('task.remove', formId);
                        this.props.history.push('/mgmt');
                        this.props.history.go();
                      } else if (c === b && !!this.refs.notes.value) {
                        e.preventDefault();
                        Meteor.call('task.workneeded', formId);
                        this.props.history.push('/mgmt');
                        this.props.history.go();
                      } else if (c === b && !this.refs.notes.value) {
                        e.preventDefault();
                        Meteor.call('task.complete', formId, dueDate);
                        this.props.history.push('/mgmt');
                        this.props.history.go();
                      }
                    })
                }}>
                  Complete Task
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }
}
