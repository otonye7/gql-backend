const { gql } = require("apollo-server");

module.exports = gql `
type Post {
  id: ID!
  body: String!
  createdAt: String
  username: String!
  comments: [Comment]!
  likes: [Like]!
}
  type Comment {
    id: ID!
    body: String!
    createdAt: String!
    username: String!
  }
  type Like {
    id: ID!
    username: String!
    createdAt: String!
  }
  type User {
    id: ID!
    email: String!
    token: String!
    username: String!
    createdAt: String
}
  input RegisterInput {
      username: String!
      email: String!
      password: String!
      confirmPassword: String!
  }
  type Query {
    getPosts: [Post]
    getPost(postId: ID!): Post
  }
  type Mutation {
      register(registerInput: RegisterInput): User!
      login(email: String!, password: String!): User!
      createPost(body: String!): Post!
      deletePost(postId: ID!): String!
      createComment(postId: String!, body: String!): Post!
      likePost(postId: ID!): Post!
  }
`