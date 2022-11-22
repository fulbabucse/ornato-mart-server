const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
require("dotenv").config();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Ornato Mart server Running");
});

const verifyJWT = (req, res, next) => {
  const authToken = req.headers.authorization;
  if (!authToken) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authToken.split(" ")[1];
  jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.7ywptfp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const Cart = client.db("ornatoMart").collection("cart");
    const Products = client.db("ornatoMart").collection("products");
    const Categories = client.db("ornatoMart").collection("categories");
    const SubCategories = client.db("ornatoMart").collection("sub_categories");

    app.post("/categories", async (req, res) => {
      const category = req.body;
      const result = await Categories.insertOne(category);
      res.send(result);
    });

    app.post("/sub-categories", async (req, res) => {
      const subCategory = req.body;
      const result = await SubCategories.insertOne(subCategory);
      res.send(result);
    });

    app.get("/sub-category/men", async (req, res) => {
      const query = { category_name: "Men's Fashion" };
      const subCategory = await SubCategories.find(query).toArray();
      res.send(subCategory);
    });

    app.get("/sub-category/women", async (req, res) => {
      const query = { category_name: "Women's Fashion" };
      const subCategory = await SubCategories.find(query).toArray();
      res.send(subCategory);
    });

    app.get("/sub-category/electronics-devices", async (req, res) => {
      const query = { category_name: "Electronics Devices" };
      const subCategory = await SubCategories.find(query).toArray();
      res.send(subCategory);
    });

    app.get("/sub-category/babies-toys", async (req, res) => {
      const query = { category_name: "Babies & Toys" };
      const subCategory = await SubCategories.find(query).toArray();
      res.send(subCategory);
    });

    app.get("/sub-category/health-beauty", async (req, res) => {
      const query = { category_name: "Health and Beauty" };
      const subCategory = await SubCategories.find(query).toArray();
      res.send(subCategory);
    });

    app.get("/sub-category/automotive-motorbike", async (req, res) => {
      const query = { category_name: "Automotive Motorbike" };
      const subCategory = await SubCategories.find(query).toArray();
      res.send(subCategory);
    });

    app.get("/sub-category/electronics-accessories", async (req, res) => {
      const query = { category_name: "Electronics Accessories" };
      const subCategory = await SubCategories.find(query).toArray();
      res.send(subCategory);
    });

    app.get("/sub-category/tv-appliance", async (req, res) => {
      const query = { category_name: "Tv & Home Appliance" };
      const subCategory = await SubCategories.find(query).toArray();
      res.send(subCategory);
    });

    app.get("/categories", async (req, res) => {
      const query = {};
      const result = await Categories.find(query).toArray();
      res.send(result);
    });

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.JWT_ACCESS_TOKEN, {
        expiresIn: "2d",
      });
      res.send({ token });
    });

    app.post("/cart", async (req, res) => {
      const product = req.body;
      const result = await Cart.insertOne(product);
      res.send(result);
    });

    app.get("/cart", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: "Forbidden access" });
      }
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }

      const cursor = Cart.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await Cart.findOne(query);
      res.send(result);
      console.log(result);
    });

    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await Cart.deleteOne(query);
      res.send(result);
      console.log(result);
    });

    app.get("/products", async (req, res) => {
      const searchText = req.query.search;
      let query = {};
      if (searchText.length) {
        query = {
          $text: {
            $search: searchText,
          },
        };
      }
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const cursor = Products.find(query);
      const products = await cursor
        .skip(page * size)
        .limit(size)
        .toArray();
      const count = await Products.estimatedDocumentCount();
      res.send({ count, products });
    });
  } finally {
  }
};

run().catch((err) => {
  console.log(err.name, err.message);
});

app.listen(port, () => {
  console.log(`Ornato server running on port: ${port}`);
});
