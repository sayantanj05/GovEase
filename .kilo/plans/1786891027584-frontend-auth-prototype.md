# Profile Management Module - Implementation Plan

## Overview
Implement CRUD operations for user profiles including personal details, education timeline, experience timeline, skills, documents, and preferences. Connected to existing Node.js backend and MongoDB.

## Collections to Use
- `users` - Already exists (reference only)
- `profiles` - Personal details
- `addresses` - User address (single)
- `identities` - Government IDs stored as JSON with images
- `education` - Education timeline (varies by type)
- `experience` - Experience timeline
- `skills` - User skills
- `user_preferences` - Hobbies, interests, preferences
- `documents` - Document metadata (files stored in GridFS)

## Directory Structure

```
Backend_Node.js/src/
├── models/
│   ├── profile.model.js
│   ├── address.model.js
│   ├── identity.model.js
│   ├── education.model.js
│   ├── experience.model.js
│   ├── skill.model.js
│   ├── userPreference.model.js
│   └── document.model.js
├── controllers/
│   ├── profile.controller.js
│   ├── education.controller.js
│   ├── experience.controller.js
│   ├── skill.controller.js
│   ├── document.controller.js
│   └── preference.controller.js
├── routes/
│   ├── profile.routes.js
│   ├── education.routes.js
│   ├── experience.routes.js
│   ├── skill.routes.js
│   ├── document.routes.js
│   └── preference.routes.js
├── middleware/
│   └── upload.middleware.js
└── utils/
    └── ageCalculator.js
```

## API Endpoints

### Profile Routes (`/api/profile`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile/:userId` | Get user profile |
| POST | `/api/profile` | Create profile |
| PUT | `/api/profile/:userId` | Update profile |
| DELETE | `/api/profile/:userId` | Delete profile |

### Education Routes (`/api/education`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/education/:userId` | Get all education entries |
| GET | `/api/education/:userId/:id` | Get single education entry |
| POST | `/api/education` | Add education entry |
| PUT | `/api/education/:id` | Update education entry |
| DELETE | `/api/education/:id` | Delete education entry |

### Experience Routes (`/api/experience`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/experience/:userId` | Get all experience entries |
| GET | `/api/experience/:userId/:id` | Get single experience entry |
| POST | `/api/experience` | Add experience entry |
| PUT | `/api/experience/:id` | Update experience entry |
| DELETE | `/api/experience/:id` | Delete experience entry |

### Skill Routes (`/api/skill`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/skill/:userId` | Get all skills |
| POST | `/api/skill` | Add skill |
| PUT | `/api/skill/:id` | Update skill |
| DELETE | `/api/skill/:id` | Delete skill |

### Document Routes (`/api/document`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/document/:userId` | Get all documents |
| GET | `/api/document/:userId/:id` | Get single document metadata |
| POST | `/api/document` | Upload document (multipart/form-data) |
| DELETE | `/api/document/:id` | Delete document |
| GET | `/api/document/file/:id` | Download/view file from GridFS |

### Preference Routes (`/api/preference`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/preference/:userId` | Get user preferences |
| POST | `/api/preference` | Create preferences |
| PUT | `/api/preference/:userId` | Update preferences |

## Data Models

### Profile Model
```javascript
{
  _id: String,              // PROF001, PROF002, etc.
  userId: String,           // Reference to users collection (USER001)
  fatherName: String,
  motherName: String,
  dateOfBirth: Date,
  age: Number,              // Auto-calculated from DOB (years only)
  gender: String,           // enum: ['Male', 'Female', 'Other', 'Prefer not to say']
  bloodGroup: String,       // enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  profession: String,
  category: String,         // enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Other']
  income: Number,           // Annual income
  disability: {
    hasDisability: Boolean,
    type: String,
    percentage: Number      // 0-100
  },
  completenessScore: Number, // 0-100, auto-calculated
  createdAt: Date,
  updatedAt: Date
}
```

### Address Model
```javascript
{
  _id: String,              // ADDR001, ADDR002, etc.
  userId: String,           // Reference to users collection
  villageTown: String,
  pinCode: String,
  city: String,
  state: String,
  country: { type: String, default: 'India' },
  createdAt: Date,
  updatedAt: Date
}
```

