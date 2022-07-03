const bcrypt = require("bcryptjs");
const { UserInputError, AuthenticationError } = require('apollo-server');
const jwt = require('jsonwebtoken');

const { validateRegisterInput, validateLoginInput } = require("../utils/validateRegisterInput");
const { SECRET_KEY } = require("../config")
const User = require("../models/user");
const Post = require("../models/post");
const { validatePost } = require("../utils/validatePost");
const checkAuth = require("../utils/checkAuth");

function generateToken(user){
    return jwt.sign(
        {
          id: user.id,
          email: user.email,
          username: user.username
        },
        SECRET_KEY,
        { expiresIn: '7d' }
      );
}

module.exports = {
    Query: {
        async getPosts(){
            try {
                const posts = await Post.find().sort({ createdAt: -1 })
                return posts
            } catch (err){
                throw new Error(err)
            }
        },
        async getPost(_, { postId }){
            try {
                const post = await Post.findById(postId);
                if (post) {
                    return post;
                } else {
                    throw new Error("Post not found")
                }
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Mutation: {
        async login(_, { email, password }){
            const { errors, valid } = validateLoginInput(email, password);
            if(!valid){
                throw new UserInputError("Errors", errors)
            }
            const user = await User.findOne({ email })
            if(!user){
                throw new UserInputError("User does not exist please ensure your email is correct", {
                    errors: {
                        email: "User does not exist please ensure your email is correct"
                    }
                })
            }
            const match = await bcrypt.compare(password, user.password);
            if(!match){
                errors.general = "Wrong Credentials"
                throw new UserInputError("Wrong credential", { errors })
            }
            const token = generateToken(user);
            return {
                ...user._doc,
                id: user._id,
                token
            }
        },
        async register(_, { registerInput: { username, email, password, confirmPassword }}){
            const { errors, valid } = validateRegisterInput(username, email, password, confirmPassword);
            if(!valid){
                throw new UserInputError("Errors", errors)
            }
            const user = await User.findOne({ email });
            if(user){
                throw new UserInputError("Email already exist", {
                    errors: {
                        email: "Email already exists"
                    }
                })
            }
            password = await bcrypt.hash(password, 12)

            const newUser = new User({
                username,
                email,
                password,
                createdAt: new Date().toISOString()
            })

            const res = await newUser.save();

            const token = generateToken(res)

            return {
                ...res._doc,
                id: res._id,
                token
            }
        },
        async createPost(_, { body }, context){
            const user = checkAuth(context);
            const { errors, valid } = validatePost(body);
            if(!valid){
                throw new Error('Errors', errors);
            }
            const newPost = new Post({
                body,
                user: user.id,
                username: user.username,
                createdAt: new Date().toISOString()
            });
            const post = await newPost.save();
            return post
        },
        async deletePost(_, { postId }, context){
            const user = checkAuth(context);
            try {
                const post = await Post.findById(postId);
            if(post.username === user.username){
                await post.delete()
                return "Post deleted Successfully"
            } else {
                throw new AuthenticationError("You are not allowed to delete post")
            }
            } catch (err) {
                throw new Error(err);
            }
        },
        async commentPost(_, { postId, body }, context){
            const { username } = checkAuth(context);
                const post = await Post.findById(postId);
                if(body.trim() === ""){
                    throw new UserInputError("Comments cannot be empty", {
                        errors: {
                            body: "Comments cannot be empty"
                        }
                    });
                }
                if(post){
                    post.comments.unshift({
                        body,
                        username,
                        createdAt: new Date().toISOString()
                    });
                    await post.save();
                    return post
                } else {
                    throw new UserInputError("Post not found")
                }
            },
        async likePost(_, { postId }, context){
            const { username } = checkAuth(context);
            const post = await Post.findById(postId);
            if(post){
                if(post.likes.find((like) => like.username === username)){
                    post.likes = post.likes.filter((like) => like.username !== username )
                } else {
                    post.likes.push({
                        username,
                        createdAt: new Date().toISOString()
                    });
                }
                await post.save();
                return post
            } else {
                throw new UserInputError("Post not found")
            }
        }
    }
}