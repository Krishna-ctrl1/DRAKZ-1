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