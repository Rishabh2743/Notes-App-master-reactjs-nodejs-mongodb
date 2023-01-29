const bodyParser = require('body-parser');
const express = require('express')
const noteModel = require('./note')
const MongoDB = require('./services/databaseService');
const async = require('async')
const cors = require('cors');
const usermodel = require('./usermodel');
const JWT = require('jsonwebtoken')
const secretKey = process.env.JWT_SECRET
const cookieParser = require('cookie-parser');
const verify = require('./services/authService');


const app = express()
const port = 4000
app.use(cors());
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

MongoDB.start()

//API TEST
//add of 2 no

app.post('/Add', function (req, res) {
  var first = parseInt(req.body.firstNumber);
  var second = parseInt(req.body.lastNumber);
  var sum = (first + second);
  res.send('The sum is: ' + (sum));
});

// using async 

app.post('/math', function (req, res) {
  var key = req.body.key;
  async.auto({
    add: function (cb) {
      if (key != "add") {
        return cb(null, false);
      }
      var first = parseInt(req.body.firstNumber);
      var second = parseInt(req.body.lastNumber);
      var sum = (first + second);
      return cb(null, sum);
    },

    sub: function (cb) {
      if (key != "sub") {
        return cb(null, false);
      }
      var first = parseInt(req.body.firstNumber);
      var second = parseInt(req.body.lastNumber);
      var sum = (first - second);
      return cb(null, sum);
    },

    mul: function (cb) {
      if (key != "mul") {
        return cb(null, false);
      }
      var first = parseInt(req.body.firstNumber);
      var second = parseInt(req.body.lastNumber);
      var sum = (first * second);
      return cb(null, sum);
    },

    areaSquare: function (cb) {

      if (key != "areaSquare") {
        return cb(null, false);
      }
      var first = parseInt(req.body.firstNumber);
      var sum = (first * first);
      return cb(null, sum);
    },

    areaCircule: function (cb) {
      if (key != "areaCircule") {
        return cb(null, false);
      }
      var first = parseInt(req.body.firstNumber);
      var sum = (3.14 * first * first);
      return cb(null, sum);
    },

    square: function (cb) {
      if (key != "square") {
        return cb(null, false);
      }
      var first = parseInt(req.body.firstNumber);
      var sum = (first * first);
      return cb(null, sum);
    },


    squareRoot: function (cb) {
      if (key != "squareRoot") {
        return cb(null, false);
      }
      var first = parseInt(req.body.firstNumber);
      var sum = (Math.sqrt(first));
      return cb(null, sum);
    },


  },


    function (err, results) {
      if (err) {
        return res.status(403).json({ error: err });
      }
      return res.json({ results: results[key] });
    }
  )


});
/*
// test this & and practise more
get('./get', function(req, res){
  async.auto({
    add:function (cb) {
      var first = res.body.firstelement;
      var second = res.body.secondelement;
      return cb(first+second);
      
    }
  },
   function(err, results)
   {
       if(err)
       {
        console.log("unable to add");
       }
       else

       {
        res.send(results);
       }
   },
  );
});
*/


// created local db db.json
app.get('/mynotes', (req, res) => {
  res.json(
    {
      "results": db.notes
    })
})
// JWT

//New user registration
app.post('/addNewUser', async (req, res) => {
  const data = new usermodel({
    user: req.body.user,
    password: req.body.password,
    CREATEDAT: req.body.CREATEDAT,
    // authToken:req.JWT.authToken
  });
  const val = await data.save();
  res.send("User created")

})


