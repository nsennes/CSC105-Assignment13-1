const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const connection = mysql.createConnection({
	host: "server2.bsthun.com",
	port: "6105",
	user: "lab_8vlaj",
	password: "1ZvwqZR5VdHtSPjo",
	database: "lab_todo02_85sdhv",
});

connection.connect();
	console.log("Database is connected");


const port = 3000;
const app = express();

app.use(bodyParser.json({ type: "application/json" }));





app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.post("/basic/login", (req, res)=>{
    const username= req.body.username;
    const password= req.body.password;

    var sql = mysql.format(
        "SELECT * FROM users WHERE username=? AND password=?", [username,password]
    );
    
    console.log("DEBUG: /basic/login=> " + sql);
    connection.query(sql, (err,rows)=>{
        if(err){
            return res.json({
                success: false,
                data: null,
                error: err.message,
            });
        }

        numRows = rows.length;
        if(numRows ==0){
            res.json({
                success: false,
                message: "Login credential is incorrect",
            });
        }else{
            res.json({
                success: true,
                message: "Login credential is correct",
                user: rows[0],
            })
        }
    });

});



// Hash 12345678
const example = async () => {
	const salt1 = await bcrypt.genSalt(10);
	console.log("Salt #1: ", salt1);
	const hash1 = await bcrypt.hash("12345678", salt1);
	console.log("Hash #1: ", hash1);

	const salt2 = await bcrypt.genSalt(10);
	console.log("Salt #2: ", salt2);
	const hash2 = await bcrypt.hash("asdf12123", salt1);
	console.log("Hash #2: ", hash2);

	const valid1 = await bcrypt.compare(
		"12345679",
		"$2b$10$fwkjdMXyeLb7DGaU2UKwTecPJfC7i3ktBP5pFwC3ov71dMSsehus2"
	);
	console.log("Validation #1: ", valid1);

	const valid2 = await bcrypt.compare(
		"12345679",
		"$2b$10$fwkjdMXyeLb7DGaU2UKwTecPJfC7i3ktBP5pFwC3ov71dMSsehus3" // Modify last charactor a little bit
	);
	console.log("Validation #2: ", valid2);

	const valid3 = await bcrypt.compare(
		"asdf12123",
		hash2 // Previously hgenerated hash
	);
	console.log("Validation #3: ", valid3);
};

example();

//New Endpoint Post login
app.post("/post/login", (req, res)=>{
    const username= req.body.username;
    const password= req.body.password;

    const sql = mysql.format(
        "SELECT * FROM users WHERE username=?", [username]
    );
    
    console.log("DEBUG: /post/login=> " + sql);
    connection.query(sql,async (err,rows)=>{
        if(err){
            return res.json({
                success: false,
                data: null,
                error: err.message,
            });
        }

        numUsers = rows.length;
        if(numUsers ==0){
            res.json({
                success: false,
                message: "User doesn't exist",
            });
        }else{
            const hashedPassword = rows[0].hashed_password;
            const validPassword = await bcrypt.compare(password, hashedPassword);
            if(validPassword){
                res.json({
                    success: true,
                    message: "Login credential is correct",
                    user: rows[0],
                })
            }else{
                res.json({
                    success: false,
                    message: "Incorrect Password!"
                });
            }           
            
        }
    });

});


//New End point Post register
app.post("/post/register", async (req, res)=>{
    const username= req.body.username;
    const password= req.body.password;

    //password validation
    const isValid = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password);
    if( !isValid){
        res.json({
            success: false,
            message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
        });
        return;
    }

    const hashedPassword = await bcrypt.hash(password,10);

    const sql = mysql.format(
        "INSERT INTO users (username, hashed_password) VALUES(?,?)", [username,hashedPassword]
    );
    
    connection.query(sql, (err,result)=>{
        if(err){
            return res.json({
                success: false,
                data: null,
                error: err.message,
            });
        }

            res.json({
                success: true,
                message: "Registered Successfully.",
                
            });
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
