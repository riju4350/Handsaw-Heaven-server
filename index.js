const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://riju4350:vz1LxjZZeULxGAME@cluster0.emahksk.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const productsCollection = client.db("handsaw-heaven").collection("products");
    const specialCollection = client.db("handsaw-heaven").collection("special");
    const reviewCollection = client.db("handsaw-heaven").collection("reivews");
    
    app.get('/products', async(req,res)=>{
      const query = {};
      const products = await productsCollection.find(query).toArray();
      res.send(products);
    })
    app.get('/special', async(req,res)=>{
      const query = {};
      const special = await specialCollection.find(query).toArray();
      res.send(special);
    })
    app.get('/reviews', async(req,res)=>{
      const query = {};
      const reviews = await reviewCollection.find(query).toArray();
      res.send(reviews);
    })
    console.log("Connected successfully to server");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Handsaw Heaven!')
})

app.listen(port, () => {
  console.log(`Heaven app listening on port ${port}`)
})