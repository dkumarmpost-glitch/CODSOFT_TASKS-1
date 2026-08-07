const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User Schema
 * - name: user's display name
 * - email: unique email used for login
 * - password: hashed password (never stored in plain text)
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default in queries
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Hash the password before saving.
 * Runs only when the password field is modified.
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Compare a plain text password with the hashed password.
 * @param {string} enteredPassword - Plain text password from login request
 * @returns {Promise<boolean>} True if passwords match
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
