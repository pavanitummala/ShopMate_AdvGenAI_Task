const bcrypt = require("bcrypt");
const { getDB } = require("../config/db");
const { sendVerificationMail, sendEmail } = require("../services/sendermail");
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone_number } = req.body;
    const db = getDB();
    const normalizedEmail = email.toLowerCase();
    const existingUser = await db
      .collection("users")
      .findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.collection("users").insertOne({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone_number: phone_number || "",
      role: role || "user",
      isVerified: false,
      createdAt: new Date(),
    });
    const token = jwt.sign(
      {
        userId: result.insertedId,
        email: normalizedEmail,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    await sendVerificationMail(normalizedEmail, name, token);
    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
const jwt = require("jsonwebtoken");
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    "access_secret_key",
    { expiresIn: "15m" },
  );
};
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    "refresh_secret_key",
    { expiresIn: "15m" },
  );
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const db = getDB();

    const user = await db.collection("users").findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }
    if (!user.isVerified) {
      return res.status(401).json({message: "Please verify your email before logging in."})
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await db
      .collection("users")
      .updateOne({ _id: user._id }, { $set: { refresh_token: refreshToken } });
    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};
const refreshUserToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token is required." });
    }
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, "refresh_secret_key");
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token." });
    }
    const db = getDB();
    const user = await db
      .collection("users")
      .findOne({ email: decoded.email, refresh_token: refreshToken });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Refresh token not valid or user not found. " });
    }
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    await db
      .collection("users")
      .updateOne(
        { _id: user._id },
        { $set: { refresh_token: newRefreshToken } },
      );
    res.status(200).json({
      acessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(500).json({
      message: "server error during refresh",
      error: error.message,
    });
  }
};                                                                                             
module.exports = { loginUser, registerUser, refreshUserToken };
