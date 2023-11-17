const express = require('express');

const app = express();

app.use(express.static(__dirname+'/public'));

app.set('view engine', 'ejs');

app.get("/", (req,res) => {
    res.status(200).render('login');
});



const server = app.listen(process.env.PORT || 3000, () => {
    const port = server.address().port;
    console.log(`Server listening at port ${port}`);
});