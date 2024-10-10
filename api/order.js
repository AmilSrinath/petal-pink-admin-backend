import express from "express";
import db from "../utils/db.js";

const router = express.Router();

router.put("/saveOrder", async (req, res) => {
    const { firstName, lastName, address, city, email, phone1, phone2, province, suite, country, cartItems, total, paymentMethod } = req.body;

    try {
        // Start a transaction
        await db.query('START TRANSACTION');

        // Step 1: Insert customer details
        const customerInsertQuery = `
            INSERT INTO petal_pink_customer_tb 
            (first_name, last_name, address, city, email, phone_1, phone_2, province, suite, country, created_date, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1)
        `;
        // Use mysql2 with promises, get the result directly
        const [customerResult] = await db.query(customerInsertQuery, [firstName, lastName, address, city, email, phone1, phone2, province, suite, country]);

        // Access insertId from the result
        const customerId = customerResult.insertId;

        // Check if the customerId is generated
        if (!customerId) {
            throw new Error("Customer ID not generated");
        }

        console.log("Customer ID:", customerId);

        // Step 2: Insert order details
        const orderInsertQuery = `
            INSERT INTO petal_pink_order_tb 
            (cus_id, created_date, status, total) 
            VALUES (?, NOW(), 1, ?)
        `;
        const [orderResult] = await db.query(orderInsertQuery, [customerId, total]);
        const orderId = orderResult.insertId;

        if (!orderId) {
            throw new Error("Order ID not generated");
        }

        console.log("Order ID:", orderId);

        // Step 3: Insert each item in the cart into order details
        const orderDetailsInsertQuery = `
            INSERT INTO petal_pink_order_details_tb 
            (order_id, quantity, product_name, price, sub_total, created_date, status)
            VALUES (?, ?, ?, ?, ?, NOW(), 1)
        `;

        for (const item of cartItems) {
            const { quantity, productName, price, subTotal } = item;
            await db.query(orderDetailsInsertQuery, [orderId, quantity, productName, price, subTotal]);
        }

        // Commit the transaction
        await db.query('COMMIT');
        res.status(200).json({ message: 'Order saved successfully!' });
    } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');
        console.error('Error saving order:', error.message);
        res.status(500).json({ message: `Error saving order: ${error.message}` });
    }
});

export default router;
