const pool = require("../database/connect.database");
const { verifyJWT } = require("../utils/jwt.util");

const getAccountDetails = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authorization token missing or malformed" });
        }
        const token = authHeader.split(" ")[1];

        const decoded = verifyJWT(token);
        const userId = decoded.id;
        const accountId = req.params.accountId;

        const { rows } = await pool.query(`SELECT * FROM accounts WHERE id = $1 AND user_id = $2`, [accountId, userId]);

        if (rows.length === 0) {
            return res.status(403).json({ message: "No access or account not found" });
        }

        return res.status(200).json(rows[0]);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        } else if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        } else {
            return res.status(500).json({ message: `${err}` });
        }
    }
};

const getAllUserAccounts = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authorization token missing or malformed" });
        }
        const token = authHeader.split(" ")[1];

        const decoded = verifyJWT(token);
        const userId = decoded.id;

        const { rows } = await pool.query(`SELECT * FROM accounts WHERE user_id = $1`, [userId]);
        return res.status(200).json(rows);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        } else if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        } else {
            return res.status(500).json({ message: `${err}` });
        }
    }
};

const createAccount = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authorization token missing or malformed" });
        }
        const token = authHeader.split(" ")[1];

        const { initial_balance } = req.body;
        const decoded = verifyJWT(token);
        const userId = decoded.id;

        const { rows } = await pool.query(
            `INSERT INTO accounts (user_id, balance) VALUES ($1, $2) RETURNING *`,
            [userId, initial_balance || 0.00]
        );

        return res.status(201).json(rows[0]);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        } else if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        } else {
            return res.status(500).json({ message: `${err}` });
        }
    }
};

const updateAccount = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authorization token missing or malformed" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = verifyJWT(token);
        const userId = decoded.id;
        const accountId = req.params.accountId;

        const { balance } = req.body;

        // Ensure account belongs to user
        const check = await pool.query(`SELECT * FROM accounts WHERE id = $1 AND user_id = $2`, [accountId, userId]);
        if (check.rows.length === 0) {
            return res.status(403).json({ message: "Unauthorized or account not found" });
        }

        // Create a log string
        const timestamp = new Date().toISOString().replace("T", " ").split(".")[0]; // e.g. "2025-04-12 14:03:21"
        const logEntry = `Balance updated to ₹${balance} on ${timestamp}`;

        const { rows } = await pool.query(
            `UPDATE accounts 
             SET balance = COALESCE($1, balance),
                 logs = array_append(logs, $2)
             WHERE id = $3
             RETURNING *`,
            [balance, logEntry, accountId]
        );

        return res.status(200).json(rows[0]);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        } else if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        } else {
            return res.status(500).json({ message: `${err}` });
        }
    }
};


const deleteAccount = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authorization token missing or malformed" });
        }
        const token = authHeader.split(" ")[1];
        
        const decoded = verifyJWT(token);
        const userId = decoded.id;
        const accountId = req.params.accountId;

        console.log(accountId,userId)
        const check = await pool.query(`SELECT * FROM accounts WHERE id = $1 AND user_id = $2`, [accountId, userId]);
        if (check.rows.length === 0) {
            return res.status(403).json({ message: "Unauthorized or account not found" });
        }

        await pool.query(`DELETE FROM accounts WHERE id = $1`, [accountId]);
        return res.status(200).json({ message: "Account deleted successfully" });
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        } else if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        } else {
            return res.status(500).json({ message: `${err}` });
        }
    }
};

module.exports = {
    getAccountDetails,
    getAllUserAccounts,
    createAccount,
    deleteAccount,
    updateAccount
};
