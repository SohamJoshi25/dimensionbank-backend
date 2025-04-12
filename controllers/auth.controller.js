const { sendOtpMail } = require("../utils/nodemailer.util");
const { createJWT, verifyJWT } = require("../utils/jwt.util");
const pool = require("../database/connect.database");
const otpStore = require("../utils/otpStore")


const login = async (req,res) => {
    try {
        if(!req.body){
            res.status(400).json({ message: "Email is Requried in Body" });
            return;
        }
        const { email } = req.body; 
        if(!email){
            res.status(400).json({ message: "Email is Requried in Body" });
            return;
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 min expiry
      
        try {
          await sendOtpMail(email, otp);
          res.status(200).json({ message: "OTP sent to email" });
        } catch (err) {
          res.status(500).json({ message: "Failed to send OTP" });
        }

    } catch (error) {
        return res.status(500).json({"message":`error ${error}`})
    }
}


const twofa = async (req,res) => {
    try {
        const { email, name, otp } = req.body;
        const record = otpStore.get(email);
    
        if (!record || !name || !otp || !email) return res.status(400).json({ message: "Missing Details" });
        if (Date.now() > record.expires) return res.status(400).json({ message: "OTP expired" });
        if (record.otp !== otp) return res.status(401).json({ message: "Invalid OTP" });

        const query_result = await pool.query(
            `SELECT * FROM users WHERE email = ($1);`,
            [email]
          );
        
        if(query_result.rows[0]){

            const token = createJWT({data:query_result.rows[0].id});
            otpStore.delete(email);
            return res.status(200).json({ message: "OTP verified. Login successful!", token:token });

        }else{

            const update_result = await pool.query(
                `INSERT INTO users(email, name) VALUES ($1, $2) RETURNING *;`,
                [email, name]
              );
    
            const token = createJWT({id:update_result.rows[0].id});
    
            otpStore.delete(email);
            return res.status(200).json({ message: "OTP verified. Login successful!", token:token });

        }
        
    } catch (error) {
        return res.status(500).json({"message":`error ${error}`})
    }
}



const deleteAccount = async (req,res) => {
    try {
        const { token } = req.body;

        if (!token ) return res.status(400).json({ message: "Missing Token" });
        
        const decoded = verifyJWT(token)

        const  delete_result = await pool.query(
            `DELETE FROM users where id = ($1);`,
            [decoded.id]
          );

          return  res.status(200).json({ message: "User Deleted" });
        
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        } else if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        } else {
            return res.status(500).json({"message":`${err}`})
        }
       
    }
}


module.exports = {login,twofa,deleteAccount}