const bcrypt = require('bcrypt');
class PasswordService {
  async hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }
}
module.exports = new PasswordService();