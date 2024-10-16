import express from "express";
import db from "../utils/db.js";
import multer from "multer";
import dayjs from "dayjs";

const router = express.Router();

router.get("/getAllData", async (req, res) => {
    const query = "SELECT * FROM petal_pink_product_tb WHERE status = ?";

    try {
        const [results] = await db.query(query, [1]);

        if (results.length === 0) {
            return res.status(404).json({ message: "No data found." });
        }

        res.status(200).json(results);
        console.log("Data fetched successfully.");
    } catch (err) {
        console.error("Error fetching data from the database:", err);
        res.status(500).json({ message: "Error fetching data from the database." });
    }
});


// Soft delete product by setting visible to 0
router.delete("/deleteProduct/:product_id", async (req, res) => {
    const product_id = req.params.product_id;

    if (!product_id) {
        return res.status(400).json({ message: "Product ID is required." });
    }

    const query = "UPDATE petal_pink_product_tb SET status = 0 WHERE product_id = ?";

    try {
        const [result] = await db.query(query, [product_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found." });
        }

        res.status(200).json({ message: "Product deleted successfully." });
    } catch (err) {
        console.error("Error deleting product from the database:", err);
        res.status(500).json({ message: "Error deleting product from the database." });
    }
});


const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
}).fields([
  { name: "image_url", maxCount: 1 },
  { name: "image_url_2", maxCount: 1 },
  { name: "image_url_3", maxCount: 1 },
]);
// Helper function to format dates
const formatDate = (date) => dayjs(date).format("YYYY-MM-DD HH:mm:ss");

// Route to save the product to the database
router.post("/saveProduct", upload, async (req, res) => {
    const images = req.files;
    let imageBase64 = null;
    let imageBase64_2 = null;
    let imageBase64_3 = null;

    if (images && images["image_url"]) {
        imageBase64 = images["image_url"][0].buffer.toString("base64");
    }
    if (images && images["image_url_2"]) {
        imageBase64_2 = images["image_url_2"][0].buffer.toString("base64");
    }
    if (images && images["image_url_3"]) {
        imageBase64_3 = images["image_url_3"][0].buffer.toString("base64");
    }

    const {
        product_name,
        unit_type,
        product_price,
        quantity,
        discount,
        weight,
        amount,
        description,
        keyPoints,
        faq,
        howToUse,
        user_id,
    } = req.body;

    const query = `
        INSERT INTO petal_pink_product_tb (
            product_name, unit_type, product_price, quantity, discount, status, visible, create_date, edit_date, 
            image_url, image_url_2, image_url_3, user_id, weight, amount, description, keyPoints, faq, howToUse
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const createdAt = formatDate(new Date());
    const updatedAt = formatDate(new Date());

    try {
        await db.query(query, [
            product_name,
            unit_type || "ml",
            product_price,
            quantity || 0,
            discount || 0,
            1,
            1,
            createdAt,
            updatedAt,
            imageBase64,
            imageBase64_2,
            imageBase64_3,
            user_id || 'U001',
            weight,
            amount || 0,
            description || "",
            keyPoints || "",
            faq || "",
            howToUse || "",
        ]);

        res.status(201).json({ message: "Product saved successfully." });
    } catch (err) {
        console.error("Error saving product to the database:", err);
        res.status(500).json({ message: "Error saving product to the database." });
    }
});

router.put("/updateProduct", upload, async (req, res) => {
    const images = req.files;
    let imageBase64 = null;
    let imageBase64_2 = null;
    let imageBase64_3 = null;

    if (images && images["image_url"]) {
        imageBase64 = images["image_url"][0].buffer.toString("base64");
    }
    if (images && images["image_url_2"]) {
        imageBase64_2 = images["image_url_2"][0].buffer.toString("base64");
    }
    if (images && images["image_url_3"]) {
        imageBase64_3 = images["image_url_3"][0].buffer.toString("base64");
    }

    const {
        product_id,
        product_name,
        unit_type,
        product_price,
        quantity,
        discount,
        weight,
        amount,
        description,
        keyPoints,
        faq,
        howToUse,
    } = req.body;

    // Building dynamic query for image columns
    let query = `
        UPDATE petal_pink_product_tb SET
            product_name = ?,
            unit_type = ?,
            product_price = ?,
            quantity = ?,
            discount = ?,
            weight = ?,
            amount = ?,
            description = ?,
            keyPoints = ?,
            faq = ?,
            howToUse = ?`;

    const queryParams = [
        product_name,
        unit_type || "me",
        product_price,
        quantity || 0,
        discount || 0,
        weight || 0,
        amount || 0,
        description || "",
        keyPoints || "",
        faq || "",
        howToUse || ""
    ];

    // Only include image columns in the query if they exist
    if (imageBase64 !== null) {
        query += `, image_url = ?`;
        queryParams.push(imageBase64);
    }
    if (imageBase64_2 !== null) {
        query += `, image_url_2 = ?`;
        queryParams.push(imageBase64_2);
    }
    if (imageBase64_3 !== null) {
        query += `, image_url_3 = ?`;
        queryParams.push(imageBase64_3);
    }

    query += ` WHERE product_id = ?`;
    queryParams.push(product_id);

    try {
        const [result] = await db.query(query, queryParams);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found." });
        }

        res.status(200).json({ message: "Product updated successfully." });
    } catch (err) {
        console.error("Error updating product in the database:", err);
        res.status(500).json({ message: "Error updating product in the database." });
    }
});



//condtion to check if a get request came
//get the specific product data accoding to product name
router.get("/getProductByName/:product_name", async (req, res) => {
    const product_name = req.params.product_name;

    try {
        const [result] = await db.query(
            "SELECT * FROM petal_pink_product_tb WHERE product_name = ?",
            [product_name]
        );

        if (result.length === 0) {
            return res.status(404).json({ message: "Product not found." });
        }

        res.status(200).json(result[0]);
    } catch (err) {
        console.error("Error getting product from the database:", err);
        res.status(500).json({ message: "Error getting product from the database." });
    }
});


router.get("/getProductById/:product_id", async (req, res) => {
    const product_id = req.params.product_id;

    try {
        const [result] = await db.query(
            "SELECT * FROM petal_pink_product_tb WHERE product_id = ?",
            [product_id]
        );

        if (result.length === 0) {
            return res.status(404).json({ message: "Product not found." });
        }

        res.status(200).json(result[0]);
    } catch (err) {
        console.error("Error getting product from the database:", err);
        res.status(500).json({ message: "Error getting product from the database." });
    }
});







export default router;