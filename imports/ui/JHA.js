import { Meteor } from 'meteor/meteor';
import React from 'react';
import createHistory from 'history/createBrowserHistory';
import { BrowserRouter as Router, Route, Switch, Link, Redirect } from 'react-router-dom';
import { Tracker } from 'meteor/tracker';
import { Session } from 'meteor/session';
import { Random } from 'meteor/random';
import moment from 'moment';

import { TaskList } from './../api/methods';
import { JHASOWs } from './../api/methods';
import { JHAItems } from './../api/methods';
import { JHAForms } from './../api/methods';

const history = createHistory();
const formId = localStorage.getItem('selectedTaskId');
console.log(formId);

export default class jha extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      forms: [],
      items: [],
      SOWs: [],
      tasks:[],
    };
  }

  componentDidMount() {
    document.getElementById('content').style.display = "none";
    this.JHATracker = Tracker.autorun(() => {
      let tasksSub = Meteor.subscribe('tasks');
      const tasks = TaskList.find({ formId }).fetch();
      this.setState({ tasks });
      let jhaSowsSub = Meteor.subscribe('JHASows');
      const SOWs = JHASOWs.find({ formId }).fetch();
      this.setState({ SOWs });
      let formsSub = Meteor.subscribe('JHAForms');
      const forms = JHAForms.find({ formId }).fetch();
      this.setState({ forms });
      let itemsSub = Meteor.subscribe('JHAItems');
      const items = JHAItems.find({ formId }).fetch();
      this.setState({ items });
      if (itemsSub.ready() && tasksSub.ready() && jhaSowsSub.ready() && formsSub.ready()) {
        document.getElementById('content').style.display = "block";
        document.getElementById('loader').style.display = "none";
        if (this.state.items.length == 0) {
          console.log ("populating list now...");
          Meteor.call('jhaItems.populate', formId);
        } else {
          console.log ("there are this many items to list: ", this.state.items.length);
        }
      }
      this.state.forms.map((form) => {
        if (!!form.location) {
          document.getElementById("taskLocation").value = form.location;
        }
        if (!!form.scheduledDate) {
          document.getElementById("taskStartDate").value = form.scheduledDate;
        }
        if (!!form.preparedBy) {
          document.getElementById("jhaPreparedBy").value = form.preparedBy;
        }
        if (!!form.preparedDate) {
          document.getElementById("jhaPreparedDate").value = form.preparedDate;
        }
        if (!!form.reviewedBy) {
          document.getElementById("jhaReviewedBy").value = form.reviewedBy;
        }
        if (!!form.reviewedDate) {
          document.getElementById("jhaReviewedDate").value = form.reviewedDate;
        }
      })
      this.state.SOWs.map((sow) => {
        if (!!sow.sowValue) {
          document.getElementById(`${sow.sowId}`).value = sow.sowValue;
        }
        if (!!sow.hazValue) {
          document.getElementById(`${sow.hazId}`).value = sow.hazValue;
        }
        if (!!sow.controlValue) {
          document.getElementById(`${sow.controlId}`).value = sow.controlValue;
        }
      })
    })
  }

  componentWillUnmount() {
    this.JHATracker.stop();
  }

  onSubmit(e) {
    e.preventDefault();
  }

  addSOW(e) {
    e.preventDefault();
    Meteor.call('jhaSOW.add',formId);
  }

  updateSOW(event) {
    return this.state.SOWs.map((sow) => {
      let _id = sow._id;
      let sowValue = document.getElementById(`${sow.sowId}`).value;
      let hazValue = document.getElementById(`${sow.hazId}`).value;
      let controlValue = document.getElementById(`${sow.controlId}`).value;
      Meteor.call('jhaSOW.update', _id, sowValue, hazValue, controlValue);
    })
  }

  renderSOWs() {
    return this.state.SOWs.map((sow) => {
      return <div key={sow._id} id={sow._id}>
        <div className="pure-u pure-u-sm-1-3">
          <textarea className="item-sow-textbox" id={sow.sowId}
            onChange={(e) => {
              e.preventDefault();
              this.updateSOW();
            }}/>
        </div>
        <div className="pure-u pure-u-sm-1-3">
          <textarea className="item-sow-textbox" id={sow.hazId}
            onChange={(e) => {
              e.preventDefault();
              this.updateSOW();
            }}/>
        </div>
        <div className="pure-u pure-u-sm-1-3">
          <textarea className="item-sow-textbox item-sow-textbox-with-delete"
            id={sow.controlId}
            onChange={(e) => {
              e.preventDefault();
              this.updateSOW();
            }}/>
          <button className="button-sow-delete-item" title="Delete this sequence"
            onClick={(e) => {
              e.preventDefault();
              let _id = sow._id;
              Meteor.call('jhaSOW.remove', _id);
            }}>
            <span id="rem-work-icon" className="mbri-close"/>
          </button>
        </div>
      </div>
    });
  }

  goCancel() {
    history.push(`/${formId}`);
    history.go();
  }

  updateJHAForm(e) {
    e.preventDefault();
    let location = document.getElementById("taskLocation").value;
    let scheduledDate = document.getElementById("taskStartDate").value;
    let preparedBy = document.getElementById("jhaPreparedBy").value;
    let preparedDate = document.getElementById("jhaPreparedDate").value;
    let reviewedBy = document.getElementById("jhaReviewedBy").value;
    let reviewedDate = document.getElementById("jhaReviewedDate").value;
    Meteor.call('jhaForm.update',formId,location,scheduledDate,preparedBy,preparedDate,reviewedBy,reviewedDate)
  }

  renderTaskInfo() {
    return this.state.tasks.map((task) => {
      return <div key={task._id}>
        <p>Work Description: {task.subTask}</p>
        <p>Location:
          <input className="item--textbox" type="text" id="taskLocation"
            placeholder="Please enter the task location here"
            onChange={this.updateJHAForm.bind(this)}/>
        </p>
        <p>Scheduled Start Date:
          <input className="item-date" type="date" id="taskStartDate"
            onChange={this.updateJHAForm.bind(this)}/>
        </p>
        <p>Attendees: {task.assistedBy}</p>
        <p>Prepared By:
          <input className="item--textbox" type="text" id="jhaPreparedBy"
            placeholder="Prepared by..."
            onChange={this.updateJHAForm.bind(this)}/>
          <input className="item-date" type="date" id="jhaPreparedDate"
            onChange={this.updateJHAForm.bind(this)}/>
        </p>
        <p>Reviewed By:
          <input className="item--textbox" type="text" id="jhaReviewedBy"
            placeholder="Reviewed by..."
            onChange={this.updateJHAForm.bind(this)}/>
          <input className="item-date" type="date" id="jhaReviewedDate"
            onChange={this.updateJHAForm.bind(this)}/>
        </p>
      </div>
    })
  }

  renderJHAItems() {
    return this.state.items.map((item) => {
      let isChecked = item.checked;
      return <div key={item._id}>
        <label className="pure-u-1 item--checkbox--padding" ref={item.subHeadingId} id={item.subHeadingId}
          style={{display: item.subHeading ? 'block' : 'none'}}>
          <strong>{item.subHeading}</strong>
        </label>
        <input type="checkbox" className="pure-u-1-24 item--checkbox--padding" name="checkbox" ref={item._id}
          id={item._id} checked={isChecked}
          onChange={(e) => {
            e.preventDefault();
            let _id = item._id;
            let checked = e.target.checked;
            Meteor.call('jhaItem.check', _id, checked)
          }}
        />
        <label className="pure-u-21-24 item--checkbox--padding" ref={item.textId}>
          &nbsp; {item.text}
        </label>
      </div>
    });
  }

  render() {
    return (
      <div id="wrapper" className="wrapper">
        <div id="loader" className="loader"></div>
        <div id="content">
          <form name="jhaItems" id="primeForm"
            onSubmit={this.goCancel.bind(this)}>
            <div className="item-jha-header">
              <h2>Congregation Job Hazard Analysis</h2>
              <p>Please read the <i><a href="/DC-85i.pdf">
                  Congregation Job Hazard Analysis Instructions (DC-85i)
                </a></i> carefully before completing this report.
              </p>
            </div>
            <div className="pure-g item-background">
              <div className="pure-u-1 item-jha-task-info">
                {this.renderTaskInfo()}
              </div>
              <div className="pure-u-1 pure-u-sm-1-3 item-sow-label">
                <h3>Sequence of Work</h3>
              </div>
              <div className="pure-u-1 pure-u-sm-1-3 item-sow-label">
                <h3>Potential Hazards</h3>
              </div>
              <div className="pure-u-1 pure-u-sm-1-3 item-sow-label">
                <h3>Method for Eliminating or Controlling and Person Responsible</h3>
              </div>
              <div className="pure-u-1" id="sowContainer">
                {this.renderSOWs()}
              </div>
              <div className="pure-u-1 item__middle">
                <button ref="addSOW" className="button__grey"
                  onClick={(e) => {
                    e.preventDefault();
                    let type = "textarea";
                    Meteor.call('jhaSOW.add', formId, type);
                  }}>
                    Add a Sequence of Work
                </button>
              </div>
              <div className="pure-u-1 item">
                {this.renderJHAItems()}
              </div>
              <div className="pure-u-1 item__middle">
                <button ref="backButton" type="submit"
                  className="button__grey">
                  Go Back to the Task
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  };

};