### Identity Model (JSON format with images)
```javascript
{
  _id: String,              // IDEN001, IDEN002, etc.
  userId: String,
  ids: [
    {
      idType: String,       // 'Aadhaar', 'PAN', 'Voter Card', 'Driving License', 'ABC ID'
      idNumber: String,
      imageFileId: String,  // GridFS file reference
      verified: { type: Boolean, default: false }
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### Education Model (varies by type)
```javascript
{
  _id: String,              // EDU001, EDU002, etc.
  userId: String,
  educationType: String,    // enum: ['Primary', 'Secondary', 'Higher Secondary', 'Under-Graduate', 'Post Graduate', 'Phd']
  
  // Common fields
  boardUniversity: String,
  passingYear: Number,
  percentageCgpa: Number,
  
  // Primary/Secondary
  schoolName: String,
  
  // Higher Secondary
  stream: String,           // 'Science', 'Commerce', 'Arts'
  subjects: [String],
  
  // Under-Graduate / Post Graduate
  degree: String,           // 'B.Tech', 'B.Sc', 'M.A', etc.
  specialization: String,
  course: String,
  institution: String,
  
  // PhD
  thesisTitle: String,
  supervisor: String,
  researchArea: String,
  
  // Documents
  marksheetFileId: String,  // GridFS reference
  certificateFileId: String, // GridFS reference
  
  createdAt: Date,
  updatedAt: Date
}
```

### Experience Model
```javascript
{
  _id: String,              // EXP001, EXP002, etc.
  userId: String,
  organization: String,
  role: String,
  employmentStatus: String, // 'Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'
  startDate: Date,
  endDate: Date,            // null if currently working
  durationMonths: Number,   // Auto-calculated
  description: String,
  experienceCertificateFileId: String, // GridFS reference
  currentlyWorking: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Skill Model
```javascript
{
  _id: String,              // SKL001, SKL002, etc.
  userId: String,
  skillType: String,        // 'Technical', 'Soft', 'Language', 'Certification'
  name: String,
  proficiency: String,      // 'Beginner', 'Intermediate', 'Advanced', 'Expert'
  details: String,
  createdAt: Date,
  updatedAt: Date
}
```

### User Preference Model
```javascript
{
  _id: String,              // PREF001, PREF002, etc.
  userId: String,
  hobbies: [String],
  interests: [String],
  preferredLanguages: [String],
  locationPreferences: [String],
  opportunityTypePreferences: [String],
  salaryRange: {
    min: Number,
    max: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Document Model (metadata, files in GridFS)
```javascript
{
  _id: String,              // DOC001, DOC002, etc.
  userId: String,
  documentType: String,     // 'Aadhaar', 'PAN', 'Voter Card', 'Driving License', 
                            // 'Passport', 'Marksheet', 'Experience Certificate',
                            // 'Income Certificate', 'Disability Certificate',
                            // 'Birth Certificate', 'Signature', 'Domicile Certificate'
  fileName: String,
  fileSize: Number,
  mimeType: String,
  gridFsFileId: String,     // Reference to GridFS file
  verificationStatus: { type: String, default: 'Unverified' }, // 'Unverified', 'Pending', 'Verified', 'Rejected'
  uploadedAt: Date,
  updatedAt: Date
}
```

## Utility Functions

### Age Calculator (`utils/ageCalculator.js`)
```javascript
// Calculate age in years from DOB
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};
```

### Completeness Score Calculator
```javascript
// Weighted field completion calculation
const calculateCompleteness = (profile) => {
  const weights = {
    fatherName: 8,
    motherName: 8,
    dateOfBirth: 10,
    gender: 8,
    bloodGroup: 5,
    profession: 8,
    category: 8,
    income: 8,
    disability: 5,
    address: 10,
    education: 10,
    experience: 5,
    skills: 5,
    documents: 2
  };
  // Calculate based on filled fields
  // Return 0-100
};
```

## Implementation Order

1. **Models** - Create all Mongoose models
2. **Utilities** - Age calculator, completeness calculator
3. **Profile CRUD** - Basic profile operations
4. **Address CRUD** - Address operations
5. **Identity CRUD** - Government IDs with JSON storage
6. **Education CRUD** - Education timeline with type-specific fields
7. **Experience CRUD** - Experience timeline
8. **Skill CRUD** - Skills management
9. **Document Upload** - GridFS integration for file storage
10. **Preferences CRUD** - User preferences
11. **Routes** - Connect all endpoints
12. **Integration** - Update app.js with new routes

## Validation Rules

- `dateOfBirth`: Valid date, must be in past
- `age`: Auto-calculated, not user input
- `gender`: Must be one of enum values
- `bloodGroup`: Must be valid blood group
- `pinCode`: 6 digits (Indian format)
- `income`: Positive number
- `disability.percentage`: 0-100
- `education.passingYear`: 1900 to current year + 10
- `experience.endDate`: Must be after startDate (if provided)
- `fileSize`: Max 5MB
- `mimeType`: Only image/jpeg, image/png, application/pdf

## Security

- All endpoints require authentication (JWT)
- Users can only access/modify their own data
- File uploads validated for type and size
- ID numbers stored as plain text (per project requirement)

## Dependencies to Add

```bash
npm install multer multer-gridfs-storage gridfs-stream
```

## Testing Checklist

- [ ] Create profile with all fields
- [ ] Auto-calculate age from DOB
- [ ] Update profile fields
- [ ] Add multiple education entries (different types)
- [ ] Add multiple experience entries
- [ ] Add/remove skills
- [ ] Upload documents (JPEG, PNG, PDF) up to 5MB
- [ ] Store government IDs as JSON with images
- [ ] Calculate completeness score
- [ ] CRUD operations on preferences
- [ ] Users can only access their own data
