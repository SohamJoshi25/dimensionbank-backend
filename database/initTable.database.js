const fs = require("fs");

async function initTables(pool) {
    try {  
        const userSQL = fs.readFileSync("./database/tables/user.table.database.sql", "utf-8");
        const accountSQL = fs.readFileSync("./database/tables/account.table.database.sql", "utf-8");
      
        await pool.query(userSQL);
        await pool.query(accountSQL);
      
        console.log("Tables initialized");
    } catch (error) {
        console.log(error);
    }

}

module.exports = initTables;
