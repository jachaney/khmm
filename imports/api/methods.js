import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import moment from 'moment';
import shortid from 'shortid';
import SimpleSchema from 'simpl-schema';
import { Session } from 'meteor/session';

export const UserInfoDB = new Mongo.Collection('userinfo');
export const TaskList = new Mongo.Collection('tasks');
export const RemItems = new Mongo.Collection('remitems');
export const WorkItems = new Mongo.Collection('workitems');
export const Notes = new Mongo.Collection('notes');

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
    Meteor.publish('notes', function() {
      return Notes.find({primeId: Meteor.user().profile.primeId});
    });
    Meteor.publish('users', function() {
      return UserInfoDB.find ({primeId: Meteor.user().profile.primeId});
    });
  }

Meteor.methods({
  'task.new'(newId) {
      if (!this.userId) {
        throw new Meteor.Error('Unauthorized access');
      }
      let primeId = UserInfoDB.find({ userId: this.userId }).fetch();
      primeId.map((primeId) => {
        TaskList.insert({
          assignedId: '',
          createdBy: Meteor.user().emails[0].address,
          frequency: "1",
          formId: newId,
          primeId: primeId.primeId,
          createdOn: new Date()
        });
      });
  },
  'task.remove'(formId) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    TaskList.remove({formId});
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
  'task.complete' (formId) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    TaskList.update({formId},
      {$set: {
          assistedBy: "",
          firstname: "",
          lastname: "",
          assignedOn: "",
          assignedId: "",
          review: ""
        }
      }
    )
    WorkItems.update({formId},
    {$set: {
      checked: false
      }
    },{multi: true});
    RemItems.update({formId},
    {$set: {
      checked: false
      }
    },{multi: true});
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
  'notes.update' (notes, formId) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    TaskList.update({ formId: formId },
      {$set: {
        notes
      }
    },{upsert: true});
  },
  'workItem.add' ( formId ) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    WorkItems.insert({
      formId,
      labelId: shortid.generate(),
      subTitleId: shortid.generate(),
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

  'note.add' (content, formId) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized access');
    }
    Notes.insert({
      content,
      formId,
      createdOn: new Date()
    })
  },
  'userinfo.insert' ( email, firstname, lastname, cong ) {
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
      cong,
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
      },
      {upsert: true});
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
});
