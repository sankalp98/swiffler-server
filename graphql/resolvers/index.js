const postsResolvers = require('./posts')
const usersResolvers = require('./users')
const commentsResolvers = require('./comments')

module.exports = {
     Post: {
         commentsCount: (parent) => parent.comments.length,
         likesCount: (parent) => parent.likes.length
     },
     Query: {
         ...postsResolvers.Query
     },
     Mutation: {
         ...usersResolvers.Mutation,
         ...postsResolvers.Mutation,
         ...commentsResolvers.Mutation
     }
}