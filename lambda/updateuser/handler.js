'use strict'
const MongoClient = require('mongodb').MongoClient
const HttpError = require('standard-http-error')

// TODO: read from env var from deployment
const MongoURL = 'mongodb://lambda:lambda@mongodb.mongodb.svc.cluster.local'
const MongoDBName = 'iot_backend'

module.exports = async (event, context) => {
  try {
    // input validation
    const user = event.body.user
    if (!user) { throw new HttpError(400, 'User is empty') }
    if (!user.id) { throw new HttpError(400, 'User id is empty') }

    // upsert record on db
    const client = await MongoClient.connect(MongoURL)
    const collection = client.db(MongoDBName).collection('users')
    const mongoResult = await collection.updateOne(
      { id: user.id },
      { $set: user },
      { upsert: true }
    )
    client.close()

    // success response
    return context
      .status(200)
      .headers({ 'Content-Type': 'application/json' })
      .succeed(JSON.stringify({
        success: true,
        user,
        debug_mongoResult: mongoResult
      }))
  } catch (e) {
    // error response
    return context
      .status(e.code || 500)
      .headers({ 'Content-Type': 'application/json' })
      .fail(JSON.stringify({
        success: false,
        error: e.message
      }))
  }
}
