const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.emahksk.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const productsCollection = client
      .db("handsaw-heaven")
      .collection("products");
    const specialCollection = client.db("handsaw-heaven").collection("special");
    const reviewCollection = client.db("handsaw-heaven").collection("reviews");
    const ordersCollection = client.db("handsaw-heaven").collection("orders");
    const userCollection = client.db("handsaw-heaven").collection("users");
    const profileCollection = client.db("handsaw-heaven").collection("profile");
    const portfolioCollection = client
      .db("handsaw-heaven")
      .collection("portfolio");

    //Get
    app.get("/products", async (req, res) => {
      const query = {};
      const products = await productsCollection.find(query).toArray();
      res.send(products);
    });
    //Get
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.send(product);
    });
    //Get
    app.get("/special", async (req, res) => {
      const query = {};
      const special = await specialCollection.find(query).toArray();
      res.send(special);
    });
    //Get
    app.get("/reviews", async (req, res) => {
      const query = {};
      const reviews = await reviewCollection.find(query).toArray();
      res.send(reviews);
    });
    //Post
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const reviews = await reviewCollection.insertOne(review);
      res.send(reviews);
    });
    // Get
    app.get("/orders", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (decodedEmail === email) {
        const qurey = { email: email };
        const orders = await ordersCollection.find(qurey).toArray();
        return res.send(orders);
      } else {
        return res.status(403).send({ message: "forbidden access" });
      }
    });

    //Post
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const orders = await ordersCollection.insertOne(order);
      res.send(orders);
    });

    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === "admin";
      res.send({ admin: isAdmin });
    });
    //Put admin api
    app.put("/user/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({
        email: requester,
      });
      if (requesterAccount.role === "admin") {
        const filter = { email: email };
        const updateDoc = {
          $set: { role: "admin" },
        };
        const results = await userCollection.updateOne(filter, updateDoc);
        res.send(results);
      } else {
        res.status(403).send({ message: "forbidden" });
      }
    });
    //Put user api
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const results = await userCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      res.send({ results, token });
    });

    //Put profile
    app.put("/myprofile/:email", async (req, res) => {
      const email = req.params.email;
      const profileInfo = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: profileInfo,
      };
      const results = await profileCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      res.send({ results, token });
    });
    //Put Portfolio
    app.put("/myPortfolio/:email", async (req, res) => {
      const email = req.params.email;
      const portfolioInfo = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: portfolioInfo,
      };
      const results = await portfolioCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      res.send({ results, token });
    });
    // Get User
    app.get("/user", verifyJWT, async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    // Post
    app.post("/addProduct", async (req, res) => {
      const product = req.body;
      const addProduct = await productsCollection.insertOne(product);
      res.send(addProduct);
    });
    // DELETE product
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const removeProduct = await productsCollection.deleteOne(query);
      res.send(removeProduct);
    });
    // DELETE user
    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const removeUser = await userCollection.deleteOne(query);
      res.send(removeUser);
    });

    console.log("Connected successfully to server");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Handsaw Heaven server is running!");
});

app.listen(port, () => {
  console.log(`Heaven app listening on port ${port}`);
});
