//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("");

const itemSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to todolist!",
});

const item2 = new Item({
  name: "Hit the + button to add new item!",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}).then(function (items) {
    if (items.length === 0) {
      Item.insertMany(defaultItems).then(() => {
        console.log("Successfull saved");
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: items });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then((foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect(listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItemiD = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.deleteOne({ _id: checkedItemiD }).then(function () {
      console.log("Successfully deleted");
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemiD } } }
    ).then(() => {
      res.redirect(listName);
    });
  }
});

app.get("/:page", function (req, res) {
  const page = req.params.page;

  List.findOne({ name: page }).then(function (listItem) {
    if (!listItem) {
      const list = new List({
        name: page,
        items: defaultItems,
      });
      list.save();
      console.log("Doesn't exists so saved");
      res.redirect(page);
    } else {
      res.render("list", {
        listTitle: _.capitalize(listItem.name),
        newListItems: listItem.items,
      });
    }
  });
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function (req, res) {
  console.log("Server is running on port 3000");
});
