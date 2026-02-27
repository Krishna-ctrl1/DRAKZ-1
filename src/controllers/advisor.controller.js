const Person = require('../models/people.model.js');
const Spending = require('../models/Spending.js');
const AdvisorRequest = require('../models/advisorRequest.model.js');
const mongoose = require('mongoose');

// Helper: Compute financial data for a user from Spending
const computeFinancialData = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const summary = await Spending.aggregate([
    { $match: { user: userObjectId } },
    {
      $project: {
        amount: { $ifNull: ['$amount', 0] },
        typeLower: { $toLower: '$type' },
      },
    },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: { $cond: [{ $eq: ['$typeLower', 'income'] }, '$amount', 0] },
        },
        totalExpense: {
          $sum: { $cond: [{ $eq: ['$typeLower', 'expense'] }, '$amount', 0] },
        },
      },
    },
  ]);

  if (summary.length > 0) {
    return {
      monthlyIncome: summary[0].totalIncome,
      totalExpense: summary[0].totalExpense,
      balance: summary[0].totalIncome - summary[0].totalExpense
    };
  }
  return { monthlyIncome: 0, totalExpense: 0, balance: 0 };
};

// Get clients for advisor dashboard - with REAL financial data
exports.getClients = async (req, res) => {
  try {
    const advisorId = req.user?.id;

    console.log(`👥 Fetching clients for advisor: ${advisorId}`);

    // Convert to ObjectId for proper matching
    const advisorObjectId = new mongoose.Types.ObjectId(advisorId);

    // Fetch users assigned to this advisor
    const clients = await Person.find({
      role: 'user',
      assignedAdvisor: advisorObjectId
    })
      .select('-password')
      .sort({ created_at: -1 });

    console.log(`👥 Found ${clients.length} assigned clients`);

    // Enrich with real financial data from Spending
    const enrichedClients = await Promise.all(
      clients.map(async (client) => {
        const financialData = await computeFinancialData(client._id);
        return {
          ...client.toObject(),
          monthlyIncome: financialData.monthlyIncome,
          totalExpense: financialData.totalExpense,
          balance: financialData.balance
        };
      })
    );

    res.json(enrichedClients);
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ msg: 'Server error fetching clients' });
  }
};

// Get all available advisors (for users to browse)
exports.getAdvisors = async (req, res) => {
  try {
    const advisors = await Person.find({
      role: 'advisor',
      'advisorProfile.isAcceptingClients': true
    })
      .select('name email advisorProfile created_at')
      .sort({ created_at: -1 });

    res.json(advisors);
  } catch (err) {
    console.error('Error fetching advisors:', err);
    res.status(500).json({ msg: 'Server error fetching advisors' });
  }
};

// Get pending requests for advisor
exports.getAdvisorRequests = async (req, res) => {
  try {
    const advisorId = req.user?.id;

    console.log(`📨 Fetching requests for advisor: ${advisorId}`);

    // Convert to ObjectId for proper matching
    const advisorObjectId = new mongoose.Types.ObjectId(advisorId);

    const requests = await AdvisorRequest.find({
      advisor: advisorObjectId,
      status: 'pending'
    })
      .populate('user', 'name email phone occupation creditScore created_at')
      .sort({ requestedAt: -1 });

    console.log(`📨 Found ${requests.length} pending requests`);
    res.json(requests);
  } catch (err) {
    console.error('Error fetching advisor requests:', err);
    res.status(500).json({ msg: 'Server error fetching requests' });
  }
};

// Respond to a client request (approve/decline)
exports.respondToRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'approve' or 'decline'
    const advisorId = req.user?.id;

    if (!['approve', 'decline'].includes(action)) {
      return res.status(400).json({ msg: 'Invalid action. Use "approve" or "decline"' });
    }

    const request = await AdvisorRequest.findOne({
      _id: requestId,
      advisor: advisorId,
      status: 'pending'
    });

    if (!request) {
      return res.status(404).json({ msg: 'Request not found or already processed' });
    }

    // Update request status
    request.status = action === 'approve' ? 'approved' : 'declined';
    request.respondedAt = new Date();
    await request.save();

    // If approved, assign advisor to user
    if (action === 'approve') {
      await Person.findByIdAndUpdate(request.user, {
        assignedAdvisor: advisorId
      });

      // Decline any other pending requests from this user
      await AdvisorRequest.updateMany(
        { user: request.user, status: 'pending', _id: { $ne: requestId } },
        { status: 'declined', respondedAt: new Date() }
      );
    }

    res.json({
      msg: action === 'approve' ? 'Client approved successfully' : 'Request declined',
      request
    });
  } catch (err) {
    console.error('Error responding to request:', err);
    res.status(500).json({ msg: 'Server error processing request' });
  }
};

