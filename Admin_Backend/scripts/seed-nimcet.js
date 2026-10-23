const path = require('path');
if (!process.env.MONGO_URI) {
  require('dotenv').config({ path: path.resolve(__dirname, '../../Backend_Node.js/.env') });
}
require('dotenv').config();
const mongoose = require('mongoose');
const Exam = require('../src/models/exam.model');
const { connectDatabase } = require('../src/config/database');

const seedNIMCET = async () => {
  await connectDatabase();

  const existing = await Exam.findById('NIMCET_2025');
  if (existing) {
    console.log('NIMCET exam already exists');
    return;
  }

  const nimcetExam = new Exam({
    _id: 'NIMCET_2025',
    examName: 'NIMCET',
    examBody: 'National Institutes of Technology (NITs)',
    examCategory: 'Entrance',
    examType: 'Entrance',
    examMode: 'Online',
    totalVacancies: 0,
    applicationFee: 2500,
    subjects: {
      Mathematics: 50,
      AnalyticalAbilityLogicalReasoning: 40,
      ComputerAwareness: 10,
      GeneralEnglish: 20
    },
    totalMarks: 480,
    durationMinutes: 120,
    negativeMarking: true,
    negativeMarkingValue: 1,
    cutoffMarks: 0,
    numberOfAttemptsAllowed: 0,
    ageRelaxation: {
      SC: 5,
      ST: 5,
      OBC: 3,
      PwD: 10
    },
    educationalQualifications: {
      requiredDegree: 'Bachelor\'s degree (3-year full-time/open university)',
      acceptedDegrees: ['B.Sc.', 'B.Sc. (Hons)', 'BCA', 'BIT', 'B.E.', 'B.Tech'],
      mandatorySubjects: ['Mathematics', 'Statistics'],
      minimumMarks: {
        General: '60% or 6.5 CGPA (10-point scale)',
        OBC: '60% or 6.5 CGPA (10-point scale)',
        EWS: '60% or 6.5 CGPA (10-point scale)',
        SC: '55% or 6.0 CGPA (10-point scale)',
        ST: '55% or 6.0 CGPA (10-point scale)',
        PwD: '55% or 6.0 CGPA (10-point scale)'
      },
      finalYearEligible: true,
      finalYearProofDeadline: 'Before admission process'
    },
    physicalRequirements: {},
    applicationStartDate: new Date('2025-03-01'),
    applicationDeadline: new Date('2025-05-15'),
    examDate: new Date('2025-06-15'),
    resultDate: new Date('2025-07-15'),
    scoreValidityYears: 1,
    officialWebsite: 'https://nimcet.in',
    eligibilityRules: {
      nationality: 'Indian citizen only',
      qualifyingDegree: '3-year full-time/open university Bachelor\'s degree (B.Sc., B.Sc. Hons, BCA, BIT) with Mathematics or Statistics as a subject, OR B.E./B.Tech degree',
      minimumMarks: {
        'General/OBC/EWS': '60% marks or 6.5 CGPA (on a 10-point scale)',
        'SC/ST/PwD': '55% marks or 6.0 CGPA (on a 10-point scale)'
      },
      finalYearStudents: 'Eligible to apply if they can provide proof of passing by the specified deadline'
    },
    notificationSent: false,
    status: 'Upcoming',
    isActive: true
  });

  await nimcetExam.save();
  console.log('NIMCET exam created successfully!');
  console.log('Exam ID:', nimcetExam._id);
};

seedNIMCET()
  .catch((error) => {
    console.error('Error seeding NIMCET:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });