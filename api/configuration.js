import express from "express";
import db from "../utils/db.js";

const router = express.Router();

router.post("/saveConfig", async (req, res) => {
    const { config_name, config_value, user_id } = req.body;

    // Check if required fields are present
    if (!config_name || !config_value || !user_id) {
        return res.status(400).json({ error: "Please provide config_name, config_value, and user_id" });
    }

    try {
        // SQL query to set the status of the existing config_name to 0
        const updateSql = `UPDATE petal_pink_configuration_tb SET status = 0 WHERE config_name = ?`;
        await db.query(updateSql, [config_name]);

        // After updating the existing config, perform the insert
        const insertSql = `INSERT INTO petal_pink_configuration_tb (config_name, config_value, created_date, status, user_id) VALUES (?, ?, ?, ?, ?)`;
        const [result] = await db.query(insertSql, [config_name, config_value, new Date(), 1, user_id]);

        return res.status(200).json({ message: "Configuration saved successfully", config_id: result.insertId });
    } catch (error) {
        console.error("Error saving configuration:", error);
        return res.status(500).json({ error: "Failed to save config" });
    }
});


router.post("/getAllConfig", async (req, res) => {
    const sql = `SELECT * FROM petal_pink_configuration_tb WHERE status = 1`;

    try {
        // Execute the query using async/await
        const [results] = await db.query(sql);

        // Return the fetched configurations
        res.status(200).json({ configs: results });
    } catch (err) {
        console.error("Error fetching configurations:", err);
        return res.status(500).json({ error: "Failed to fetch configurations" });
    }
});






export default router;