// Get advisor's current stats
exports.getAdvisorStats = async (req, res) => {
  try {
    const advisorId = req.user?.id;
    const advisorObjectId = new mongoose.Types.ObjectId(advisorId);

    // Get basic counts
    const [clientCount, pendingRequests] = await Promise.all([
      Person.countDocuments({ assignedAdvisor: advisorObjectId }),
      AdvisorRequest.countDocuments({ advisor: advisorObjectId, status: 'pending' })
    ]);

    // Get all client IDs for this advisor
    const clients = await Person.find({ assignedAdvisor: advisorObjectId }).select('_id');
    const clientIds = clients.map(c => c._id);

    // Compute total income across all clients
    let totalClientIncome = 0;
    if (clientIds.length > 0) {
      const incomeAggregation = await Spending.aggregate([
        { $match: { user: { $in: clientIds } } },
        {
          $project: {
            amount: { $ifNull: ['$amount', 0] },
            typeLower: { $toLower: '$type' }
          }
        },
        {
          $group: {
            _id: null,
            totalIncome: {
              $sum: { $cond: [{ $eq: ['$typeLower', 'income'] }, '$amount', 0] }
            }
          }
        }
      ]);

      if (incomeAggregation.length > 0) {
        totalClientIncome = incomeAggregation[0].totalIncome;
      }
    }

    console.log(`📊 Advisor stats - Clients: ${clientCount}, Pending: ${pendingRequests}, Total Income: ${totalClientIncome}`);

    res.json({
      totalClients: clientCount,
      pendingRequests: pendingRequests,
      totalClientIncome: totalClientIncome,
      sessionsThisMonth: 0 // Placeholder - would need session tracking
    });
  } catch (err) {
    console.error('Error fetching advisor stats:', err);
    res.status(500).json({ msg: 'Server error fetching stats' });
  }
};

