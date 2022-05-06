const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jqbo6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const carCollection = client.db('car-dealer').collection('product');
    app.get('/product', async (req, res) => {
      const query = {};
      const cursor = carCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await carCollection.findOne(query);
      res.send(product);
    });


  } finally {
    
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('car dealer sever connected');
});

app.listen(port, () => {
  console.log(`Listening to port${port}`);
});
