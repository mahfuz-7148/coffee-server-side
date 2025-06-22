require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ebjo2ao.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const coffeeCollection = client.db('coffee-store').collection('coffees')
        const orderCollection = client.db('coffee-store').collection('orders')

        app.post('/add-coffee', async (req, res) => {
            const result = await coffeeCollection.insertOne(req.body)
            res.send(result)
        })

        app.get('/coffees', async (req, res) => {
            const allCoffees = await coffeeCollection.find().toArray()
            res.send(allCoffees)
        })

        app.get('/coffee/:id', async (req, res) => {
            const filter = {
                _id: new ObjectId((req.params.id))
            }
            const coffee = await coffeeCollection.findOne(filter)
            res.send(coffee)
        })

        app.patch('/like/:coffeeId', async (req, res) => {
            const email = req.body.email
            const filter = {
                _id: new ObjectId(req.params.coffeeId)
            }
            const coffee = await coffeeCollection.findOne(filter)
            const alreadyLiked = coffee.likedBy.includes(email)  //true
            const updateDocument = alreadyLiked ? {
                $pull: {
                    likedBy: email, //false
                },
            } : {
                $addToSet: {
                    likedBy: email, //true
                },
            }

            await coffeeCollection.updateOne(filter, updateDocument)
            res.send({ liked: !alreadyLiked })
        })







        // await client.connect();
        //
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});