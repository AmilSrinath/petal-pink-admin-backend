import express from "express";
import multer from "multer";
import db from "../utils/db.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateRecoveryCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post("/forgotPassword", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const resetCode = generateRecoveryCode();

  const query =
      "UPDATE petal_pink_user_tb SET reset_code = ?, reset_code_expiry = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE email = ?";

  try {
    const [result] = await db.query(query, [resetCode, email]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const mailOptions = {
      to: email,
      subject: "Password Reset Code",
      text: `Do not share this email with anyone. Your password reset code is: ${resetCode}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Error sending reset code email." });
      }

      console.log("Email sent:", info.response);
      res.status(200).json({ message: "Reset code sent successfully." });
    });
  } catch (err) {
    console.error("Error saving reset code in the database:", err);
    return res.status(500).json({ message: "Error saving reset code in the database." });
  }
});

router.post("/verifyResetCode", async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Email and code are required." });
  }

  const query =
      "SELECT reset_code, reset_code_expiry FROM petal_pink_user_tb WHERE email = ?";

  try {
    const [results] = await db.query(query, [email]);

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const { reset_code, reset_code_expiry } = results[0];

    if (reset_code !== code) {
      return res.status(400).json({ message: "Invalid reset code." });
    }

    if (new Date(reset_code_expiry) < new Date()) {
      return res.status(400).json({ message: "Reset code has expired." });
    }

    res.status(200).json({
      message: "Code verified successfully. Proceed to reset password.",
    });
  } catch (err) {
    console.error("Error fetching reset code from the database:", err);
    return res.status(500).json({ message: "Error fetching reset code from the database." });
  }
});

router.put("/resetPassword", async (req, res) => {
  const { email, password, code } = req.body;

  if (!email || !password || !code) {
    return res.status(400).json({ message: "Email, password, and reset code are required." });
  }

  const query =
      "SELECT reset_code, reset_code_expiry FROM petal_pink_user_tb WHERE email = ?";

  try {
    const [results] = await db.query(query, [email]);

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const { reset_code, reset_code_expiry } = results[0];

    if (reset_code !== code) {
      return res.status(400).json({ message: "Invalid reset code." });
    }

    if (new Date(reset_code_expiry) < new Date()) {
      return res.status(400).json({ message: "Reset code has expired." });
    }

    const updateQuery =
        "UPDATE petal_pink_user_tb SET password = ?, reset_code = NULL, reset_code_expiry = NULL WHERE email = ?";

    await db.query(updateQuery, [password, email]);
    res.status(200).json({ message: "Password reset successfully." });
  } catch (err) {
    console.error("Error updating password in the database:", err);
    return res.status(500).json({ message: "Error updating password in the database." });
  }
});

router.put("/updatePassword/:email", async (req, res) => {
  const email = req.params.email;
  const { password } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required." });
  }

  const query = "UPDATE petal_pink_user_tb SET password = ? WHERE email = ?";

  try {
    const [result] = await db.query(query, [password, email]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    console.log("Password updated successfully.");
    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Error updating password in the database:", err);
    return res.status(500).json({ message: "Error updating password in the database." });
  }
});

router.put("/updateProfilePicture/:email", upload.single("image"), async (req, res) => {
  const email = req.params.email;
  const image = req.file;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  if (!image) {
    return res.status(400).json({ message: "Image is required." });
  }

  const imageBase64 = image.buffer.toString("base64");

  const query = "UPDATE petal_pink_user_tb SET image_url = ? WHERE email = ?";

  try {
    const [result] = await db.query(query, [imageBase64, email]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "Profile picture updated successfully." });
  } catch (err) {
    console.error("Error updating profile picture in the database:", err);
    return res.status(500).json({ message: "Error updating profile picture in the database." });
  }
});

router.post("/saveUser", upload.single("image"), async (req, res) => {
  const {
    employeeId,
    email,
    password,
    name,
    nic,
    role,
    status = 1,
    visible = 1,
  } = req.body;
  const image = req.file;

  if (!employeeId || !email || !password || !name || !nic || !role) {
    return res.status(400).json({ message: "All fields are required." });
  }

  let imageBase64 = null;
  if (image) {
    imageBase64 = image.buffer.toString("base64");
  }

  const generateNextUserId = (lastId) => {
    if (!lastId) {
      return "U001";
    }
    const numericPart = parseInt(lastId.replace("U", ""), 10);
    const nextId = numericPart + 1;
    return "U" + String(nextId).padStart(3, "0");
  };

  const getLastUserIdQuery = `SELECT user_id FROM petal_pink_user_tb ORDER BY user_id DESC LIMIT 1`;

  try {
    const [result] = await db.query(getLastUserIdQuery);
    const lastUserId = result.length ? result[0].user_id : null;
    const newUserId = generateNextUserId(lastUserId);

    const insertUserQuery = `INSERT INTO petal_pink_user_tb (user_id, employee_id, email, password, role, status, visible, name, nic, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await db.query(insertUserQuery, [
      newUserId,
      employeeId,
      email,
      password,
      role,
      status,
      visible,
      name,
      nic,
      imageBase64,
    ]);

    res.status(201).json({ message: "User saved successfully." });
  } catch (err) {
    console.error("Error saving user to the database:", err);
    return res.status(500).json({ message: "Error saving user to the database." });
  }
});

router.get("/getAllData", async (req, res) => {
  const query = "SELECT * FROM petal_pink_user_tb WHERE visible = ?";

  try {
    const [results] = await db.query(query, [1]);
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching data from the database:", err);
    return res.status(500).json({ message: "Error fetching data from the database." });
  }
});

router.put("/updateUser/:user_id", async (req, res) => {
  const userId = req.params.user_id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  const { employeeId, email, role, status = 1, visible = 1 } = req.body;

  if (!email || !role) {
    return res.status(400).json({ message: "Please fill all fields to update the user." });
  }

  const query =
      "UPDATE petal_pink_user_tb SET employee_id = ?, email = ?, role = ?, status = ?, visible = ? WHERE user_id = ?";

  try {
    const [result] = await db.query(query, [employeeId, email, role, status, visible, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User updated successfully." });
  } catch (err) {
    console.error("Error updating user in the database:", err);
    return res.status(500).json({ message: "Error updating user in the database." });
  }
});

router.get("/getUser/:email", async (req, res) => {
  const userId = req.params.email;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  const query =
      "SELECT * FROM petal_pink_user_tb WHERE email = ? AND visible = ?";

  try {
    const [results] = await db.query(query, [userId, 1]);

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    console.error("Error fetching user from the database:", err);
    return res.status(500).json({ message: "Error fetching user from the database." });
  }
});

router.delete("/deleteUser/:user_id", async (req, res) => {
  const userId = req.params.user_id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  const query = "UPDATE petal_pink_user_tb SET visible = 0 WHERE user_id = ?";

  try {
    const [result] = await db.query(query, [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User deleted successfully." });
  } catch (err) {
    console.error("Error deleting user from the database:", err);
    return res.status(500).json({ message: "Error deleting user from the database." });
  }
});

export default router;
