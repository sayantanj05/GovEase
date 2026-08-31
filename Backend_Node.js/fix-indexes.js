const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB_NAME });
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    console.log('Dropping old indexes on profiles collection...');
    try {
      await db.collection('profiles').dropIndex('user_id_1');
      console.log('Dropped user_id_1 index');
    } catch (e) {
      console.log('user_id_1 index does not exist:', e.message);
    }

    try {
      await db.collection('profiles').dropIndex('idx_profiles_user_id');
      console.log('Dropped idx_profiles_user_id index');
    } catch (e) {
      console.log('idx_profiles_user_id index does not exist:', e.message);
    }

    console.log('Dropping old indexes on addresses collection...');
    try {
      await db.collection('addresses').dropIndex('user_id_1');
      console.log('Dropped user_id_1 index');
    } catch (e) {
      console.log('user_id_1 index does not exist:', e.message);
    }

    try {
      await db.collection('addresses').dropIndex('idx_addresses_user_id');
      console.log('Dropped idx_addresses_user_id index');
    } catch (e) {
      console.log('idx_addresses_user_id index does not exist:', e.message);
    }

    console.log('Creating correct indexes...');
    await db.collection('profiles').createIndex({ userId: 1 }, { unique: true });
    console.log('Created userId index on profiles');

    await db.collection('addresses').createIndex({ userId: 1 }, { unique: true });
    console.log('Created userId index on addresses');

    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixIndexes();
