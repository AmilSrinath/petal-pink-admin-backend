import express from "express";
import db from "../utils/db.js";

const router  = express.Router();

router.post("/saveConfig", (req, res) => {
    const { config_name, config_value, user_id } = req.body;

    // Check if required fields are present
    if (!config_name || !config_value || !user_id) {
        return res.status(400).json({ error: "Please provide config_name, config_value, and user_id" });
    }

    // SQL query to check if a record with the given config_name exists
    const checkSql = `SELECT * FROM petal_pink_configuration_tb WHERE config_name = ?`;

    db.query(checkSql, [config_name, user_id], (err, results) => {
        if (err) {
            console.error("Error checking config:", err);
            return res.status(500).json({ error: "Failed to check config" });
        }

        if (results.length > 0) {
            // If config exists, perform an UPDATE
            const updateSql = `UPDATE petal_pink_configuration_tb SET config_value = ?, user_id = ? WHERE config_name = ?`;

            db.query(updateSql, [config_value, user_id, config_name], (err, result) => {
                if (err) {
                    console.error("Error updating config:", err);
                    return res.status(500).json({ error: "Failed to update config" });
                }

                return res.status(200).json({ message: "Configuration updated successfully" });
            });
        } else {
            // If config does not exist, perform an INSERT
            const insertSql = `INSERT INTO petal_pink_configuration_tb (config_name, config_value, user_id) VALUES (?, ?, ?)`;

            db.query(insertSql, [config_name, config_value, user_id], (err, result) => {
                if (err) {
                    console.error("Error inserting config:", err);
                    return res.status(500).json({ error: "Failed to save config" });
                }

                return res.status(200).json({ message: "Configuration saved successfully", config_id: result.insertId });
            });
        }
    });
});



router.post("/getAllConfig", (req, res) => {
    const sql = `SELECT * FROM petal_pink_configuration_tb`;

    // Execute the query
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching configurations:", err);
            return res.status(500).json({ error: "Failed to fetch configurations" });
        }

        // Return the fetched configurations
        res.status(200).json({ configs: results });
    });
});







export default router;