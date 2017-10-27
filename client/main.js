import  createHistory  from 'history/createBrowserHistory';
import { Meteor } from 'meteor/meteor';
import ReactDOM from 'react-dom';
import { Tracker } from 'meteor/tracker';
import { Session } from 'meteor/session';

import { Routes } from '../imports/routes/routes';

const history = createHistory();

Meteor.startup(() => {
  Tracker.autorun(() => {
      ReactDOM.render(Routes, document.getElementById('ldcapp'))
    });
});
