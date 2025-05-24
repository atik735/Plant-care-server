const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

//middle ware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fzxwiek.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    
    const plantsCollection = client.db("plantDB").collection("plants")
    
    app.get('/plants',async(req,res) =>{

      const result = await plantsCollection.find() .toArray();
      res.send(result)
      
    })
    app.get('/plants/new',async(req,res) =>{

      const result = await plantsCollection.find().sort({ _id: -1 }).limit(6).toArray();
      res.send(result)
      
    })

    app.get('/plants/:id',async(req,res) =>{
      const id = req.params.id;
      const query ={_id: new ObjectId(id)}
      const result = await plantsCollection.findOne(query)
      res.send(result)
    })

app.get('/plants/email/:email', async (req, res) => {
  const email = req.params.email;
  const query = { userEmail: email };
  const result = await plantsCollection.find(query).toArray(); 
  res.send(result);
  
});

    //update
    app.put('/plants/:id',async (req,res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = { upsert: true };
      const updatedPlants = req.body
      const updatDoc = {
        $set: updatedPlants
      }
      const result = await plantsCollection.updateOne(filter,updatDoc,options)
      res.send(result)
    })


        //delete
    app.delete("/plants/:id",async(req,res) =>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await plantsCollection.deleteOne(query)
      res.send(result) 
    })

    app.post("/plants", async(req,res) =>{
      const newPlant = req.body;
      const result = await plantsCollection.insertOne(newPlant)
      res.send(result)

    })
    


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/",(req,res) =>{
    res.send("Plant is growing day by day")
})

app.listen(port, () =>{
    console.log(`Plant care server is running on port ${port}`)
})