// Import Express
const express = require('express')

// Import Moment เพื่อไว้จัดรูปแบบวันที่
const moment = require('moment')

// Import ObjectID ของ MongoDb
const objectId = require('mongodb').ObjectId

const router = express.Router()
// Import mongodb_dbconfig
const { connectDb, getDb } = require('../config/mongdb_dbconfig')
var db
connectDb(() => (db = getDb()))


// CRUD Category ================================================
// Read Category
router.get('/categories', async (req, res)=>{

    const categories = await db.collection('category').find({}, { sort: { CategoryID: -1 } }).toArray()
            
    res.json(categories)
   
})

// Read Category By ID
router.get('/category/:id', async (req, res) => {
    const objID = new objectId(req.params.id)
    console.log(objID);
    const category = await db.collection('category').find({"_id": objID}).toArray()

    


    res.json(category) 
    
})

router.post('/create_category', async (req, res) => {
    
    // การอ่าน Category ID ล่าสุด
    const category = await db.collection('category').findOne({}, {sort: {CategoryID:-1}, limit: 1})
    const CategoryID = category.CategoryID + 1

    
    // ทดสอบ
    // console.log(category.CategoryID)
    // return 0

    // รับค่าจากฟอร์ม
    // let CategoryID = req.body.CategoryID  // ไม่ต่องกรอกจากฟอร์ม
    let CategoryName = req.body.CategoryName
    let CategoryStatus = req.body.CategoryStatus
    let curdatetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    let errors = false

    // console.log(CategoryID + CategoryName + CategoryStatus)

    // Validate ฟอร์มว่าป้อนข้อมูลครบหรือยัง
    if(CategoryName.length === 0 || CategoryStatus === '')
    {
        // แสดงข้อความแจ้งเตือน
        res.json({ 'msg': 'ป้อนข้อมูลให้ครบฟิลด์ก่อน' })
        
    }else{
        // Insert to mongodb
        await db.collection('category').insertOne({
            // CategoryID: parseInt(CategoryID), // ของเดิมที่ไม่ยังไม่มีการ find
            CategoryID: CategoryID,
            CategoryName: CategoryName,
            CategoryStatus: parseInt(CategoryStatus),
            CreatedDate: curdatetime,
            ModifiedDate: curdatetime
        })

         // แสดงข้อความแจ้งเตือน
         res.json({ 'msg': 'เพิ่มรายการเรียบร้อย' })
    }
})

// Edit Category PUT บันทึกเข้าเมื่อแก้ไขแล้ว
router.put('/edit_category/:id', async (req, res) => {
    console.log('edit_category'+req.params.id);
    // return 0

    const objID = new objectId(req.params.id)
    const category = await db.collection('category').find({ "_id": objID }).toArray()
    
// รับค่าจากฟอร์ม
    // let CategoryID = req.body.CategoryID  // ไม่ต่องกรอกจากฟอร์ม
    let CategoryName = req.body.CategoryName
    let CategoryStatus = req.body.CategoryStatus
    let curdatetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")

    // console.log(CategoryID + CategoryName + CategoryStatus)

    // Validate ฟอร์มว่าป้อนข้อมูลครบหรือยัง
    if(CategoryName.length === 0 || CategoryStatus === '')
    {
        // แสดงข้อความแจ้งเตือน
        res.json({ 'msg': 'ป้อนข้อมูลให้ครบฟิลด์ก่อน' })

    }else{
        // Insert to mongodb
        await db.collection('category').updateOne({ _id: objID },
            {
                $set: {
                    CategoryName: CategoryName,
                    CategoryStatus: parseInt(CategoryStatus),
                    ModifiedDate: curdatetime  
                }                
            }            
        )
        // แสดงข้อความแจ้งเตือน
        res.json({ 'msg': 'เพิ่มรายการเรียบร้อย' })
    }
})

