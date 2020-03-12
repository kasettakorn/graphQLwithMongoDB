import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import server from './server'

const {DB_USERNAME, DB_PASSWORD, DB_NAME, PORT } = process.env

const createServer = async () => {
  try {
    await mongoose.connect(
`mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@clusterdb-ttkwc.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`
      , { useUnifiedTopology: true })

    const app = express()

    server.applyMiddleware({ app });

    app.listen({ port: PORT }, () =>
      console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
    )

  } catch (error) {
    console.log(error);

  }
}

createServer()