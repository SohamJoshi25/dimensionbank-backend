const dotenv = require("dotenv");
dotenv.config();

const pool = require("./database/connect.database")
const cors = require("cors");
const express = require("express");

const authRouter = require("./routers/auth.router")
const accountRouter = require("./routers/account.router");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())

app.use("/",(req,res,next)=>{
    try {
        console.log(req.url);
        console.log(req.method);
        console.log(req.body);
        console.log(req.headers);
        console.log("\n");

        next();
    } catch (error) {
        res.status(500).json({"message":"Some Error Occcured at Middleware"})
    }
})


const v1Router = express.Router();
   v1Router.use("/auth", authRouter);
   v1Router.use("/account",accountRouter);

app.use("/v1",v1Router);

app.use("/health",(req,res) => {
    res.status(200).json({"message":"Health OK!"})
})

app.use((request, response) => {
    response.status(200).json({
        error: "Endpoint Not Found",
        request: { url: request.url, method: request.method },
    });
});

app.listen(process.env.PORT || 4000 , () => {
    console.log("Server STarted on port ",process.env.PORT || 4000 );
    
    pool.query("SELECT NOW()", (err, res) => {
        if (err) {
        console.error("DB connection failed", err.stack);
        } else {
        console.log("DB connected:", res.rows[0]);
        }
    });
})
