const Application = require('../models/application.model');
const Exam = require('../models/exam.model');
const Opportunity = require('../models/opportunity.model');
const Form = require('../models/form.model');

const generateId = () => `APP_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

exports.submitApplication = async (req, res) => {
  try {
    const { targetType, targetId, formId, formData } = req.body;
    const userId = req.user._id;

    if (!targetType || !targetId) {
      return res.status(400).json({ success: false, message: 'targetType and targetId are required' });
    }

    if (!['exam', 'opportunity'].includes(targetType)) {
      return res.status(400).json({ success: false, message: 'targetType must be exam or opportunity' });
    }

    const target = targetType === 'exam' ? await Exam.findById(targetId) : await Opportunity.findById(targetId);
    if (!target) {
      return res.status(404).json({ success: false, message: `${targetType} not found` });
    }

    let form;
    if (formId) {
      form = await Form.findById(formId);
    } else {
      form = await Form.findOne({ exam: targetId, status: 'active' }).sort({ createdAt: -1 });
    }

    if (!form) {
      return res.status(404).json({ success: false, message: 'No active form found for this exam/opportunity' });
    }

    if (form.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Form is not active' });
    }

    const existingApplication = await Application.findOne({ user: userId, targetType, targetId });
    if (existingApplication) {
      const existingStatus = existingApplication.status;
      if (existingStatus === 'APPLIED' || existingStatus === 'UNDER_REVIEW') {
        return res.status(409).json({
          success: false,
          message: `You have already applied for this. Current status: ${existingStatus}.`
        });
      }
      if (existingStatus === 'APPROVED') {
        return res.status(409).json({
          success: false,
          message: 'You have already been approved for this application.'
        });
      }
      // REJECTED - allow reapplication by updating the existing record
      existingApplication.status = 'APPLIED';
      existingApplication.formId = form._id;
      existingApplication.formData = formData || {};
      existingApplication.submittedAt = new Date();
      existingApplication.reviewedAt = undefined;
      existingApplication.reviewedBy = undefined;
      existingApplication.reviewNotes = undefined;
      await existingApplication.save();

      return res.status(201).json({
        success: true,
        message: 'Application resubmitted successfully after rejection',
        item: existingApplication
      });
    }

    const applicationId = generateId();
    const application = new Application({
      _id: applicationId,
      user: userId,
      targetType,
      targetId,
      formId: form._id,
      formData: formData || {},
      status: 'APPLIED',
      submittedAt: new Date()
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      item: application
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserApplications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, targetType } = req.query;

    const filter = { user: userId };
    if (status) filter.status = status;
    if (targetType) filter.targetType = targetType;

    const applications = await Application.find(filter)
      .sort({ submittedAt: -1 })
      .populate('targetId', 'title examName organization examBody');

    res.json({ success: true, items: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const userId = req.user._id;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.user !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this application' });
    }

    res.json({ success: true, item: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { status, reviewNotes } = req.body;
    const validStatuses = ['UNDER_REVIEW', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const currentStatus = application.status;
    const allowedTransitions = {
      APPLIED: ['UNDER_REVIEW', 'REJECTED'],
      UNDER_REVIEW: ['PENDING_REVIEW', 'REJECTED'],
      PENDING_REVIEW: ['APPROVED', 'REJECTED']
    };

    if (!allowedTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${currentStatus} to ${status}`
      });
    }

    application.status = status;
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;
    if (reviewNotes) application.reviewNotes = reviewNotes;

    await application.save();

    res.json({ success: true, message: 'Application status updated', item: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getApplicationsForTarget = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { targetType, targetId } = req.params;
    const { status } = req.query;

    if (!['exam', 'opportunity'].includes(targetType)) {
      return res.status(400).json({ success: false, message: 'Invalid targetType' });
    }

    const filter = { targetType, targetId };
    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .sort({ submittedAt: -1 })
      .populate('user', 'fullName email phone');

    res.json({ success: true, items: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getApplicationStats = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { targetType, targetId } = req.query;
    const filter = {};
    if (targetType) filter.targetType = targetType;
    if (targetId) filter.targetId = targetId;

    const stats = await Application.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const result = { APPLIED: 0, UNDER_REVIEW: 0, PENDING_REVIEW: 0, APPROVED: 0, REJECTED: 0, total: 0 };
    stats.forEach(s => {
      result[s._id] = s.count;
      result.total += s.count;
    });

    res.json({ success: true, item: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};