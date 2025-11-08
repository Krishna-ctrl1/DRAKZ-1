import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["admin", "advisor", "user"],
        default: "user",
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

 const User = mongoose.model("User", userSchema);
 export default User;