// DELETE Category
// router.delete('/delete_category/:id', async (req, res) => {
//     console.log('delete = '+req.params.id);
//     // return 0
//     const objID = new objectId(req.params.id)
//     await db.collection('category').deleteOne({ "_id": objID })
//     // แสดงข้อความแจ้งเตือน
//     res.json({ 'msg': 'เพิ่มรายการเรียบร้อย' })
// })


// DELETE Category with try catch
router.delete('/delete_category/:id', async (req, res) => {
    // console.log('delete = '+req.params.id);
    // return 0
    try {
        const objID = new objectId(req.params.id)
        // console.log('delete 2= '+req.params.id);
        await db.collection('category').deleteOne({ "_id": objID })

        // แสดงข้อความแจ้งเตือน
        res.json({ 'msg': 'ลบรายการแล้ว' })
    } catch (error) {
        // console.log('delete 3 = '+req.params.id);
        // แสดงข้อความแจ้งเตือน
        res.json({ 'msg': 'ไม่พบข้อมูล ผิดพลาด '+error })
    }
    
})

// CRUD product ================================================
// Read product
router.get('/products', async (req, res)=>{

    // const products = await db.collection('products').find({}).toArray()

    // Lookup from category and products collection
    const products = await db.collection('products').aggregate(
        [
            {
               $lookup: {
                 from: 'category',
                 localField: 'CategoryID',
                 foreignField: 'CategoryID',
                 as: 'category'
               } 
            },
            {
                $match:{
                    "products":{"$ne":[]}
                }
            },
            { 
                $sort: {
                    // "ProductID": -1
                    "_id": -1
                }
            },
        ]
    ).toArray()

    // console.log(products);
    res.json(products)
})


// Create Product POST
router.post('/create_product', async (req, res)=>{
    const category = await db.collection('category').find({}).toArray()
    console.log(category);

    // Increment ProductID
    const product = await db.collection('products').findOne({}, {sort: {ProductID: -1}, limit: 1 })
    // console.log(product)

    const productID = product.ProductID + 1
    //console.log(productID)

    // return 0

    // รับค่าจากฟอร์ม
    let ProductName = req.body.ProductName
    let CategoryID = req.body.CategoryID
    let UnitPrice = req.body.UnitPrice
    let UnitInStock = req.body.UnitInStock
    let ProductPicture = req.body.ProductPicture
    let curdatetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    // let errors = false

    // console.log(CategoryID+CategoryName+CategoryStatus)
    // Validate ฟอร์มว่าป้อนข้อมูลครบหรือยัง
    if(CategoryID === '' || ProductName.length === 0 || UnitPrice === '' || UnitInStock === '')
    {
        // errors = true
        // แสดงข้อความแจ้งเตือน
        res.json({ 'msg': 'ใส่ข้อมูลให้ครบก่อน' })

    }else{
        // Insert to mongodb
        await db.collection('products').insertOne({
            ProductID: productID,
            CategoryID: parseInt(CategoryID),
            ProductName: ProductName,
            UnitPrice: parseInt(UnitPrice),
            ProductPicture: ProductPicture,
            UnitInStock: parseInt(UnitInStock),
            CreatedDate: curdatetime,
            ModifiedDate: curdatetime
        })

        // แสดงข้อความแจ้งเตือน
        res.json({'msg':'บันทึกเรียบร้อย'})
    }
})


