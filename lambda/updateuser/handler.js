'use strict'
const MongoClient = require('mongodb').MongoClient
const HttpError = require('standard-http-error')

const MongoURL = 'mongodb://lambda:lambda@mongodb.mongodb.svc.cluster.local'
const MongoDBName = 'iot_backend'

module.exports = async (event, context) => {
  try {
    // input validation
    let user = event.body.user
    if (!user) { throw new HttpError(400, 'User is empty') }
    if (!user.id) { throw new HttpError(400, 'User id is empty') }

    // copy id and strip from object
    const id = user.id
    delete user.id

    // upsert record on db
    const client = await MongoClient.connect(MongoURL)
    const collection = client.db(MongoDBName).collection('users')
    const result = await collection.updateOne(
      { id },
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
        debug_mongoResult: result
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
