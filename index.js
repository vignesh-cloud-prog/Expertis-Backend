const express= require('express');
const mongoose=require('mongoose')

const app=express();

mongoose.Promise = global.Promise;
mongoose
  .connect('mongodb://localhost/ourdata', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    () => {
      console.log("Database connected");
    },
    (error) => {
      console.log("Database can't be connected: " + error);
    }
  );

app.use(express.json());

app.get('/api',(req,res)=>res.send('API is Working!!'));

app.listen(process.env.port || 4000,function(){
    console.log('Now listening for requests 🚀');
    console.log('http://localhost:4000/api');

})
