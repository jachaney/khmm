import { Meteor } from 'meteor/meteor';
import React from 'react';
import createHistory from 'history/createBrowserHistory';
import { Tracker } from 'meteor/tracker';
import { Session } from 'meteor/session';
import { Random } from 'meteor/random';
import moment from 'moment';
import DatePicker from 'react-datepicker';

import { Notes } from './../api/methods';
import { RemItems } from './../api/methods';
import { TaskList } from './../api/methods';
import { WorkItems } from './../api/methods';

const history = createHistory();

export default class NewTask extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      funcBut: false,
      notes: [],
      remItems: [],
      tasks:[],
      workItems: [],
      defaultTasks: [],
      defaultWorkItems: [],
      defaultNotes: [],
      defaultRemItems: []
    };
  }

  componentDidMount() {
    Session.set('formId', Random.id());
    let newId = Session.get('formId');
    Meteor.call('task.new', newId);
    this.formTracker = Tracker.autorun(() => {
      Meteor.subscribe('notes');
      const notes = Notes.find().fetch();
      this.setState({ notes });
      Meteor.subscribe('remitems');
      const remItems = RemItems.find({formId: newId}).fetch();
      this.setState({ remItems });
      this.state.remItems.map((item) => {
        if (!!item.label) {
          document.getElementById(`${item._id}`).value = item.label;
        }
      })
      Meteor.subscribe('tasks');
      const tasks = TaskList.find({formId: newId}).fetch();
      this.setState({ tasks });
      this.state.tasks.map((task) => {
        if (!!task.taskName) {
          this.refs.primeTask.value = task.taskName;
          this.refs.subTask.value = task.subTask;
          this.refs.instructions.value = task.instructions;
          this.refs.frequency.value = task.frequency;
          this.refs.reminder.value = task.reminder;
          if (!!task.caution) {
            this.refs.caution.value = task.caution;
          }
        }
      })
      Meteor.subscribe('workitems');
      const workItems = WorkItems.find({formId: newId}).fetch();
      this.setState({ workItems });
      this.state.workItems.map((item) => {
        if (!!item.label) {
          document.getElementById(`${item.labelId}`).value = item.label;
        }
        if (!!item.subTitle) {
          document.getElementById(`${item.subTitleId}`).value = item.subTitle;
        }
      })
      Meteor.subscribe('defaultTasks');
      const defaultTasks = TaskList.find({primeId: "defaultTask"}).fetch();
      this.setState({ defaultTasks });
      Meteor.subscribe('defaultRemItems');
      const defaultRemItems = RemItems.find({primeId: "defaultTask"}).fetch();
      this.setState({ defaultRemItems });
      Meteor.subscribe('defaultWorkItems');
      const defaultWorkItems = WorkItems.find({primeId: "defaultTask"}).fetch();
      this.setState({ defaultWorkItems });
      Meteor.subscribe('defaultNotes');
      const defaultNotes = Notes.find({primeId: "defaultTask"}).fetch();
      this.setState({ defaultNotes });
    });
  }

  componentWillUnmount() {
    this.formTracker.stop();
  }

  onSubmit(e) {
    e.preventDefault();
  }

  addReminder(e) {
    e.preventDefault();
    let formId = Session.get('formId');
    Meteor.call('remItem.add', formId);
  }

  addWork(e) {
    e.preventDefault();
    let formId = Session.get('formId');
    Meteor.call('workItem.add', formId);
  }

  renderWorkItems() {
    return this.state.workItems.map((workItem) => {
      return <div className="item--task--padding" key={workItem._id}>
        <input type="checkbox" ref={workItem._id} className="pure-u-1-24"/>
        <textarea ref={workItem.subTitleId} id={workItem.subTitleId}
          className="pure-u-21-24"
          placeholder="If there's a sub-title please enter it here"
          onChange={(e) => {
            e.preventDefault();
            let _id = workItem._id;
            let subTitle = document.getElementById(`${workItem.subTitleId}`).value.trim();
            Meteor.call('workItem.subTitle.update', subTitle, _id);
        }}/>
        <p className="pure-u-1-24 item-hidden">Spacer</p>
        <p className="pure-u-1-24 item-hidden">Spacer</p>
        <textarea ref={workItem.label} id={workItem.labelId}
          className="pure-u-21-24"
          placeholder="Please enter the task information here"
          onChange={(e) => {
            e.preventDefault();
            let _id = workItem._id;
            let ref = workItem.label;
            let label = document.getElementById(`${workItem.labelId}`).value.trim();
            Meteor.call('workItem.label.update', label, _id);
        }}/>
        <button
          className="pure-u-1-24 button__red"
          title="Delete this task"
          onClick={(e) => {
            e.preventDefault();
            let _id = workItem._id;
            Meteor.call('workItem.remove', _id)}}>
            <span id="rem-work-icon" className="mbri-close"/>
        </button>
      </div>
    });
  }

  renderRemItems() {
    return this.state.remItems.map((remItem) => {
      return <div key={remItem._id} className="item--task--padding">
          <input type="checkbox" ref={remItem._id} className="pure-u-1-24"/>
          <textarea className="pure-u-21-24" ref={remItem._id}
            id={remItem._id}
            onChange={(e) => {
              e.preventDefault();
              let _id = remItem._id;
              let label = document.getElementById(`${remItem._id}`).value.trim();
              Meteor.call('remItem.update', label, _id);
           }}/>
           <button className="pure-u-1-24 button__red"
             title="Delete this reminder"
              onClick={(e) => {
               e.preventDefault();
               let _id = remItem._id;
               Meteor.call('remItem.remove', _id)}}>
            <span id="rem-rem-icon" className="mbri-close"/>
          </button>
        </div>
    });
  }

  saveTaskname() {
    let formId = Session.get('formId');
    let taskName = this.refs.primeTask.value;
    Meteor.call('taskName.update', taskName, formId);
  }
  saveSubTask() {
    let formId = Session.get('formId');
    let subTask = this.refs.subTask.value;
    Meteor.call('subTask.update', subTask, formId);
  }
  saveInstructions() {
    let formId = Session.get('formId');
    let instructions = this.refs.instructions.value;
    Meteor.call('instructions.update', instructions, formId);
  }
  saveDueDate() {
    let formId = Session.get('formId');
    let dueDateObj = moment(this.refs.dueDate.value);
    let dueDate = dueDateObj.format('YYYY-MM-DD');
    Meteor.call('dueDate.update', dueDate, formId);
  }
  saveFrequency() {
    let formId = Session.get('formId');
    let frequency = this.refs.frequency.value;
    Meteor.call('frequency.update', frequency, formId);
  }
  saveCreatedBy() {
    let formId = Session.get('formId');
    let createdBy = this.refs.createdBy.value;
    Meteor.call('createdBy.update', createdBy, formId);
  }
  saveCreatedDate() {
    let formId = Session.get('formId');
    let createdDate = this.refs.createdDate.value;
    Meteor.call('createdDate.update', createdDate, formId);
  }
  saveReminder() {
    let formId = Session.get('formId');
    let reminder = this.refs.reminder.value;
    Meteor.call('reminder.update', reminder, formId);
  }
  saveNotes() {
    let formId = Session.get('formId');
    let notes = this.refs.notes.value;
    Meteor.call('notes.update', notes, formId);
  }
  saveCaution() {
    let formId = Session.get('formId');
    let caution = this.refs.caution.value;
    Meteor.call('caution.update', caution, formId);
  }
  goCancel() {
    let formId = Session.get('formId');
    Meteor.call('task.remove', formId);
      this.props.history.push('/mgmt');
  }
  goSave(e) {
    e.preventDefault();
    let formId = Session.get('formId');
    if (!this.refs.primeTask.value || !this.refs.subTask.value || !this.refs.dueDate.value)
      {
        return alert('Please provide a primary task name, a sub-task name, \nand a due date before leaving');
      } else {
        let caution = this.refs.caution.value;
        Meteor.call('caution.update', caution, formId);
        let notes = this.refs.notes.value;
        Meteor.call('notes.update', notes, formId);
        let reminder = this.refs.reminder.value;
        Meteor.call('reminder.update', reminder, formId);
        let frequency = this.refs.frequency.value;
        Meteor.call('frequency.update', frequency, formId);
        let taskName = this.refs.primeTask.value;
        Meteor.call('taskName.update', taskName, formId);
        let subTask = this.refs.subTask.value;
        Meteor.call('subTask.update', subTask, formId);
        let instructions = this.refs.instructions.value;
        Meteor.call('instructions.update', instructions, formId);
        let dueDateObj = moment(this.refs.dueDate.value);
        let dueDate = dueDateObj.format('YYYY-MM-DD');
        Meteor.call('dueDate.update', dueDate, formId);
        this.props.history.push('/mgmt');
        this.props.history.go();
      };
  }
  renderDefaultTasks() {
    return this.state.defaultTasks.map((defaultTask) => {
      return <option key={defaultTask._id} value={defaultTask.formId}>
        {defaultTask.subTask}
      </option>
    })
  }

  render() {
    return (
      <div id="wrapper" className="wrapper">
        <form name="taskOptions" id="primeForm"
          onSubmit={this.goSave.bind(this)}>
          <div className="item__top item--instruction">
            <h2>Task Instruction Card</h2>
            <p>Select a pre-defined task...</p>
            <select ref="defaultTaskSelect" className="item-select"
              onChange={(e) => {
                e.preventDefault();
                let formId = Session.get('formId');
                let val = this.refs.defaultTaskSelect.value;
                Meteor.call('task.remove', formId);
                Meteor.call('task.selectDefault', formId, val);
              }
            }>
            <option value=""></option>
            {this.renderDefaultTasks()}
          </select>
          <p>...or build your own task card.</p>
          {/* </div>
          <div className="item__middle item--instruction"> */}
          </div>
          <div className="pure-g">
            <div className="pure-u-1 item--primeTask-new item--task--padding">
              <input type="text" ref="primeTask"
                placeholder="Enter the primary task name here..."
                className="item--textbox"
                onChange={this.saveTaskname.bind(this)}/>
            </div>
            <div className="pure-u-1 item--subTask-new item--task--padding">
              <input type="text" ref="subTask"
                placeholder="Enter the sub-task name here..."
                className="item--textbox"
                onChange={this.saveSubTask.bind(this)}/>
            </div>
            <div className="pure-u-1 item">
              <h3>Instructions:</h3>
              <textarea type="text" ref="instructions"
                onChange={this.saveInstructions.bind(this)}
                className="item--instructions"/>
            </div>
            <div className="pure-u-1 item__middle">
              <div className="pure-u-1 pure-u-md-1-2">
                <h3>Due Date:</h3>
                <input type="date" ref="dueDate"
                  onChange={this.saveDueDate.bind(this)}/>
              </div>
              <div className="pure-u-1 pure-u-md-1-2">
                <h3>Frequency:</h3>
                <select name="frequency" ref="frequency"
                  onChange={this.saveFrequency.bind(this)}>
                  <option name="onemonth" value="1">Monthly</option>
                  <option name="threemonth" value="3">Quarterly</option>
                  <option name="semiann" value="6">Semiannually</option>
                  <option name="yearly" value="12">Yearly</option>
                </select>
              </div>
            </div>
            <div className="pure-u-1 item">
              <h3>Reminder:</h3>
              <textarea ref="reminder" onChange={this.saveReminder.bind(this)}
                className="item--instructions"/>
              <h3>Caution:</h3>
              <textarea type="text" ref="caution" className="item--instructions"
                onChange={this.saveCaution.bind(this)}/>
            </div>
            <div id="remArea" className="pure-u-1">
              {this.renderRemItems()}
            </div>
            <div className="pure-u-1 item__middle">
              <button className="button button--pos"
                 onClick={this.addReminder.bind(this)}>
                Add Reminder Item
              </button>
            </div>
            <div className="pure-u-1" id="workitems">
              {this.renderWorkItems()}
            </div>
            <div className="pure-u-1 item__middle">
              <button className="button button--pos"
                onClick={this.addWork.bind(this)}>Add Work Item</button>
            </div>
            <div className="pure-u-1 item">
              <h3>Notes/Additional Repairs Needed</h3>
              <textarea ref="notes" className="item--instructions"
                onChange={this.saveNotes.bind(this)}/>
            </div>
            <div className="pure-u-1 item__middle">
              <button ref="createTask" type="submit"
                className="button__green">
                Save
              </button>
              <button onClick={this.goCancel.bind(this)}
                className="button__red">
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    )
  };

};
