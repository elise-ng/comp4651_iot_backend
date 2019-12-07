'use strict'
const MongoClient = require('mongodb').MongoClient
const HttpError = require('standard-http-error')

const MongoURL = process.env.mongo_url
const MongoDBName = process.env.mongo_dbname

/**
 * Lambda function for updating record of a user
 * Usage: input an user object with id and fields to be updated
 */

module.exports = async (event, context) => {
  const client = new MongoClient(MongoURL)
  try {
    // input validation
    const user = event.body
    if (!user) { throw new HttpError(400, 'user object is empty') }
    if (!user.id) { throw new HttpError(400, 'user id is empty') }

    // upsert record on db
    await client.connect()
    const collection = client.db(MongoDBName).collection('users')
    const result = await collection.updateOne(
      { id: user.id },
      { $set: user }
    )

    if (result.matchedCount !== 1) { throw new HttpError(404, 'user not found') }

    // success response
    return context
      .status(200)
      .headers({ 'Content-Type': 'application/json' })
      .succeed(JSON.stringify({ // force response to be in json as auto content type is not reliable
        success: true
      }))
  } catch (e) {
    // error response
    return context
      .status(e.code || 500)
      .headers({ 'Content-Type': 'application/json' })
      .succeed(JSON.stringify({ // use .succeed() as .fail() overwrites headers or content type
        success: false,
        error: e.message
      }))
  } finally {
    // close db connection
    client.close()
  }
}
