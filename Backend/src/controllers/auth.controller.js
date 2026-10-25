
const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const isProduction = process.env.NODE_ENV === 'production'

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
}

async function registerUser(req, res) {
    const { username, email, password } = req.body

    try {
        const isEmailPresent = await userModel.findOne({ email })

        if (isEmailPresent) {
            return res.status(409).json({
                message: 'user already registered'
            })
        }

        const isUsername = await userModel.findOne({ username })

        if (isUsername) {
            return res.status(409).json({
                message: 'Username is not available'
            })
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Password must contain uppercase, lowercase, number and special character'
            })
        }

        const hash = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            username,
            email,
            password: hash,
            role: 'user'
        })

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.cookie('token', token, cookieOptions)

        return res.status(201).json({
            message: 'user registration successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        })
    } catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
}

async function loginUser(req, res) {
    try {
        const { username, email, password } = req.body

        if (!username && !email) {
            return res.status(400).json({
                message: 'Please enter username or email'
            })
        }

        const user = await userModel.findOne({
            $or: [
                { username: username || undefined },
                { email: email || undefined }
            ].filter(condition => Object.values(condition)[0] !== undefined)
        })

        if (!user) {
            return res.status(401).json({
                message: 'user credential is invalid'
            })
        }

        const isValidPassword = await bcrypt.compare(
            password,
            user.password
        )

        if (!isValidPassword) {
            return res.status(401).json({
                message: 'Invalid Password'
            })
        }

        console.log('Logged-in user role:', user.role)

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.cookie('token', token, cookieOptions)

        return res.status(200).json({
            message: 'logged In',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        return res.status(401).json({
            message: error.message
        })
    }
}

async function logoutUser(req, res) {
    res.clearCookie('token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/'
    })

    return res.status(200).json({
        message: 'Logged Out successfully'
    })
}

async function getMe(req, res) {
    try {
        const user = await userModel
            .findById(req.user.id)
            .select('_id username email role')

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        return res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch current user'
        })
    }
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getMe
}
