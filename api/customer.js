import express from "express";
import db from "../utils/db.js";

const router = express.Router();




router.get("/getAllCustomers", async (req, res) => {
    const query = "SELECT * FROM petal_pink_customer_tb order by cus_id desc";

    try {
        const [results] = await db.query(query, [1]);
        res.status(200).json(results);
    } catch (err) {
        console.error("Error fetching data from the database:", err);
        return res.status(500).json({ message: "Error fetching data from the database." });
    }
});








export default router;