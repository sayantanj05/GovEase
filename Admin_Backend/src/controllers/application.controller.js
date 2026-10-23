const Application = require('../models/application.model');
const Exam = require('../models/exam.model');
const Opportunity = require('../models/opportunity.model');
const User = require('../models/user.model');

exports.listApplications = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, targetType, q } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (targetType) filter.targetType = targetType;

    if (q) {
      const users = await User.find({
        $or: [
          { fullName: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } }
        ]
      }).select('_id').lean();
      const userIds = users.map(u => u._id);
      filter.$or = [
        { user: { $in: userIds } },
        { targetId: { $regex: q, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      Application.find(filter)
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'fullName email')
        .populate('targetId', 'title examName examBody organization')
        .lean(),
      Application.countDocuments(filter)
    ]);

    res.json({
      success: true,
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('user', 'fullName email phone')
      .populate('targetId', 'title examName examBody organization')
      .lean();

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, item: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;
    const validStatuses = ['UNDER_REVIEW', 'APPROVED', 'REJECTED'];
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
      UNDER_REVIEW: ['APPROVED', 'REJECTED']
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

    await application.populate('user', 'fullName email');
    await application.populate('targetId', 'title examName examBody organization');

    res.json({ success: true, message: 'Application status updated', item: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.json({ success: true, message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getApplicationStats = async (req, res) => {
  try {
    const { targetType, targetId } = req.query;
    const filter = {};
    if (targetType) filter.targetType = targetType;
    if (targetId) filter.targetId = targetId;

    const stats = await Application.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const result = { APPLIED: 0, UNDER_REVIEW: 0, APPROVED: 0, REJECTED: 0, total: 0 };
    stats.forEach(s => {
      result[s._id] = s.count;
      result.total += s.count;
    });

    res.json({ success: true, item: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getApplicationsForTarget = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const { status } = req.query;

    if (!['exam', 'opportunity'].includes(targetType)) {
      return res.status(400).json({ success: false, message: 'Invalid targetType' });
    }

    const filter = { targetType, targetId };
    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .sort({ submittedAt: -1 })
      .populate('user', 'fullName email phone')
      .lean();

    res.json({ success: true, items: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};