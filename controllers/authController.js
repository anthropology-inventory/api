const User = require('../models/user.js');
const createToken = require('../utils/createToken.js');


// handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '' };

    // incorrect email
    if (err.message === 'incorrect email') {
        errors.email = 'that email is not registered';
    }

    // incorrect password
    if (err.message === 'incorrect password') {
        errors.password = 'that password is incorrect';
    }

    // duplicate error code
    if (err.code === 11000) {
        errors.email = 'That email is already registered';
    }

    // validation errors
    if (err.message.includes('User validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
}

const signup = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.create({ email, password });
        const token = createToken(user._id);

        res.status(201);
        res.json({ 
            user: user._id, 
            token 
        });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400);
        res.json({ errors });
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.status(200);
        res.json({
            user: user._id,
            token
        })
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400);
        res.json({ errors })
    }
}

module.exports = {
    signup,
    login
}