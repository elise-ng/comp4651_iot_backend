'use strict'
const MongoClient = require('mongodb').MongoClient
const HttpError = require('standard-http-error')

const MongoURL = process.env.mongo_url
const MongoDBName = process.env.mongo_dbname

/**
 * Lambda function for creating a user
 * Usage: input an user object, required fields: email, passwordHash
 */

module.exports = async (event, context) => {
  const client = new MongoClient(MongoURL)
  try {
    // input validation
    const user = event.body
    if (!user) { throw new HttpError(400, 'user object is empty') }
    if (!user.email) { throw new HttpError(400, 'user email is empty') }
    if (!user.passwordHash) { throw new HttpError(400, 'user passwordHash is empty') }

    // create user object according to schema
    const newUser = {
      email: user.email,
      passwordHash: user.passwordHash,
      profile: user.profile || {},
      locations: [],
      groups: [],
      devices: []
    }

    // create record on db
    await client.connect()
    const collection = client.db(MongoDBName).collection('users')
    // check if email has duplicate
    const duplicatesCount = await collection.count({ email: newUser.email })
    if (duplicatesCount > 0) { throw new HttpError(409, 'user email has been registered before') }
    // upsert record
    const result = await collection.findOneAndUpdate(
      { email: newUser.email },
      { $set: newUser },
      {
        returnOriginal: false,
        upsert: true,
        projection: { _id: 0 }
      }
    )
    if (!result.value) { throw new HttpError(500, 'failed to upsert record') }

    // success response
    return context
      .status(201)
      .headers({ 'Content-Type': 'application/json' })
      .succeed(JSON.stringify({ // force response to be in json as auto content type is not reliable
        success: true,
        user: result.value
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
