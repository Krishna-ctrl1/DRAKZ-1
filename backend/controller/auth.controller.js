import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export const login = async (req, res) => {
    const { email, password } = req.body;
    console.log("🔑 Login attempt for email:", email); // Incoming request

    try {
        const user = await User.findOne({ email });
        console.log(
            "👤 User lookup:",
            user ? `Found: ${user.email} (role: ${user.role})` : "NOT FOUND"
        ); // User exists?

        if (!user)
            return res.status(400).json({ msg: "Invalid credentials oneeee" });

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("🔒 Password check:", isMatch ? "MATCH" : "MISMATCH"); // Password OK?

        if (!isMatch)
            return res.status(400).json({ msg: "Invalid credentials twooo" });

        // Token generation...
        const token = jwt.sign(
            { id: user._id, role: user.role },
            "JWT_SECRET",
            { expiresIn: "8h" }
        );
        console.log("✅ Login SUCCESS for:", email);

        res.json({
            token,
            user: {
                id: user._id,
                email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (err) {
        console.error("💥 Login error:", err.message);
        res.status(500).json({ msg: "Server error" });
    }
};