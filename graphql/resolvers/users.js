const User = require('../../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { UserInputError } = require('apollo-server')
const {validateRegisterInput, validateLogInInput} = require('../../util/validators')

const { SECRET_KEY } = require('../../config')

function generateToken(user){
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    }, SECRET_KEY, { expiresIn: '1h'})
}

module.exports = {
    Mutation: {
        async login(_,{ logInInput: { username, password } } ){
            // Validate input user data
            const {errors, valid} = validateLogInInput(username, password)
            if(!valid){
                throw new UserInputError('Errors', {errors})
            }

            // Make sure user exists
            const user = await User.findOne({username})
            if(!user){
                errors.general = 'User not found'
                throw new UserInputError('User not found',{ errors })
            } else {
                const match = await bcrypt.compare(password, user.password)
                if(!match){
                    errors.general = 'Wrong credentials'
                    throw new UserInputError('Wrong credentials',{ errors })
                }
            }

            const token = generateToken(user)

            return {...user._doc, id: user._id, token: token}
        },
        async register(_,{ registerInput: {username, email, password, confirmPassword} }){
            // Validate input user data
            const {errors, valid} = validateRegisterInput(username, email, password, confirmPassword)
            if(!valid){
                throw new UserInputError('Errors', {errors})
            }


            // Make sure user doesnt already exist
            const user = await User.findOne({username})
            if(user){
                throw new UserInputError('username is taken',{
                    errors: {
                        username: 'This username is taken'
                    }
                })
            }

            // Hash Password and create authentication token
            password = await bcrypt.hash(password, 12)

            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            })

            const res = await newUser.save();

            const token = generateToken(res)

            return {...res._doc, id: res._id, token: token}
        }
    }
}