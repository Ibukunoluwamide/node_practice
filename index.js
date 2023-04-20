const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const URI = "mongodb+srv://olamidealao:Ibukunoluwa@cluster0.afm67gs.mongodb.net/students_db?retryWrites=true&w=majority"
app.use(bodyParser.urlencoded({ extended: true }))
app.set("view engine", "ejs")
mongoose.connect(URI)
    .then((result) => {
        console.log("Connected to MongoDB database");
    }).catch((err) => {
        console.log(err);
    });
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html")
})
app.get('/signup', (req, res) => {
    res.render("signup")
})
let studentDetails = {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}
let userModel = mongoose.model("students_collection", studentDetails)
app.post('/signup', (req, res) => {
    console.log(req.body);
    let form = new userModel(req.body)
    form.save()
        .then((result) => {
            console.log("Student details has been sent to mongodb");
            res.redirect("signin")
        }).catch((err) => {
            console.log(err);
            if (err.code === 11000) {
                console.log("email already exist");
            }
        });
})
app.get('/signin', (req, res) => {
    res.render("signin", { message: "" })
})
app.post('/signin', (req, res) => {
    userModel.find({ email: req.body.email, password: req.body.password })
        .then((result) => {
            if (result.length > 0) {
                res.redirect("dashboard")
            } else {
                console.log("Incorrect email or password");
                res.render("signin", { message: "Incorrect email or password" })
            }
        }).catch((err) => {
            console.log(err);
        });
})

app.get('/dashboard', (req, res) => {
    userModel.find()
        .then((result) => {
            res.render("dashboard", { result })
        }).catch((err) => {
            console.log(err);
        });
})

app.post('/delete', (req, res) => {
    userModel.findOneAndDelete({ email: req.body.userEmail })
        .then((response) => {
            console.log(response);
            res.redirect('dashboard')
        })
})

app.post('/edit', (req, res) => {
    userModel.findOne({ email: req.body.userEmail })
        .then((response) => {
            console.log(response);
            res.render('editUser', { userDetails: response })
        })
})

app.post('/update', (req, res) => {
    let id = req.body.id
    userModel.findByIdAndUpdate(id, req.body)
        .then((response) => {
            console.log(response);
            res.redirect('dashboard')
        }).catch((err)=>{
            console.log(err);
        })
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))