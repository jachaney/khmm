import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';

SimpleSchema.defineValidationErrorTransform((e) => {
  alert(e.message)
  return new Meteor.Error(400, e.message)
});
