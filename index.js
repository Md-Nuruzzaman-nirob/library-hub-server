const express = require('express');
const app = express()
const cors = require('cors');
const {
    MongoClient,
    ServerApiVersion,
    ObjectId
} = require('mongodb');
require('dotenv').config()

const port = process.env.PORT || 5001

// middlewares
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3v1c5gw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // await client.connect();
        // Send a ping to confirm a successful connection

        // ====> collection <====
        const categoriesCollection = client.db('Library-Hub').collection('categories')
        const BooksCollection = client.db('Library-Hub').collection('books')



        // ====> categories <====

        app.get('/api/v1/categories', async (req, res) => {
            const cursor = categoriesCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })



        // ====> book <====

        app.get('/api/v1/read-book', async (req, res) => {
            const cursor = BooksCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post('/api/v1/create-book', async (req, res) => {
            const addBook = req.body
            const result = await BooksCollection.insertOne(addBook)
            res.send(result)
        })


        app.patch('/api/v1/update-book/:id', async (req, res) => {
            const id = req.params
            const newBookData = req.body

            const query = {
                _id: new ObjectId(id)
            }
            const result = await BooksCollection.insertOne(query)
            res.send(result)
        })


        app.delete('/api/v1/delete-book/:id', async (req, res) => {
            const id = req.params
            const query = {
                _id: new ObjectId(id)
            }
            const result = await BooksCollection.deleteOne(query)
            res.send(result)
        })




        await client.db("admin").command({
            ping: 1
        });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {}
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server working perfectly')
})

app.listen(port, () => {
    console.log(`server running on this port : ${port}`);
})