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
    // const Products = client.db("ornatoMart").collection("products");
    const Categories = client.db("ornatoMart").collection("categories");
    const SubCategories = client.db("ornatoMart").collection("sub_categories");
    const Users = client.db("ornatoMart").collection("users");
    const OrnatoProducts = client.db("ornatoMart").collection("ornatoProducts");
    const Sellers = client.db("ornatoMart").collection("sellers");

    app.get("/sub_category_products/:subCategoryName", async (req, res) => {
      const subCategoryName = req.params.subCategoryName;
      const query = {
        subCategory_name: subCategoryName,
      };
      const products = await OrnatoProducts.find(query).toArray();
      res.send(products);
    });

    app.get("/sub_category_products", async (req, res) => {
      const category = req.query.category;
      const subCategory = req.query.subCategory;
      const query = {
        category_name: category,
        subCategory_name: subCategory,
      };
      const products = await OrnatoProducts.find(query).toArray();
      res.send(products);
    });

    app.get("/sellers", async (req, res) => {
      const filter = {};
      const sellers = await Sellers.find(filter).toArray();
      res.send(sellers);
    });

    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const product = await OrnatoProducts.findOne(filter);
      res.send(product);
    });

    app.get("/products", async (req, res) => {
      const filter = {};
      const products = await OrnatoProducts.find(filter).toArray();
      res.send(products);
    });

    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await OrnatoProducts.insertOne(product);
      res.send(result);
    });

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

    app.get("/categories", async (req, res) => {
      const query = {};
      const categories = await Categories.find(query).toArray();
      res.send(categories);
    });

    app.get("/sub_category/:categoryId", async (req, res) => {
      const categoryId = req.params.categoryId;
      const query = { category_id: categoryId };
      const sub_category = await SubCategories.findOne(query);
      res.send(sub_category);
    });

    app.get("/sub-categories", async (req, res) => {
      const query = {};
      const categories = await SubCategories.find(query).toArray();
      res.send(categories);
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

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await Users.insertOne(user);
      res.send(result);
    });

    app.get("/users", verifyJWT, async (req, res) => {
      const filter = {};
      const users = await Users.find(filter).toArray();
      res.send(users);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await Users.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    app.put("/users/admin/:id", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await Users.findOne(query);

      if (user.role !== "admin") {
        return res.status(401).send({ message: "Unauthorized Access" });
      }

      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedInfo = {
        $set: {
          role: "admin",
        },
      };
      const updated = await Users.updateOne(filter, updatedInfo, options);
      res.send(updated);
    });

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email };
      const user = await Users.findOne(query);

      if (user) {
        const token = jwt.sign({ email }, process.env.JWT_ACCESS_TOKEN, {
          expiresIn: "1d",
        });
        return res.send({ ornatoToken: token });
      }
      res.status(403).send({ message: "forbidden access" });
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
    });

    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await Cart.deleteOne(query);
      res.send(result);
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
