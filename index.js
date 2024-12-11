const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const multer = require("multer");
let otp = require("./otp.js");
const conn = require("./database.js");
const cors = require("cors");
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors());
var store = multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,__dirname+"/profilepic");
    },
    filename:(req,file,callback)=>{
        callback(null,Date.now()+file.originalname)
    }
})
var upload = multer({storage:store})
const initDB = () => {
    const sqlCreate = `CREATE TABLE IF NOT EXISTS all_register (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50),
        password VARCHAR(255),
        email VARCHAR(255),
        profile varchar(255)
    )`;

    conn.query(sqlCreate, (err) => {
        if (err) console.error("Table creation error:", err.message);
        else console.log("Table ready");
    });
};

initDB();
app.post("/register",upload.single("file"),async(req,res)=>{
    console.log(req.body);
    console.log(req.file);
    //checking the whether the password and confirm password is same or not
    if(req.body.password == req.body.conpassword){
        //bcrypting the password
        let salt = 10;
        let hashed_pas = await bcrypt.hash(req.body.password,salt);
        console.log(hashed_pas);
        //sending otp to email
        console.log(otp());
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'vadlaabhiram229@gmail.com',
              pass: 'xlle kipx ehac xdun'
            }
          });
          var mailOptions = {
            from: 'vadlaabhiram229@gmail.com',
            to: req.body.email,
            subject: 'Sending Email using Node.js',
            html:otp()
          };
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        const { username, password, email} = req.body;
    // Insert into Database
    const sqlInsert = `INSERT INTO all_register (username, password, email, profile) VALUES (?, ?, ?, ?)`;

    conn.query(sqlInsert, [username, hashed_pas, email, req.file.path], (err, info) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        res.send({
            status:200,
            message:"data registered successfully!!!!",
            data:{
                username:req.body.username,
                password:hashed_pas,
                email:req.body.email,
                profilepic:req.file.path
            }
        })
    });
        
    }
    else{
        res.send({
            
            error_message:"please check that  password and confirm password should be same ",
            data:req.body
        })
    }
});
let port = 3004;
app.listen(port,()=>{
    console.log(`server started at http://localhost:${port}`)
});