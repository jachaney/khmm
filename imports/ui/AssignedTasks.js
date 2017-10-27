import React from 'react';
import createHistory from 'history/createBrowserHistory';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { Session } from 'meteor/session';
import moment from 'moment';

import { TaskList } from '../api/methods';
import WorkTask from './Task';

const history = createHistory();

export default class UpcomingTasks extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        tasks: []
      };
  }
  componentDidMount() {
    this.infoTracker = Tracker.autorun(() => {
      Meteor.subscribe('tasks');
      const tasks = TaskList.find().fetch();
      this.setState ({ tasks });
      console.log('Task List loaded');
    });
  }
  componentWillUnmount() {
    this.infoTracker.stop();
    console.log('Task list unloaded');
  }
  openTask(e) {
    e.preventDefault();
    Session.set('selectedTaskId', this.taskName);
    console.log(Session.get('selectedTaskId'));
    history.push('/worktask');
  }
  renderTasks() {
    return this.state.tasks.map((task) => {
      if (!task.assignedId) {
        return <div key={task._id}>
          <button className="button-left" onClick={() => {
            localStorage.setItem("selectedTaskId", task.formId);
            history.push(`/${task.formId}`);
            history.go();
          }}>{task.taskName}<br/>{task.subTask}<br/>{moment(task.dueDate).format('MM-DD-YYYY')}</button>
        </div>
      }
    })
  };

  render () {
    return (
      <div>
        {this.renderTasks()}
      </div>
    )
  }
};
