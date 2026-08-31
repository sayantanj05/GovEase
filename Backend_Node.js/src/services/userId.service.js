const User = require('../models/user.model');

class UserIdGenerator {
  static async generateUserId() {
    const prefix = 'USER';

    const lastUser = await User.findOne(
      { _id: { $regex: `^${prefix}` } },
      { _id: 1 }
    ).sort({ _id: -1 });

    let nextSerial = 1;

    if (lastUser) {
      const lastSerialStr = lastUser._id.replace(prefix, '');
      const lastSerial = parseInt(lastSerialStr, 10);
      if (!isNaN(lastSerial)) {
        nextSerial = lastSerial + 1;
      }
    }

    const serialStr = String(nextSerial).padStart(3, '0');
    return `${prefix}${serialStr}`;
  }
}

module.exports = UserIdGenerator;
