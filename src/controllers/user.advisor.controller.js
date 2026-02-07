const Person = require('../models/people.model.js');
const AdvisorRequest = require('../models/advisorRequest.model.js');

// Get all available advisors for users to browse
exports.getAvailableAdvisors = async (req, res) => {
    try {
        // Find all advisors with role 'advisor'
        // Only exclude those who explicitly set isAcceptingClients to false
        const advisors = await Person.find({
            role: 'advisor'
        })
            .select('name email advisorProfile phone created_at')
            .sort({ created_at: -1 });

        // Filter out advisors who explicitly opt out
        const availableAdvisors = advisors.filter(advisor => {
            // If isAcceptingClients is explicitly false, exclude
            // Otherwise, include (covers true, undefined, null)
            return advisor.advisorProfile?.isAcceptingClients !== false;
        });

        console.log(`📋 Found ${availableAdvisors.length} available advisors out of ${advisors.length} total`);
        res.json(availableAdvisors);
    } catch (err) {
        console.error('Error fetching advisors:', err);
        res.status(500).json({ msg: 'Server error fetching advisors' });
    }
};

// Request an advisor
exports.requestAdvisor = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { advisorId, message } = req.body;

        if (!advisorId) {
            return res.status(400).json({ msg: 'Advisor ID is required' });
        }

        // Check if advisor exists
        const advisor = await Person.findOne({
            _id: advisorId,
            role: 'advisor'
        });

        if (!advisor) {
            return res.status(404).json({ msg: 'Advisor not found' });
        }

        // Check if advisor is explicitly not accepting clients
        if (advisor.advisorProfile?.isAcceptingClients === false) {
            return res.status(400).json({ msg: 'Advisor is not accepting clients' });
        }

        // Check if user already has an assigned advisor
        const user = await Person.findById(userId);
        if (user.assignedAdvisor) {
            return res.status(400).json({ msg: 'You already have an assigned advisor' });
        }

        // Check for existing pending request to this advisor
        const existingRequest = await AdvisorRequest.findOne({
            user: userId,
            advisor: advisorId,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ msg: 'You already have a pending request to this advisor' });
        }

        // Create new request
        const newRequest = new AdvisorRequest({
            user: userId,
            advisor: advisorId,
            message: message || ''
        });

        await newRequest.save();
        console.log(`✅ New advisor request from ${user.name} to ${advisor.name}`);

        res.status(201).json({
            msg: 'Request sent successfully',
            request: newRequest
        });
    } catch (err) {
        console.error('Error requesting advisor:', err);
        res.status(500).json({ msg: 'Server error processing request' });
    }
};

// Get user's advisor status (assigned advisor + pending requests)
exports.getMyAdvisorStatus = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ msg: 'User not authenticated' });
        }

        const user = await Person.findById(userId)
            .populate('assignedAdvisor', 'name email advisorProfile');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Get pending requests
        const pendingRequests = await AdvisorRequest.find({
            user: userId,
            status: 'pending'
        }).populate('advisor', 'name email advisorProfile');

        res.json({
            assignedAdvisor: user.assignedAdvisor || null,
            pendingRequests
        });
    } catch (err) {
        console.error('Error fetching advisor status:', err);
        res.status(500).json({ msg: 'Server error fetching status' });
    }
};

// Cancel a pending request
exports.cancelRequest = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { requestId } = req.params;

        const request = await AdvisorRequest.findOne({
            _id: requestId,
            user: userId,
            status: 'pending'
        });

        if (!request) {
            return res.status(404).json({ msg: 'Request not found or already processed' });
        }

        await AdvisorRequest.findByIdAndDelete(requestId);

        res.json({ msg: 'Request cancelled successfully' });
    } catch (err) {
        console.error('Error cancelling request:', err);
        res.status(500).json({ msg: 'Server error cancelling request' });
    }
};
