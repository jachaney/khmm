import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import moment from 'moment';
import SimpleSchema from 'simpl-schema';
import { Session } from 'meteor/session';
import { Random } from 'meteor/random';

export const UserInfoDB = new Mongo.Collection('userinfo');
export const TaskList = new Mongo.Collection('tasks');
export const RemItems = new Mongo.Collection('remitems');
export const WorkItems = new Mongo.Collection('workitems');
export const JHAForms = new Mongo.Collection('jhaforms');
export const JHAItems = new Mongo.Collection('jhaitems');
export const JHASOWs = new Mongo.Collection('jhasows');

if (Meteor.isServer) {
  Meteor.publish('tasks', function() {
    if (!!Meteor.user().profile.isAdmin) {
      return TaskList.find({ $or: [{primeId: Meteor.user().profile.primeId},{assignedId: this.userId }]},{sort:{dueDate: 1} });
    } else {
      return TaskList.find({assignedId: this.userId},{sort:{dueDate: 1}});
    }
  });
  Meteor.publish('userinfo', function() {
    return UserInfoDB.find ({$or: [{_id: this.userId },{userId: this.userId}] });
  });
  Meteor.publish('workitems', function() {
    return WorkItems.find ({primeId: Meteor.user().profile.primeId});
  });
  Meteor.publish('remitems', function() {
    return RemItems.find ({primeId: Meteor.user().profile.primeId});
  });
  Meteor.publish('users', function() {
    return UserInfoDB.find ({primeId: Meteor.user().profile.primeId});
  });
  Meteor.publish('defaultTasks', function() {
    return TaskList.find ({primeId: "defaultTask"});
  });
  Meteor.publish('defaultRemItems', function() {
    return RemItems.find ({primeId: "defaultTask"});
  });
  Meteor.publish('defaultWorkItems', function() {
    return WorkItems.find ({primeId: "defaultTask"});
  });
  Meteor.publish('JHAItems', function() {
    return JHAItems.find ({primeId: Meteor.user().profile.primeId});
  });
  Meteor.publish('JHAForms', function() {
    return JHAForms.find ({primeId: Meteor.user().profile.primeId});
  });
  Meteor.publish('JHASows', function() {
    return JHASOWs.find ({primeId: Meteor.user().profile.primeId});
  });
  Meteor.publish('defaultJHAItems', function() {
    return JHAItems.find ({primeId: "default"});
  });
}

