import express from "express";
import db from "../utils/db.js";
import multer from "multer";
import dayjs from "dayjs";

const router = express.Router();

router.get("/getAllData", (req, res) => {
  const query = "SELECT * FROM petal_pink_product_tb WHERE visible = ?";

  db.query(query, [1], (err, results) => {
    if (err) {
      console.error("Error fetching data from the database:", err);
      return res
          .status(500)
          .json({ message: "Error fetching data from the database." });
    }

    res.status(200).json(results);
    if (results.status === 200) {
      console.log("Data fetched successfully.");
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "No data found." });
    }
  });
});

// Soft delete product by setting visible to 0
router.delete("/deleteProduct/:product_id", (req, res) => {
  const product_id = req.params.product_id;

  if (!product_id) {
    return res.status(400).json({ message: "Product ID is required." });
  }

  const query =
      "UPDATE petal_pink_product_tb SET visible = 0 WHERE product_id = ?";

  db.query(query, [product_id], (err, result) => {
    if (err) {
      console.error("Error deleting product from the database:", err);
      return res
          .status(500)
          .json({ message: "Error deleting product from the database." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json({ message: "Product deleted successfully." });
  });
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
router.post("/saveProduct", upload, (req, res) => {
  console.log("Request body:", req.body); // Log request body for debugging
  console.log("Request files:", req.files); // Log uploaded files for debugging
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

  // Destructure the request body to extract form data
  const {
    product_name,
    unit_type,
    product_price,
    quantity,
    discount,
    weight,
    description,
    keyPoints,
    faq,
    howToUse,
    create_date,
    edit_date,
    user_id,
  } = req.body;

  console.log("Parsed body data:", {
    product_name,
    unit_type,
    product_price,
    quantity,
    discount,
    weight,
    description,
    keyPoints,
    faq,
    howToUse,
    user_id,
  });

  // Construct the query to insert product data
  const query = `
        INSERT INTO petal_pink_product_tb (
            product_name, unit_type, product_price, quantity, discount, status, visible, create_date, edit_date, 
            image_url, image_url_2, image_url_3, user_id, weight, description, keyPoints, faq, howToUse
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  // Use current date for createdAt and updatedAt if not provided
  const createdAt = formatDate(create_date || new Date());
  const updatedAt = formatDate(edit_date || new Date());

  // Execute the query with provided data
  db.query(
      query,
      [
        product_name,
        unit_type || "me",
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
        user_id || U001,
        weight,
        description || "",
        keyPoints || "",
        faq || "",
        howToUse || "",
      ],
      (err, result) => {
        if (err) {
          console.error("Error saving product to the database:", err);
          return res
              .status(500)
              .json({ message: "Error saving product to the database." });
        }

        res.status(201).json({
          message: "Product saved successfully.",
        });
      }
  );
});




router.put("/updateProduct", upload, (req, res) => {
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

  // Destructure the request body to extract form data
  const {
    product_id,
    product_name,
    unit_type,
    product_price,
    quantity,
    discount,
    weight,
    description,
    keyPoints,
    faq,
    howToUse,
    create_date,
    edit_date,
    user_id,
  } = req.body;

  console.log("Parsed body data:", {
    product_id,
    product_name,
    unit_type,
    product_price,
    quantity,
    discount,
    weight,
    description,
    keyPoints,
    faq,
    howToUse,
    user_id,
  });

  // Construct the query to update product data
  const query = `
        UPDATE petal_pink_product_tb SET
            product_name = ?,
            unit_type = ?,
            product_price = ?,
            quantity = ?,
            discount = ?,
            weight = ?,
            description = ?,
            keyPoints = ?,
            faq = ?,
            howToUse = ?,
            image_url = ?,    
            image_url_2 = ?,
            image_url_3 = ?
        WHERE product_id = ?
    `;

  // Use current date for createdAt and updatedAt if not provided
  const createdAt = formatDate(create_date || new Date());
  const updatedAt = formatDate(edit_date || new Date());

  db.query(
      query,
      [
        product_name,
        unit_type || "me",
        product_price,
        quantity || 0,
        discount || 0,
        weight,
        description || "",
        keyPoints || "",
        faq || "",
        howToUse || "",
        imageBase64,
        imageBase64_2,
        imageBase64_3,
        product_id,
      ],
      (err, result) => {
        if (err) {
          console.error("Error updating product in the database:", err);
          return res
              .status(500)
              .json({ message: "Error updating product in the database." });
        }
        if(result.affectedRows === 0) {
          return res.status(404).json({message: "Product not found.",});
        }
        if(result.affectedRows === 1) {
          return res.status(200).json({message: "Product updated successfully.",});
        }
        res.status(200).json({message: "Product updated successfully.",});
      }
  );
});


//condtion to check if a get request came
//get the specific product data accoding to product name
router.get("/getProductByName/:product_name", (req, res) => {
  const product_name = req.params.product_name;
  db.query(
      "SELECT * FROM petal_pink_product_tb WHERE product_name = ?",
      [product_name],
      (err, result) => {
        if (err) {
          console.error("Error getting product from the database:", err);
          return res
              .status(500)
              .json({ message: "Error getting product from the database." });
        }
        if (result.length === 0) {
          return res.status(404).json({ message: "Product not found." });
        }
        res.status(200).json(result[0]);
      }
  );
})
export default router;