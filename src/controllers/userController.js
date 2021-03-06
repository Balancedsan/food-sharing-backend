const bycrypt = require("bcrypt");
const model = require("../db/config/models/index");
const { sendEmail } = require("../sendEmail");

const duplicateError = {
    DUPLICATE_KEY: "23505",
};


const verifyUser = async (req, res) => {
    try {
        if (
            model.User.findAll({
                where: {
                    email: req.query.email,
                },
            }).isVerified == false
        ) {
            await model.User.update(
                { isVerified: true },
                {
                    where: {
                        email: req.query.email,
                    },
                }
            );
            res.send("Verified Email!");
        } else {
            res.send("email already verified");
        }
    } catch (err) {
        res.send(err);
    }
};

const registerUser = async (req, res) => {
    const saltRounds = 10;

    const { username, password, email } = req.body;
    const hashPassword = await bycrypt.hash(password, saltRounds);

    try {
        await model.User.create({
            username: username,
            password: hashPassword,
            email: email,
        });
        sendEmail(email);
    } catch (error) {
        if (error.code === duplicateError.DUPLCATE_KEY) {
            return res.status(400).send("an email with this account already exists");
        }
    }

    return res.send("successfully created an account");
};

const userLogin = async (req, res) => {
    const { username, password } = req.body
    const account = await model.User.findAll({
        where: {
            username: username
        }
    })

    // if account doesn't exist
    if (account.length == 0) {
        res.send('account not found')
    }
    // if account exists
    else {
        const accountPassword = account[0].dataValues.password
        bycrypt.compare(password, accountPassword, function (err, result) {
            if (result) {
                res.send('succesfully logged in')
            }
            else {
                res.send(err)
            }
        })
    }
}


module.exports = {
    registerUser,
    verifyUser,
    userLogin
};
