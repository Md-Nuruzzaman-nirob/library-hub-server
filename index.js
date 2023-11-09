const express = require('express');
const app = express()
const cors = require('cors');
const {
    MongoClient,
    ServerApiVersion,
    ObjectId
} = require('mongodb');
require('dotenv').config()
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken');

const port = process.env.PORT || 5001

// middlewares
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'library-hub-server.vercel.app'],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3v1c5gw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const verifyToken = (req, res, next) => {
    console.log(req.query.email);
    const token = req.cookies.token
    console.log(token);
    if (!token) {
        return res.status(401).send({
            message: 'unauthorize access'
        })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: 'unauthorize access'
            })
        }
        req.user = decoded
        next()
    })
}


async function run() {
    try {

        // ====> collection <====
        const categoriesCollection = client.db('Library-Hub').collection('categories')
        const booksCollection = client.db('Library-Hub').collection('books')
        const borrowCollection = client.db('Library-Hub').collection('borrow')



        // jwt
        app.post('/api/v1/jwt', async (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: '1h'
            });
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            }).send({
                success: true
            });

        })

        // Logout
        app.post('/api/v1/jwt/logout', async (req, res) => {
            res.clearCookie('token')
                .send({
                    success: true
                });
        });



        // ====> categories <====

        app.get('/api/v1/categories', async (req, res) => {
            const cursor = categoriesCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })



        // ====> book <====

        app.get('/api/v1/read-book', async (req, res) => {
            const cursor = booksCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post('/api/v1/create-book', async (req, res) => {
            const addBook = req.body
            const result = await booksCollection.insertOne(addBook)
            res.send(result)
        })


        app.patch('/api/v1/update-book/:id', async (req, res) => {
            const id = req.params
            const newBookData = req.body

            const query = {
                _id: new ObjectId(id)
            }

            const updateBook = {
                $set: {
                    quantity: newBookData.quantity,
                }
            }
            const result = await booksCollection.updateOne(query, updateBook)
            res.send(result)
        })

        app.patch('/api/v1/update-book/all-content/:id', async (req, res) => {
            const id = req.params
            const newBookData = req.body

            const query = {
                _id: new ObjectId(id)
            }

            const updateBook = {
                $set: {
                    bookTitle: newBookData.bookTitle,
                    authorName: newBookData.authorName,
                    category: newBookData.category,
                    quantity: newBookData.quantity,
                    imageUrl: newBookData.imageUrl,
                    description: newBookData.description,
                    date: newBookData.date,
                    rating: newBookData.rating,
                    content: newBookData.content,
                }
            }
            const result = await booksCollection.updateOne(query, updateBook)
            res.send(result)
        })

        app.delete('/api/v1/delete-book/:id', async (req, res) => {
            const id = req.params
            const query = {
                _id: new ObjectId(id)
            }
            const result = await booksCollection.deleteOne(query)
            res.send(result)
        })


        //  ====> borrow <====

        app.get('/api/v1/borrow-book', verifyToken, async (req, res) => {
            console.log(req.query.email);
            console.log(req.user.email);
            if (req.user.email !== req.query.email) {
                return res.status(403).send({
                    message: 'forbidden access'
                })
            }
            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                };

            }

            const cursor = booksCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post('/api/v1/borrow-book', async (req, res) => {
            const borrowBook = req.body
            const result = await borrowCollection.insertOne(borrowBook)
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