require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

const mongoUsername = process.env.MONGO_USERNAME;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoUri = `mongodb+srv://${mongoUsername}:${mongoPassword}@cluster0.26b0k0v.mongodb.net/todolistDB`;

mongoose.connect(mongoUri);

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to my todo list!"
});

const item2 = new Item({
    name: "Hit + button to add new task."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){
    
    Item.find({

    })
    .then(foundItems => {
        if(foundItems.length === 0){
            Item.insertMany(defaultItems)
            .then(console.log("Inserted Items in DB."));
            res.redirect("/");
        } else {
            res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
    })
});

app.post("/", function(req, res){

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    } else {
        List.findOne(
            {name: listName}
        )
        .then(foundList => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", function(req, res){
    const checkItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndDelete(checkItemId)
        .then(console.log("Deleted item successfully"));
        res.redirect("/");
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId}}})
        .then(res.redirect("/" + listName));
    }
});

app.get("/:customListName", function(req, res){ //express routing
   const customListName = _.capitalize(req.params.customListName);

   List.findOne(
        {name: customListName}
   )
   .then(listExist => {
        if(!listExist){
            const list = new List({
                name: customListName,
                items: defaultItems
           });

           list.save();

           res.redirect("/" + customListName);

        } else{
            res.render("list", {listTitle: listExist.name, newListItems: listExist.items});
        }
   });
});

app.get("/about", function(req, res){
    res.render("about");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log(`Server started on port ${PORT}`);
});