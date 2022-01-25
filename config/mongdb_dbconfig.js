// Import Mongodb
const MongoClient = require("mongodb").MongoClient

// Mongodb Connection String
// const url = "mongodb://localhost:27017/" // No user/passsword

// local host
// const url = "mongodb://samit2:123456@localhost:27017/" // With user/password




var _db
var dbname = "smartinvdb"
// mongdb atlas
const url = "mongodb+srv://nutthakit:6DpmS99+-HgiLC-@cluster0.ow1qm.mongodb.net/"+dbname // With user/password

const connectDb = (callback) => {
    if (_db) return callback()
    MongoClient.connect( url,  { useNewUrlParser: true }, function( err, client ) {
        if (err) return console.log(err)
        _db = client.db(dbname) 
        console.log("Database Connected")
        callback()
    })
}

const getDb = () => _db

module.exports = {
    connectDb,
    getDb
}
