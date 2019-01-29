const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const nodemailer = require('nodemailer');
const path = require('path');
const pdfkit = require('pdfkit');

const app = express();

//View engine setup
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

//Static Folder
app.use('/public', express.static(path.join(__dirname, 'public')));

//Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

//Routing Control
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/send',(req,res) => {
    const output = `
    <p> Berikut merupakan hasil dari simulasi mystery shopper </p>
    <h3> Penilaian dilakukan oleh: </h3>
    <ul>
        <li>Nama: ${req.body.namapengisi}</li>
        <li>Pada Tanggal: ${req.body.tanggalisi}</li>
    </ul>
    <h3> Pelanggan dilayani oleh: </h3>
    <ul>
        <li>Nama CSR Stationaire: ${req.body.namacsrs}</li>
        <li>Nama CSR Mobile: ${req.body.namacsrm}</li>
    </ul>
    <h3>Nilai indeks mystery shopper:</h3>
    <h2>${req.body.nilaiTotal}</h2>
    `;

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
        service:'gmail',
        auth: {
            user: 'myshop.mailer@gmail.com', // email yang digunakan untuk mengirim
            pass: 'witeljogja' // password email yang digunakan untuk mengirim
        },
        tls:{
            rejectUnauthorized:false
        }
 
        });
    
        // setup email data with unicode symbols with pdf attached
        let doc = new pdfkit();

        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {

            let pdfData = Buffer.concat(buffers);
            
            let mailOptions = {
            from: '"Mystery Shopper Witel Jogja" <myshop.mailer@gmail.com>', // sender address
            to: "croucell@gmail.com", // list of receivers
            subject: "Hasil Penilaian", // Subject line
            html: output, // html body
            attachments: [{
                filename: 'Hasil penilaian mystery shopper Witel Jogja.pdf',
                content: pdfData
                }]
            };
    
            // send mail with defined transport object
            transporter.sendMail(mailOptions, function (err, info) {
                if(err)
                console.log(err)
                else
                console.log(info);
            });

        });

        // Add an image, constrain it to a given size, and center it vertically and horizontally
        doc.image('public/logo_telkom.png', {
            fit: [250, 300],
            align: 'center'
            });;

        // Input text di dalam pdf
        doc.text('Lembar penilaian untuk mystery shopper sebagai bahan evaluasi Plasa Telkom Yogyakarta.');
        doc.text('Hasil penilaian adalah: '+req.body.nilaiTotal);
        doc.text('Penilaian dilakukan oleh: '+req.body.namapengisi);
        doc.text('Penilaian dilakukan pada: '+req.body.tanggalisi);
        doc.text('CSR Stationaire yang melayani pelanggan: '+req.body.namacsrs);
        doc.text('CSR Mobile yang melayani pelanggan: '+req.body.namacsrm);
        //Closing tag document pdf
        doc.end();
        //Return value setelah fungsi berhasil di eksekusi
        res.render('index');
    });

app.listen(3000 ,() => {
    console.log('Server started...');
    console.log('http://localhost:3000');
});