import Query from './query'
import Mutation from './mutation'
import { GraphQLDateTime } from 'graphql-iso-date'

const resolvers = {
    Query,
    Mutation,
    Date: GraphQLDateTime
}
export default resolvers