app.get('/newUser', (req, res) => {
  async.auto(
    {
      notes: function (cb) {
        noteModel.find().exec(function (err, noteDocs) {
          if (err) {
            // console.log("not getting noteDocs")
            return cb("Unable to fetch notes.");
          }
          return cb(null, noteDocs);
        });
      },

      user: function (cb) {
        usermodel.find().exec(function (err, userDocs) {
          if (err) {
            // console.log("unable to  get userDoc")
            return cb("Unable to fetch notes.");
          }
          return cb(null, userDocs);
        });
      },
    },
    /*
      combine: ['user', 'notes' ,  function(results, cb){
       return  results.notes.concat(results.user);
      },],
  
      function (err, results){
      // if (err) {
      //   // console.log("unable to catch error ")
      //   return res.status(403).json({ error: err });
      // }
      return res.json({ results: results.notes });
    },
    });
    */
    function (err, results) {
      if (err) {
        return res.status(403).json({ error: err });
      }
      console.log(results);
      return res.send(results.notes.concat(results.user));
      // return res.json({results:results.user});

    }
  );
});

// signup

app.post('/signup', (req, res) => {
  async.auto(
    {
      users: function (cb) {
        var userData = { email: req.body.email, password: req.body.password }
        userData.authToken = JWT.sign(userData, secretKey)

        usermodel.create(userData, (err, user) => {
          if (err) {
            return cb("Unable to signup.");
          }
          console.log(user)
          return cb(null, user);
        }

        );
      },
    },
    function (err, results) {
      if (err) {
        return res.status(403).json({ error: err });
      }
      return res.json({ results: results.users });

    }
  );
});

//login
app.post('/login', (req, res) => {
  async.auto(
    {
      users: function (cb) {
        usermodel.findOne({ email: req.body.email, password: req.body.password }, (err, user) => {

          if (err) {
            return cb("Unable to login.");
          }
          try{
            var token = JWT.sign({ email: user.email, password: user.password }, secretKey)   
            return cb(null, token )    
          }
          catch(err){
             return cb(null, false)
          }
        }

        );
      },
    },
    function (err, results) {
      if (err) {
        return res.status(403).json({ error: err });
      }
      if (!results.users) { return res.json({ results: "unable to login" }) }
      res.cookie("authToken", results.users ,{httpOnly: true, expires:new Date(Date.now()+60*1000*60*24)}).send(" succesfully logged in")
    }
  );
});


//logout

app.get('/logout', (req, res) => {
  res.cookie("authToken", "" ,{httpOnly: true}).send("Logged out!");
});




/*
//register
app.post('/register', (req, res) => {
  async.auto(
    { createUser: 'addAB', function(a){   
        usermodel.create({
        email:req.body.email,
          password:req.body.password}, 
         (err, user) => {
          if(err){
            return cb("unable to add user");
          }
          return a(null,user);
        });
      },

     function (err, results) {
      if (err) {
        return res.status(403).json({ error: err });
      }
      return res.json({ results: results.createUser });
    },
    };
  
  });
*/

//fetching from cloud
app.get('/newnote', (req, res) => {
  async.auto({
    notes: function (cb) {
      noteModel.find().exec(function (err, notes) {
        if (err) {
          return cb("Unable to fetch notes.");
        }
        console.log(notes)
        return cb(null, notes);
      });
    }
  }, function (err, results) {
    if (err) {
      return res.status(403).json({ error: err });
    }
    return res.json({ results: results.notes });
  });
});




//post api for mongodb ->inserting data
app.post("/newnotePost", async (req, res) => {
  const data = new noteModel({
    description: req.body.description,
    title: req.body.title,
  });

  const val = await data.save();

  res.send("Note Sucessfully Created");
}),

  //post api for local database
  app.post('/new', (req, res) => {
    var note = req.body && req.body.note || {};
    console.log("note: ", note)
    console.log("check: ", (!note))
    var description = note.description || false;
    var title = note.title || false;
    var error = {};

    if (!(!!note)) {
      console.log("val", note)
      error.note = "Note is not provided";
      res.status(403).json(error);
    }

    if (!description) {
      error.description = "Please add descp";
    }

    if (!title) {
      error.title = "Please add title";
    }

    if (error) {
      res.status(403).json(error);
    }
    var notes = db.notes
    var note = req.body.note

    notes.push(note)
    fs.writeFile("db.json", JSON.stringify({ notes: notes }), () => { })

    res.send({
      "result": "created successfully",
    })
  })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})