Meteor.methods({
// Task methods begin here
  'task.new'(newId) {
      if (!this.userId) {
        throw new Meteor.Error('Unauthorized access');
      }
        TaskList.insert({
          assignedId: '',
          completed: '',
          createdBy: Meteor.user().emails[0].address,
          createdOn: new Date(),
          frequency: "1",
          formId: newId,
          primeId: Meteor.user().profile.primeId,
        });
  },
  'task.remove'(formId) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    TaskList.remove({formId});
    WorkItems.remove({formId});
    RemItems.remove({formId});
    JHAForms.remove({formId});
    JHASOWs.remove({formId});
    JHAItems.remove({formId});
  },
  'task.assign' (taskId, assignedId, firstname, lastname, assignedOn) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    TaskList.update({_id: taskId},
      {$set: {
        assignedId,
        firstname,
        lastname,
        assignedOn
      }},
      {upsert: true});
  },
  'task.complete' (formId, dueDate) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    let newFormId = Random.id();
    TaskList.find({formId}).forEach(function(task) {
      task._id = Random.id();
      task.assignedOn = "";
      task.assignedId = "";
      task.assistedBy = "";
      task.completed = "";
      task.completedOn = "";
      task.dueDate = dueDate;
      task.formId = newFormId;
      task.firstname = "";
      task.lastname = "";
      task.review = "";
      TaskList.insert(task);
    })
    TaskList.update({formId},
      {$set: {
          completed: true,
          completedOn: moment().format('YYYY-MM-DD'),
          review: "",
        }
      },{upsert: true})
    WorkItems.find({formId}).forEach(function(workItem) {
      workItem._id = Random.id();
      workItem.checked = "";
      workItem.formId = newFormId;
      WorkItems.insert(workItem);
    })
    RemItems.find({formId}).forEach(function(remItem) {
      remItem._id = Random.id();
      remItem.checked = false;
      remItem.formId = newFormId;
      RemItems.insert(remItem);
    })
  },
  'task.selectDefault'(formId, val) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    TaskList.find({formId: val}).forEach(function(item) {
      item._id = Random.id();
      item.primeId = Meteor.user().profile.primeId;
      item.formId = formId;
      TaskList.insert(item);
    })
    RemItems.find({formId: val}).forEach(function(item) {
      item._id = Random.id();
      item.primeId = Meteor.user().profile.primeId;
      item.formId = formId;
      RemItems.insert(item);
    })
    WorkItems.find({formId: val}).forEach(function(item) {
      item._id = Random.id();
      item.primeId = Meteor.user().profile.primeId;
      item.formId = formId;
      WorkItems.insert(item);
    })
  },
  'task.workneeded'(formId) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    TaskList.update({formId},
      {$set: {
        assignedId: "",
        assignedOn: "",
        firstname: "",
        lastname: "",
        review: true
      }
    },{upsert: true})
  },
  'taskName.update' (taskName, formId) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    TaskList.update({ formId: formId },
      {$set: {
        taskName
      }
    },{upsert: true});
  },
  'subTask.update' (subTask, formId) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    TaskList.update({ formId: formId },
      {$set: {
        subTask
      }
    },{upsert: true});
  },
  'assistedBy.update' (formId, assistedBy) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    TaskList.update({formId: formId},
      {$set: {
        assistedBy
      }
    },{upsert: true})
  },
  'instructions.update' (instructions, formId) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    TaskList.update({ formId: formId },
      {$set: {
        instructions
      }
    },{upsert: true});
  },
  'dueDate.update' (dueDate, formId) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    TaskList.update({ formId: formId },
      {$set: {
        dueDate
      }
    },{upsert: true});
  },
  'caution.update' (caution, formId) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    TaskList.update({ formId: formId },
      {$set: {
        caution
      }
    },{upsert: true});
  },
  'frequency.update' (frequency, formId) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    TaskList.update({ formId: formId },
      {$set: {
        frequency
      }
    },{upsert: true});
  },
  'reminder.update' (reminder, formId) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    TaskList.update({ formId: formId },
      {$set: {
        reminder
      }
    },{upsert: true});
  },
  'notes.update' (notes, formId, review) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    TaskList.update({ formId: formId },
      {$set: {
        notes,
        review
      }
    },{upsert: true});
  },
  // workItem methods begin here
  'workItem.add' ( formId ) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    WorkItems.insert({
      formId,
      labelId: Random.id(),
      subTitleId: Random.id(),
      checked: false,
      primeId: Meteor.user().profile.primeId,
      createdOn: new Date()
    })
  },
  'workItem.label.update' (label, _id) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    WorkItems.update({_id: _id},
      {$set: {
        label
      }
    },{upsert: true});
  },
  'workItem.subTitle.update' (subTitle, _id) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    WorkItems.update({_id: _id},
      {$set: {
        subTitle
      }
    },{upsert: true});
  },
  'workItem.check' (_id, checked) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    WorkItems.update({_id: _id},
      {$set: {
        checked
      }
    },{upsert: true});
  },
  'workItem.remove' (_id) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    WorkItems.remove({ _id });
  },
  // remItem methods begin here
  'remItem.add' (formId) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    RemItems.insert({
      formId,
      checked: false,
      primeId: Meteor.user().profile.primeId,
      createdOn: new Date()
    });
  },
  'remItem.update' (label, _id) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    RemItems.update({_id: _id},
      {$set: {
        label,
        }
      },{upsert: true});
  },
  'remItem.check' (_id, checked) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    RemItems.update({_id: _id},
      {$set: {
        checked
      }
    },{upsert: true});
  },
  'remItem.remove' (_id) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    RemItems.remove({ _id });
  },
