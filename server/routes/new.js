const bcrypt = require('bcryptjs');

const password = 'Sjk@1234';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) {
    console.error('Error hashing password:', err);
  } else {
    console.log(hash);
  }
});