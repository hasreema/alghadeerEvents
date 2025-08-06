// MongoDB initialization script
// This script runs when MongoDB container starts for the first time

// Switch to the application database
db = db.getSiblingDB('al_ghadeer_events');

// Create a user for the application
db.createUser({
  user: 'alghadeer_user',
  pwd: 'alghadeer_pass',
  roles: [
    {
      role: 'readWrite',
      db: 'al_ghadeer_events'
    }
  ]
});

// Create collections with validation schemas
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'username', 'hashed_password', 'role'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        username: {
          bsonType: 'string',
          minLength: 3
        },
        role: {
          enum: ['admin', 'staff']
        }
      }
    }
  }
});

db.createCollection('events', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['event_name', 'event_date', 'customer_name', 'status'],
      properties: {
        status: {
          enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.events.createIndex({ event_date: 1 });
db.events.createIndex({ status: 1 });
db.events.createIndex({ customer_name: 'text', event_name: 'text' });
db.payments.createIndex({ event_id: 1 });
db.payments.createIndex({ payment_date: -1 });

print('MongoDB initialization completed successfully!');