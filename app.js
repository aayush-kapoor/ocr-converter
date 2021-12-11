const express = require('express');
const app = express();  //initialising express
const fs = require('fs'); //read and create files
const multer = require('multer'); //upload files to server
const { ppid } = require('process');
const {createWorker} = require('tesseract.js')
const worker = createWorker(); //to analyse the images

const storage = multer.diskStorage({
     destination: (req,file,cb) => {
         cb(null, "./uploads"); // called when image is to be stored
     },
     filename: (req,file,cb) => {
         cb(null, file.originalname);
     }
 });   // to store file name, where we want it
const upload = multer({ storage : storage}).single('Monke');

app.set("view engine", "ejs");


app.get('/', (req,res) => {
    res.render('index');
});


/*app.get('/upload', (req,res) => {
    console.log('heyy')
})*/

app.post('/upload', (req,res) => {
    upload(req,res, err => {
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data)=>{
            if(err) return console.log('This is youe error: ', err);

            worker
                .recognize(data, "eng", {tessjs_create_pdf: '1'})
                .progress(progress =>{
                    console.log(progress);
                })
                .then(result =>{
                    res.redirect('/download');
                })
                .finally( () => worker.terminate());
        });
    })
});


app.get('/dowmload', (req,res) => {
    const file = `${__dirname}/ocr-result.pdf`;
    res.download(file);
})

const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => console.log(`heyy im running on port ${PORT}`));
