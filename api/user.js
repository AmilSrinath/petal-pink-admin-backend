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

//recovery code ek gen krnw math class ek use krnw
const generateRecoveryCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

//req ekk apu gamn generate wenw reset code ek and expiray date ek and it passe ek save wenw it passe thama real process ek wenne
router.post("/forgotPassword", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const resetCode = generateRecoveryCode();

  const query =
    "UPDATE petal_pink_user_tb SET reset_code = ?, reset_code_expiry = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE email = ?";

  db.query(query, [resetCode, email], (err, result) => {
    if (err) {
      console.error("Error saving reset code in the database:", err);
      return res
        .status(500)
        .json({ message: "Error saving reset code in the database." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const mailOptions = {
      to: email,
      subject: "Password Reset Code",
      text: `Do not share this email with anyone.Your password reset code is: ${resetCode}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ message: "Error sending reset code email." });
      }

      console.log("Email sent:", info.response);
      res.status(200).json({ message: "Reset code sent successfully." });
    });
  });
});

router.post("/verifyResetCode", (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Email and code are required." });
  }

  const query =
    "SELECT reset_code, reset_code_expiry FROM petal_pink_user_tb WHERE email = ?";

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error fetching reset code from the database:", err);
      return res
        .status(500)
        .json({ message: "Error fetching reset code from the database." });
    }

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

    res
      .status(200)
      .json({
        message: "Code verified successfully. Proceed to reset password.",
      });
  });
});

router.put("/resetPassword", (req, res) => {
  const { email, password, code } = req.body;

  if (!email || !password || !code) {
    return res
      .status(400)
      .json({ message: "Email, password, and reset code are required." });
  }

  const query =
    "SELECT reset_code, reset_code_expiry FROM petal_pink_user_tb WHERE email = ?";

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error verifying reset code:", err);
      return res.status(500).json({ message: "Error verifying reset code." });
    }

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

    db.query(updateQuery, [password, email], (err, result) => {
      if (err) {
        console.error("Error updating password in the database:", err);
        return res
          .status(500)
          .json({ message: "Error updating password in the database." });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      res.status(200).json({ message: "Password reset successfully." });
    });
  });
});

router.put("/updatePassword/:email", (req, res) => {
  const email = req.params.email;
  const { password } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required." });
  }

  const query = "UPDATE petal_pink_user_tb SET password = ? WHERE email = ?";

  db.query(query, [password, email], (err, result) => {
    if (err) {
      console.error("Error updating password in the database:", err);
      return res
        .status(500)
        .json({ message: "Error updating password in the database." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    console.log("Password updated successfully.");
    res.status(200).json({ message: "Password updated successfully." });
  });
});

router.put("/updateProfilePicture/:email",upload.single("image"),
  (req, res) => {
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

    db.query(query, [imageBase64, email], (err, result) => {
      if (err) {
        console.error("Error updating profile picture in the database:", err);
        return res
          .status(500)
          .json({ message: "Error updating profile picture in the database." });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      res
        .status(200)
        .json({ message: "Profile picture updated successfully." });
      console.log("Profile picture updated successfully.");
    });
  }
);

router.post("/saveUser", upload.single("image"), (req, res) => {
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

  db.query(getLastUserIdQuery, (err, result) => {
    if (err) {
      console.error("Error fetching last user ID from the database:", err);
      return res.status(500).json({ message: "Database query error." });
    }

    const lastUserId = result.length ? result[0].user_id : null;
    const newUserId = generateNextUserId(lastUserId);

    const newUser = {
      userId: newUserId,  
      employeeId,  
      email,
      password,
      role,
      name,
      nic,
      status,
      visible,
      image: imageBase64,
    };

    
    const insertUserQuery = `INSERT INTO petal_pink_user_tb (user_id, employee_id, email, password, role, status, visible, name, nic, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      insertUserQuery,
      [
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
      ],
      (err, result) => {
        if (err) {
          console.error("Error saving user to the database:", err);
          return res
            .status(500)
            .json({ message: "Error saving user to the database." });
        }

        res.status(201).json({});
      }
    );
  });
});


router.get("/getAllData", (req, res) => {
  const query = "SELECT * FROM petal_pink_user_tb WHERE visible = ?";

  db.query(query, [1], (err, results) => {
    if (err) {
      console.error("Error fetching data from the database:", err);
      return res
        .status(500)
        .json({ message: "Error fetching data from the database." });
    }

    res.status(200).json(results);
  });
});

router.put("/updateUser/:user_id", (req, res) => {
  const userId = req.params.user_id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  const { employeeId, email, role, status = 1, visible = 1 } = req.body;

  if (!email || !role) {
    return res
      .status(400)
      .json({ message: "Please fill all fields to update the user." });
  }

  // Update SQL query to include employeeId
  const query =
    "UPDATE petal_pink_user_tb SET employee_id = ?, email = ?, role = ?, status = ?, visible = ? WHERE user_id = ?";

  db.query(
    query,
    [employeeId, email, role, status, visible, userId],
    (err, result) => {
      if (err) {
        console.error("Error updating user in the database:", err);
        return res
          .status(500)
          .json({ message: "Error updating user in the database." });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      res.status(200).json({ message: "User updated successfully." });
    }
  );
});

router.get("/getUser/:email", (req, res) => {
  const userId = req.params.email;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  const query =
    "SELECT * FROM petal_pink_user_tb WHERE email = ? AND visible = ?";

  db.query(query, [userId, 1], (err, results) => {
    if (err) {
      console.error("Error fetching user from the database:", err);
      return res
        .status(500)
        .json({ message: "Error fetching user from the database." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(results[0]);
  });
});

router.delete("/deleteUser/:user_id", (req, res) => {
  const userId = req.params.user_id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  const query = "UPDATE petal_pink_user_tb SET visible = 0 WHERE user_id = ?";

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Error deleting user from the database:", err);
      return res
        .status(500)
        .json({ message: "Error deleting user from the database." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User deleted successfully." });
  });
});

export default router;