// User account methods begin here
  'userinfo.insert' ( email, firstname, lastname ) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    Meteor.users.update ({_id: this.userId},
      {$set: {
        profile: {
          isAdmin: true,
          primeId: this.userId
        }
      }
    },{upsert: true})
    UserInfoDB.insert({
      email,
      firstname,
      lastname,
      primeId: Meteor.user().profile.primeId,
      userId: this.userId,
      isAdmin: true
    })
  },
  'userinfo.create' (userId, email) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    UserInfoDB.insert({
      userId,
      email
    });
  },
  'userinfo.update' (firstname, lastname) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    UserInfoDB.update({userId: this.userId},
     {$set: {
          firstname,
          lastname
        }
      },{upsert: true});
  },
  'user.create' (email, password, isAdmin, firstname, lastname) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    let id = Accounts.createUser({
      email,
      password,
      profile: {
        isAdmin,
        primeId: Meteor.user().profile.primeId
      }
    });
    UserInfoDB.insert({
      email,
      firstname,
      lastname,
      userId: id,
      primeId: Meteor.user().profile.primeId,
      isAdmin
    })
  },
  'user.verify'(invitee) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    let foundUser = UserInfoDB.find({email: invitee}).fetch();
    if (foundUser.length) {
      return true;
    } else {
      return false;
    }
  },
  'user.invite'(invitee, inviter, newPrimeId, willBeAdmin) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    UserInfoDB.update({email: invitee},{
      $set: {
        newPrimeId,
        inviter,
        willBeAdmin
      }
    },{upsert: true})
  },
  'user.invite.accept'(newPrimeId, willBeAdmin) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    UserInfoDB.update({userId: this.userId},{
      $set: {
        primeId: newPrimeId,
        inviter: "",
        isAdmin: willBeAdmin,
        newPrimeId: "",
        willBeAdmin: "",
      }
    },{upsert: true})
    Meteor.users.update({_id: this.userId},{
      $set: {
        profile: {
          primeId: newPrimeId,
          isAdmin: willBeAdmin,
        }
      }
    },{upsert: true})
  },
  'user.invite.reject'() {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    UserInfoDB.update({userId: this.userId},{
      $set: {
        newPrimeId: "",
        inviter: "",
        willBeAdmin: "",
      }
    },{upsert: true})
  },
  'user.remove'(_id, userId) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    Meteor.users.update({_id: userId},{
      $set: {
        profile: {
          primeId: userId,
          isAdmin: true,
        }
      }
    },{upsert: true})
    UserInfoDB.update({_id},{
      $set: {
        primeId: userId,
        isAdmin: true,
      }
    },{upsert: true})
  },
  'user.update.logon'(_id, userId, newEmail) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    Meteor.users.update({_id: userId},{
      $set:{
        emails: {
          [0]: {
            address: newEmail,
          }
        }
      }
    },{upsert: true})
  },
// Job Hazard Analysis methods begin there
  'jhaForm.update' (formId,location,scheduledDate,preparedBy,preparedDate,reviewedBy,reviewedDate) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    JHAForms.update({formId},
      {$set: {
          location,
          scheduledDate,
          preparedBy,
          preparedDate,
          reviewedBy,
          reviewedDate,
          primeId: Meteor.user().profile.primeId
        }
      },
    {upsert: true});
  },
  'jhaSOW.add' (formId, type) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    JHASOWs.insert({
      type,
      formId,
      sowId: Random.id(),
      hazId: Random.id(),
      controlId: Random.id(),
      primeId: Meteor.user().profile.primeId,
      createdOn: new Date(),
    })
  },
  'jhaSOW.update' (_id, sowValue, hazValue, controlValue) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    JHASOWs.update({_id},
      {$set: {
        sowValue,
        hazValue,
        controlValue,
      }
    },{upsert: true});
  },
  'jhaSOW.remove' (_id) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    JHASOWs.remove({ _id });
  },
  'jhaItems.populate' (formId) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    JHAItems.find({formId: "default"},{$sort:{_id: 1}}).forEach(function(item) {
      item._id = Random.id();
      item.primeId = Meteor.user().profile.primeId;
      item.formId = formId;
      item.createdOn = new Date();
      item.subHeadingId = Random.id();
      item.textId = Random.id();
      JHAItems.insert(item);
    })
  },
  'jhaItems.add' (formId, subHeading, text) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    JHAItems.insert({
      formId,
      primeId: Meteor.user().profile.primeId,
      checked: false,
      createdOn: new Date(),
      subHeading,
      text
    })
  },
  'jhaItem.check' (_id, checked) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    JHAItems.update({ _id },
      {$set: {
        checked
      }
    },{upsert: true});
  },
});
