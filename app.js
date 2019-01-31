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

//Send Post
app.post('/send', (req, res) => {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: 'myshop.mailer@gmail.com', // email yang digunakan untuk mengirim
            pass: 'witeljogja' // password email yang digunakan untuk mengirim
        },
        tls:{
            rejectUnauthorized:false
        }
    });

    const output = `
    <table align="center" cellpadding="0" cellspacing="0" width="600">
    <tr>
        <td align="center" bgcolor="#ff071a" style="padding: 20px 0 5px 0;">
            <h1 style="color:white">Form Hasil Assesment Mystery Shopper</h1>
        </td>
    </tr>
    <tr>
        <td align="left" bgcolor="#ffffff" style="padding: 20px 0 5px 0;">
            <h3> Penilaian dilakukan oleh: </h3>
            <ul>
                Nama: ${namapengisi}
                <hr>
                Pada Tanggal: ${tanggalisi}
            </ul>
        </td>
    </tr>
    <tr>
        <td align="left" bgcolor="#ffffff">
            <h3> Pelanggan dilayani oleh: </h3>
            <ul>
                Nama CSR Stationaire: ${namacsrs}
                <hr>
                Nama CSR Mobile: ${namacsrm}
            </ul>
        </td>
    </tr>
    <tr>
        <td bgcolor = "#ffffff" >
            <h3>Catatan tambahan :</h3>
            <h5>${catatanPenilai}</h5>
        </td>
    </tr>
    <tr>
        <td bgcolor =#ffffff>
            <h3>Poin yang masih belum terpenuhi : </h3>
            <h4>${arrayOfNo}</h4>
        </td>
    </tr>
    <tr>
    <td align="center" bgcolor="#ff071a">
        <h4 style="color:white";> &copy; Witel Yogyakarta </h4>
    </td>
    </tr>
    </table>
    `;

    //Persiapan awal membentuk pdf bro
    let doc = new pdfkit();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    //Isi dari method end()
    doc.on('end', () => {
        //Setup awal buffer
        let pdfData = Buffer.concat(buffers);
        //Send the Email
        const mailOptions = {
            from: '"Myshop Witel Jogja" <myshop.mailer@gmail.com>', // sender address
            to: "croucell@gmail.com", // list of receivers
            subject: "Hasil Penilaian", // Subject line
            html: output, // html body
            attachments: [{
                filename: 'Hasil penilaian mystery shopper Witel Jogja.pdf',
                content: pdfData
            }]
        };

        //Send mail with defined transport object
        transporter.sendMail(mailOptions, function (err, info) {
            if(err)
            console.log(err)
            else
            console.log(info);
        });

        //Setelah buffer selesai diisi dan fungsi udah selesai di execute ini baru diexecute
        res.render('index');
    });

    //Proses pengisian buffer dengan data yang mau diisi
        //Add an image, constrain it to a given size, and center it vertically and horizontally
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
    //Execute method end() setelah buffer pdf selesai diisi
    doc.end();
});

//App start indicator
app.listen(3000 ,() => {
    console.log('Server started...');
    console.log('http://localhost:3000');
});