// Get logged-in advisor's own profile
exports.getAdvisorProfile = async (req, res) => {
  try {
    const advisor = await Person.findById(req.user?.id).select('-password');
    if (!advisor) return res.status(404).json({ msg: 'Advisor not found' });
    res.json(advisor);
  } catch (err) {
    console.error('Error fetching advisor profile:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update logged-in advisor's profile
exports.updateAdvisorProfile = async (req, res) => {
  try {
    const { name, phone, bio, specialization, price, experience, certificate, contactEmail, contactPhone, isAcceptingClients } = req.body;

    const updateFields = { name, phone };
    updateFields['advisorProfile.bio'] = bio;
    updateFields['advisorProfile.specialization'] = specialization;
    updateFields['advisorProfile.price'] = price;
    updateFields['advisorProfile.experience'] = experience;
    updateFields['advisorProfile.certificate'] = certificate;
    updateFields['advisorProfile.contactEmail'] = contactEmail;
    updateFields['advisorProfile.contactPhone'] = contactPhone;
    if (typeof isAcceptingClients === 'boolean') {
      updateFields['advisorProfile.isAcceptingClients'] = isAcceptingClients;
    }

    // Remove undefined fields
    Object.keys(updateFields).forEach(k => updateFields[k] === undefined && delete updateFields[k]);

    const updated = await Person.findByIdAndUpdate(
      req.user?.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ msg: 'Profile updated successfully', advisor: updated });
  } catch (err) {
    console.error('Error updating advisor profile:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get a specific client's financial report (for Clients Hub page)
exports.getClientReport = async (req, res) => {
  try {
    const { userId } = req.params;
    const advisorId = req.user?.id;

    // Verify this client is actually assigned to this advisor
    const client = await Person.findOne({
      _id: userId,
      assignedAdvisor: new mongoose.Types.ObjectId(advisorId)
    }).select('-password');

    if (!client) return res.status(404).json({ msg: 'Client not found or not assigned to you' });

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get spending breakdown by category
    const categoryBreakdown = await Spending.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: { category: '$category', type: { $toLower: '$type' } },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Get monthly income vs expense for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Spending.aggregate([
      { $match: { user: userObjectId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: { $toLower: '$type' }
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Overall totals
    const totals = await Spending.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: { $toLower: '$type' },
          total: { $sum: '$amount' }
        }
      }
    ]);

    const income = totals.find(t => t._id === 'income')?.total || 0;
    const expense = totals.find(t => t._id === 'expense')?.total || 0;

    res.json({
      client,
      financials: { totalIncome: income, totalExpense: expense, balance: income - expense },
      categoryBreakdown,
      monthlyTrend
    });
  } catch (err) {
    console.error('Error fetching client report:', err);
    res.status(500).json({ msg: 'Server error fetching client report' });
  }
};

// Remove / unassign a client from this advisor
exports.removeClient = async (req, res) => {
  try {
    const { userId } = req.params;
    const advisorId = req.user?.id;

    const client = await Person.findOne({
      _id: userId,
      assignedAdvisor: new mongoose.Types.ObjectId(advisorId)
    });

    if (!client) return res.status(404).json({ msg: 'Client not found or not assigned to you' });

    await Person.findByIdAndUpdate(userId, { $set: { assignedAdvisor: null } });

    console.log(`🚫 Removed client ${userId} from advisor ${advisorId}`);
    res.json({ msg: 'Client removed successfully' });
  } catch (err) {
    console.error('Error removing client:', err);
    res.status(500).json({ msg: 'Server error removing client' });
  }
};

// Get aggregated analytics for advisor's analytics page
exports.getAdvisorAnalytics = async (req, res) => {
  try {
    const advisorId = req.user?.id;
    const advisorObjectId = new mongoose.Types.ObjectId(advisorId);

    const clients = await Person.find({ assignedAdvisor: advisorObjectId }).select('_id name creditScore riskProfile occupation created_at');
    const clientIds = clients.map(c => c._id);

    // Total income & expense across all clients
    let totalIncome = 0, totalExpense = 0;
    let categoryData = [];
    let monthlyData = [];

    if (clientIds.length > 0) {
      const totals = await Spending.aggregate([
        { $match: { user: { $in: clientIds } } },
        {
          $group: {
            _id: { $toLower: '$type' },
            total: { $sum: '$amount' }
          }
        }
      ]);
      totalIncome = totals.find(t => t._id === 'income')?.total || 0;
      totalExpense = totals.find(t => t._id === 'expense')?.total || 0;

      // Top expense categories across all clients
      categoryData = await Spending.aggregate([
        { $match: { user: { $in: clientIds }, $expr: { $eq: [{ $toLower: '$type' }, 'expense'] } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 6 }
      ]);

      // Monthly trend (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      monthlyData = await Spending.aggregate([
        { $match: { user: { $in: clientIds }, date: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: { $toLower: '$type' } },
            total: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);
    }

    // Risk profile distribution
    const riskDistribution = clients.reduce((acc, c) => {
      const risk = c.riskProfile || 'Moderate';
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {});

    // Average credit score
    const avgCreditScore = clients.length > 0
      ? Math.round(clients.reduce((sum, c) => sum + (c.creditScore || 0), 0) / clients.length)
      : 0;

    // Pending requests count
    const pendingCount = await AdvisorRequest.countDocuments({ advisor: advisorObjectId, status: 'pending' });

    res.json({
      totalClients: clients.length,
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      avgCreditScore,
      pendingRequests: pendingCount,
      riskDistribution,
      categoryData,
      monthlyData,
      clients: clients.map(c => ({ name: c.name, creditScore: c.creditScore, riskProfile: c.riskProfile, occupation: c.occupation, joinedAt: c.created_at }))
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ msg: 'Server error fetching analytics' });
  }
};