const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

// verify function.......
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'unAuthorized Access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'Forbidden Access' });
    }
    // console.log('decoded',decoded);
    req.decoded = decoded;
    next();
  });
  // console.log('inside verifyJWT',authHeader);
}

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

    // jwt Authentication
    app.post('/login', async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d',
      });
      res.send({ accessToken });
    });

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

    app.put('/product/:id', async (req, res) => {
      const id = req.params.id;
      const productQuantity = req.body;
      const objectId = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          stock: productQuantity.quantity,
        },
      };
      const result = await carCollection.updateOne(
        objectId,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.put('/productStock/:id', async (req, res) => {
      const id = req.params.id;
      const productQuantity = req.body;
      const objectId = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          stock: productQuantity.newStock,
        },
      };
      const result = await carCollection.updateOne(
        objectId,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.delete('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await carCollection.deleteOne(query);

      res.send(result);
    });

    app.post('/product', async (req, res) => {
      const newProduct = req.body;
      const result = await carCollection.insertOne(newProduct);

      res.send(result);
    });

    app.get('/myItems', verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;

      const email = req.query.email;
      // console.log(email);
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = await carCollection.find(query);
        const items = await cursor.toArray();

        res.send(items);
      } else {
        res.status(403).send({ message: 'forbidden access' });
      }
    });
  } finally {
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('car dealer sever connected');
});
app.get('/success', (req, res) => {
  res.send('car dealer sever connected successfully');
});

app.listen(port, () => {
  console.log(`Listening to port${port}`);
});
