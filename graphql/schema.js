const { gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    messages: [Message]!
  }
  type Mutation {
    createMessage(text: String): CreateMessageResponse!
  }
  type CreateMessageResponse {
    err: String!
  }
  type Message {
    id: ID
    userId: ID!
    content: MessageContent
  }
  type MessageContent {
    text: String
    spotifyId: String!
    url: String!
  }
`;

module.exports = typeDefs;
