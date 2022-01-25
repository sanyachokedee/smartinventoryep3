// importt Express
const express = require('express')

// import express flash
const flash = require('express-flash')

// import express session
const session = require('express-session')

// import EJS Layout
const expressLayouts = require('express-ejs-layouts')

// import Method Override
const methodOverride = require('method-override')

// import router frontend.js
const frontendRouter = require('./routes/frontend')

// Import Router backend.js
const backendRouter = require('./routes/backend')

// Import Router api.js
const apiRouter = require('./routes/api')


// Create express object
const app = express()

// กำหนด Port สำหรับรันโปรเจตกรณี Deploy ขึ้น Heroku
const port = process.env.PORT || 5000


// Fix CORS
var allowCrossDomain = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Cache-Control");

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next()
    }
};
app.use(allowCrossDomain)


// กำหนด Folder สำหรับบอกตัว express ว่าไฟล css , image อยู่ path ไหน
app.use(express.static('assets'))

// เรียกใช้  Method Override
app.use(methodOverride('_method'))

// กำหนด Template Engine
app.use(expressLayouts)
app.set('layout', './layouts/frontend')
app.set('view engine', 'ejs')

// กำหนดค่าให้สามารถรับค่าจากฟอร์มได้
app.use(express.json())
app.use(express.urlencoded({extended: false}))

// เรียกใช้งาน Express-Session
app.use(session({
    cookie: { maxAge: 6000 },
    store: new session.MemoryStore,
    saveUninitialized: true,
    resave: 'true',
    secret: 'secret'
}))

// เรียกใช้ Express flash
app.use(flash())

// เรียกใช้งาน Routes
app.use('/', frontendRouter)
app.use('/backend', backendRouter)
app.use('/api', apiRouter)

// Run Express Server ที่ port 5000
app.listen(port, () => {
    console.log('Server run at port ='+ port);
})

