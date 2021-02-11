const signUpController = require("../controller/signup-controller");
const schema = require("../validate/joi");
const User = require("../models/user-schema");
const { hash, checkPassword } = require("./helper/create_hash");
const jwt = require("jsonwebtoken");
const mail = require("./helper/send_mail");

class SignUpRouter {
    async addUser(req, res) {
        console.log(schema.validate(req.body).error)
        if (schema.validate(req.body).error) {
             res.json({ error: schema.validate(req.body).error });
        } else {
            try {
                let data = await User.find({ email: req.body.email });
                if (data.length) {
                    res.json({ info: "Email exsist: try another" });
                } else {
                    let hashPassword = hash(req.body.password);
                    req.body.password = hashPassword;
                    await signUpController.insertUser(req.body);
                    res.json({ result: true });
                }
            } catch (err) {
                console.log("error on checking password: user password " + err);
                res.json(err);
            }
        }
    }
    async loginUser(req, res) {
        let accessToken = req.cookies['x-access-token'];
        if (accessToken === "undefined" || accessToken === "null" || accessToken === undefined || accessToken === null) {
          //  console.log("token isnt sign: normala es ysenc pti ashxati")
        } else {
            try {
                let decoded = jwt.verify(accessToken, "accessToken");
                if (decoded.email === req.body.login && decoded.password === req.body.password) {
                    return { email: email, accessToken: accessToken, tokenExpiration: 1 };
                }
            } catch (err) {
                console.log("error in verify " + err);
                throw new Error("error on verify accessToken " + err);
            }
        }
        const user = await User.findOne({ login: req.body.login });
        if (!user) {
            res.json({ log: false, info: "Login is incorrect" });
            return false
        }
        let isEqual = await checkPassword(user.password, req.body.password);
        if (!isEqual) {
            res.json({ log: false, info: "Password is incorrect" });
            return false;
        }
        accessToken = jwt.sign({ 
            userId: user._id,
            name:user.name,
            friends:user.friend, 
            email: user.email,
            password: user.password,
            userImg:user.profilePhotos
        }, "accessToken", {
            expiresIn: "30s",
        });

        let refreshToken = jwt.sign({ 
            userId: user._id,
            name:user.name,
        }, "refreshToken", {
            expiresIn: "1y",
        });

        res.cookie("x-access-token", accessToken,{maxAge:30*1000});
        res.cookie("refreshToken",refreshToken,{maxAge:60*60*24*365*1000})
        res.json({ userId: user._id,  email: user.email, accessToken: accessToken, tokenExpiration: 1, log: true });
        //res.sendFile(__dirname + "/views/" + "newsfeed.html")
    }
    sendRegistCode(req, res) {
        mail.sendMail(req, res);
    }
}

module.exports = new SignUpRouter();