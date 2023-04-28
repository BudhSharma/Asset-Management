const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://HemantSharma:Hemant123@cluster0.g7iydvj.mongodb.net/adminDB?retryWrites=true&w=majority",{
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(()=> console.log("DataBase Connected")).catch((errr)=>{
    console.log(errr);
})