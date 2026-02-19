import User from "../models/User.js";
import bcrypt from "bcrypt"; // To encrypt passwords

export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role, profilePhoto } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Create and Save User
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      passwordHash,
      role,
      profilePhoto: profilePhoto || "" // Stores the photo URL or empty string
    });

    // 5. Respond with the user data (excluding the password for security)
    const { passwordHash: _, ...userWithoutPassword } = user._doc;
    res.status(201).json(userWithoutPassword);

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default registerUser;