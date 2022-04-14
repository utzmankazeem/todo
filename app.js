const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();
app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))

mongoose.connect("mongodb+srv://utzmankazeem:kezman222@cluster0.4p0wh.mongodb.net/todolist", {useUnifiedTopology: true})

const itemsSchema = ({
    name: String
})

const Item = new mongoose.model('Item', itemsSchema)

const item1 = new Item({
    name : "Welcome"
});
const item2 = new Item ({
    name : "add a new item"
});
const item3 = new Item({
    name : "delete an Item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){
    Item.find({}, function(er, found){
        if(found.length === 0) {
            Item.insertMany(defaultItems, function(er){
                if(er){
                    console.log(er);
                } else {
                    console.log("Items added to db")
                }
            })
            res.redirect("/")
        } else {
        res.render("list", {listTitle: "Today", newListItems: found});
        }        
    })
});

app.get("/:customList", function(req, res) {
    const customList = _.capitalize(req.params.customList);

    List.findOne({name: customList}, function(er, foundList) {
        if(!er) {
            if(!foundList){
        //crates new list
            const list = new List({
                name: customList,
                items: defaultItems
                });
                list.save();
                res.redirect("/" + customList)        
            } else {
                //Show an existing list
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
            }
        }
    })
})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
      name : itemName
  })

  if(listName === "Today"){
    item.save();
    res.redirect("/")  
  } else {
      List.findOne({name: listName}, function(err, foundList){
          foundList.items.push(item);
          foundList.save();
          res.redirect("/" + listName);
      })
  }

    
});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
      Item.findByIdAndRemove(checkedItemId, function(err){
        if (!err) {
            console.log("Successfully deleted checked item.")
            res.redirect("/")
        }
    });  
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(er, foundList){
            if(!er){
                res.redirect("/" + listName)
            }
        });
    }            
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 1200;
}
app.listen(port, function(){
    console.log("server started on port successfully")
})