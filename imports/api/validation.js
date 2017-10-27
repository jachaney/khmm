import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import SimpleSchema from 'simpl-schema';

Accounts.validateNewUser((user) => {
  const email = user.emails[0].address;

try {
new SimpleSchema({
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  }
}).validate({ email });
} catch (e) {
throw new Meteor.Error(400, e.message)
};
  return true;
});

// const employeeSchema = new SimpleSchema ({
//   name: {
//     type: String,
//     min: 1,
//     max: 200
//   },
//   hourlyWage: {
//     type: Number,
//     min: 7.75
//   },
//   email: {
//     type: String,
//     regEx: SimpleSchema.RegEx.Email
//   }
// });
//
// employeeSchema.validate ({
//   name: 'abc123',
//   hourlyWage: 25.75,
//   email: 'jachaney@outlook.com'
// });
