import { Meteor } from 'meteor/meteor';

import '../imports/api/validation';
import '../imports/api/methods';
import '../imports/startup/simple-schema-config.js';

Meteor.startup(() => {
  // process.env.MAIL_URL = "smtp://postmaster%40sandbox9830972e11b945108658953c9ae6685d.mailgun.org:209f198175f727c2dfae9152a2de11a8@smtp.mailgun.org:587";
});
