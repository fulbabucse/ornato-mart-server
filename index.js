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
    const Review = client.db("ornatoMart").collection("review");
    const FlashSale = client.db("ornatoMart").collection("flashSale");
    const Province = client.db("ornatoMart").collection("province");
    const Cities = client.db("ornatoMart").collection("cities");

    app.get("/area", async (req, res) => {
      const area = req.query.area;
      const query = { city_name: area };
      const result = await Cities.find(query).toArray();
      res.send(result);
    });

    app.get("/cities", async (req, res) => {
      const province = req.query.province;
      const query = {
        province_name: province,
      };
      const cities = await Cities.find(query).toArray();
      res.send(cities);
    });

    app.get("/provinces", async (req, res) => {
      const query = {};
      const provinces = await Province.find(query).toArray();
      res.send(provinces);
    });

    app.get("/flashSale", async (req, res) => {
      const query = {};
      const products = await FlashSale.find(query).toArray();
      res.send(products);
    });

    app.get("/reviews", async (req, res) => {
      const productId = req.query.productId;
      const query = {
        productId: productId,
      };
      const reviews = await Review.find(query).sort({ createAt: -1 }).toArray();
      res.send(reviews);
    });

    app.post("/reviews", async (req, res) => {
      const reviewBody = req.body;
      const review = {
        reviewerName: reviewBody.reviewerName,
        email: reviewBody.email,
        reviewedAt: reviewBody.reviewedAt,
        createAt: reviewBody.createAt,
        productId: reviewBody.productId,
        product_name: reviewBody.product_name,
        subCategory_name: reviewBody.subCategory_name,
        reviewImage: reviewBody.reviewImage,
        rating: parseFloat(reviewBody.rating),
        review_message: reviewBody.review_message,
      };
      const result = await Review.insertOne(review);
      res.send(result);
    });

    app.get("/shop_products", async (req, res) => {
      const shopName = req.query.shopName;
      const query = { seller_name: shopName };
      const result = await OrnatoProducts.find(query).toArray();
      res.send(result);
    });

    app.get("/category/:categoryName", async (req, res) => {
      const categoryName = req.params.categoryName;
      const query = { category_name: categoryName };
      const categoryProducts = await OrnatoProducts.find(query).toArray();
      res.send(categoryProducts);
    });

    app.get("/category-products", async (req, res) => {
      const categoryName = req.query.categoryName;
      const query = {
        category_name: categoryName,
      };
      const products = await OrnatoProducts.find(query).toArray();
      res.send(products);
    });

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

    app.get("/sellers/:name", async (req, res) => {
      const sellerName = req.params.name;
      const query = {
        seller_name: sellerName,
      };
      const result = await Sellers.findOne(query);
      res.send(result);
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
      const order = req.query.order === "high" ? 1 : -1;
      const products = await OrnatoProducts.find(filter)
        .sort({ price: order })
        .toArray();
      res.send(products);
    });

    app.post("/products", async (req, res) => {
      const product = req.body;

      const insertProduct = {
        brand_name: product.brand_name,
        category_name: product.category_name,
        location: product.location,
        price: parseInt(product.price),
        product_color: product.product_color,
        product_discount: product.product_discount,
        product_main_materials: product.product_main_materials,
        product_name: product.product_name,
        product_rating: parseFloat(product.product_rating),
        product_image: product.product_image,
        product_size: product.product_size,
        product_stock_size: product.product_stock_size,
        product_warranty: product.product_warranty,
        service_type: product.service_type,
        subCategory_name: product.subCategory_name,
        seller_name: product.seller_name,
      };

      const result = await OrnatoProducts.insertOne(insertProduct);
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

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await Users.findOne(query);
      res.send(user);
    });

    app.put("/users", async (req, res) => {
      const email = req.query.email;
      const data = req.body;
      const query = { email: email };
      const options = { upsert: true };
      const updateInfo = {
        $set: {
          province: data.province,
          city: data.city,
          address: data.address,
          phone: data.phone,
          area: data.area,
        },
      };
      const updated = await Users.updateOne(query, updateInfo, options);
      res.send(updated);
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

    app.get("/cart", async (req, res) => {
      let query = { email: req.query.email };
      const result = await Cart.find(query).toArray();
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