// Edit Product PUT
router.put('/edit_product/:id', async (req, res)=>{
    // console.log(req.params.id)

    const objID = new objectId(req.params.id)
    const product = await db.collection('products').find({"_id" : objID}).toArray()
    const category = await db.collection('category').find({}).toArray()

    // รับค่าจากฟอร์ม
    let CategoryID = req.body.CategoryID
    let ProductName = req.body.ProductName
    let UnitPrice = req.body.UnitPrice
    let UnitInStock = req.body.UnitInStock
    let ProductPicture = req.body.ProductPicture
    let curdatetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    let errors = false

    // Validate ฟอร์มว่าป้อนข้อมูลครบหรือยัง
    if(ProductName.length === 0 || UnitPrice === '' || UnitInStock === '')
    {
        errors = true
        // แสดงข้อความแจ้งเตือน
        res.json({ 'msg': 'ใส่ข้อมูลให้ครบก่อน' })  
    }else{
        // Update to mongodb
        await db.collection('products').updateOne({ _id: objID}, 
        {
			$set: {
				CategoryID: parseInt(CategoryID),
                ProductName: ProductName,
                UnitPrice: parseInt(UnitPrice),
                ProductPicture: ProductPicture,
                UnitInStock: parseInt(UnitInStock),
                ModifiedDate: curdatetime
			}
		})

        // แสดงข้อความแจ้งเตือน
        res.json({ 'msg': 'แก้ไขรายการแล้ว' })
    }
    
})

// DELETE Product
router.delete('/delete_product/:id', async (req, res) => {
 
    try {
        const objID = new objectId(req.params.id)
        await db.collection('products').deleteOne({ "_id": objID })
        // แสดงข้อความแจ้งเตือน
        res.json({ 'msg': 'ลบรายการเรียบร้อย' })
        // console.log(objID)
        // res.redirect('/backend/products')
    } catch (error) {
        // แสดงข้อความแจ้งเตือน
        res.json({ 'msg': 'พบข้อผิดพลาด' })
    }
    
})

// Export CSV Product
router.get('/exportcsv_products', async (req, res) => {
    // Lookup from category and products collection
    const products = await db.collection('products').aggregate(
        [
            {
               $lookup: {
                 from: 'category',
                 localField: 'CategoryID',
                 foreignField: 'CategoryID',
                 as: 'category'
               } 
            },
            {
                $match:{
                    "products":{"$ne":[]}
                }
            },
            { 
                $sort: {
                    // "ProductID": -1
                    "_id": -1
                }
            },
        ]
    ).toArray()

    // CSV Writer
    let file_csv_name = "./csvexport/product-" + moment(new Date()).format("YYYY-MM-DD-ss") + ".csv"
    
    // CSV Header
    const csvWriter = createCsvWriter({
        path: file_csv_name,
        header: [
            { id: "ProductID", title: "ProductID" },
            { id: "CategoryID", title: "CategoryID" },
            { id: "ProductName", title: "ProductName" },
            { id: "UnitPrice", title: "UnitPrice" },
            { id: "UnitInStock", title: "UnitInStock" }
        ]
    })

    csvWriter.writeRecords(products).then(() => {
        res.download(file_csv_name)
    })
})

// Export PDF Product
router.get('/exportpdf_products', async (req, res) => {
    const products = await db.collection('products').aggregate(
        [
            {
               $lookup: {
                 from: 'category',
                 localField: 'CategoryID',
                 foreignField: 'CategoryID',
                 as: 'category'
               } 
            },
            {
                $match:{
                    "products":{"$ne":[]}
                }
            },
            { 
                $sort: {
                    // "ProductID": -1
                    "_id": -1
                }
            },
        ]
    ).toArray()

    // Export PDF
    let file_pdf_name = "./pdfexport/product-"+moment(new Date()).format("YYYY-MM-DD-ss")+".pdf"

    ejs.renderFile(path.join(__dirname,'../views/pages/backend/',"demopdf.ejs"),{
        products:  products}, (err, data) => {
            if(err){
                res.send(err)
            }else{
                let options = {
                    "height": "297mm",
                    "width": "210mm",
                    "borders":"1cm",
                    "header": {
                        "height": "20mm"
                    },
                    "footer": {
                        "height": "20mm",
                    },
                }
                pdf.create(data, options).toFile(file_pdf_name, function(err, data){
                    if(err){
                        res.send(err)
                    }else{
                        res.download(file_pdf_name)
                    }
                })
            }

        }
    )
})



module.exports = router