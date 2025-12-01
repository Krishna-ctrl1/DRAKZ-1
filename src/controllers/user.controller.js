const mongoose = require('mongoose');
const Person = require('../models/people.model.js');
const bcrypt = require('bcryptjs');
const os = require('os');

// 1. GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await Person.find().select('-password'); // Don't send passwords to frontend
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// 2. ADD NEW USER
exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  
  try {
    // Basic Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // Check for existing user
    const existingUser = await Person.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newPerson = new Person({
      name,
      email,
      password: hashedPassword,
      role
    });

    const savedPerson = await newPerson.save();
    
    // Remove password before sending back
    const userResponse = savedPerson.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// 3. EDIT USER
exports.updateUser = async (req, res) => {
  const { name, email, role, password } = req.body;
  
  try {
    // Build update object dynamically
    const updateFields = { name, email, role };

    // Only hash and update password if a new one is provided
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    const updatedPerson = await Person.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true } // Return the updated doc
    ).select('-password');

    res.json(updatedPerson);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// 4. DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    await Person.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// 5. GET DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
  try {
    // A. Total Users
    const totalUsers = await Person.countDocuments();

    // B. New Users Today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const newUsersToday = await Person.countDocuments({
      created_at: { $gte: startOfDay }
    });

    const dbStats = await mongoose.connection.db.stats();
    const dataSizeBytes = dbStats.dataSize; // Size in bytes
    
    // Convert bytes to readable format (KB or MB)
    let dataUsedString = "0 KB";
    if (dataSizeBytes > 1024 * 1024) {
      dataUsedString = `${(dataSizeBytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      dataUsedString = `${(dataSizeBytes / 1024).toFixed(2)} KB`;
    }

    res.json({
      totalUsers,
      newUsersToday,
      dataUsed: dataUsedString
    });

  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ msg: 'Server Error fetching stats' });
  }
};

function getCpuInfo() {
  const cpus = os.cpus();
  let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;

  for (const cpu of cpus) {
    user += cpu.times.user;
    nice += cpu.times.nice;
    sys += cpu.times.sys;
    idle += cpu.times.idle;
    irq += cpu.times.irq;
  }

  return {
    idle,
    total: user + nice + sys + idle + irq
  };
}

// 6. GET REAL SERVER METRICS (Improved Sensitivity)
exports.getServerMetrics = async (req, res) => {
  try {
    // 1. Take initial snapshot
    const start = getCpuInfo();

    // 2. Wait 500ms (Half a second) to capture more activity
    // This makes the API slower but the data much more accurate
    await new Promise(resolve => setTimeout(resolve, 500));

    // 3. Take second snapshot
    const end = getCpuInfo();

    // 4. Calculate difference
    const idleDiff = end.idle - start.idle;
    const totalDiff = end.total - start.total;

    // 5. Calculate Percentage
    // (1 - fraction_idle) * 100
    const rawPercentage = totalDiff === 0 ? 0 : ((1 - (idleDiff / totalDiff)) * 100);

    // 6. Formatting
    // Return 2 decimal places (e.g., 1.25) so it doesn't just show 0
    const formattedPercentage = parseFloat(rawPercentage.toFixed(2));

    res.json({ cpuUsage: formattedPercentage });
  } catch (err) {
    console.error("Metric Error:", err);
    res.status(500).json({ msg: 'Server Error' });
  }
};