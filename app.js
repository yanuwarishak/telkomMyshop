const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const nodemailer = require('nodemailer');
const path = require('path');
const pdfkit = require('pdfkit');

const app = express();

function getValueByName(array, name) {
    let content = array.filter(
        function(array) {
            return array.name === name
        }
    );
    return content[0].value;
}

//View engine setup
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

//Static Folder
app.use('/public', express.static(path.join(__dirname, 'public')));

//Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

//Routing Control
app.get('/', (req, res) => {
    res.render('index');
});

//Send Post
app.post('/send', (req, res) => {
    
    console.log(req.body);
    let formContent = req.body.formContent;
    let arrayOfNo = req.body.arrayOfNo;
    //Panggil isi array title
    // arrayOfNo.forEach(title => {
    //     console.log(title);
    // });

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

    //Variabel yang digunakan
    let namapengisi = getValueByName(formContent, 'namapengisi');
    let tanggalisi = getValueByName(formContent, 'tanggalisi');
    let namacsrm = getValueByName(formContent, 'namacsrs');
    let namacsrs = getValueByName(formContent, 'namacsrm');
    let nilaiTotal = getValueByName(formContent, 'nilaiTotal');
    let catatanPenilai = getValueByName(formContent, 'catatanPenilai');

    const output = `
    <p> Berikut merupakan hasil dari simulasi mystery shopper </p>
    <h3> Penilaian dilakukan oleh: </h3>
    <ul>
        <li>Nama: ${namapengisi} </li>
        <li>Pada Tanggal: ${tanggalisi}</li>
    </ul>
    <h3> Pelanggan dilayani oleh: </h3>
    <ul>
        <li>Nama CSR Stationaire: ${namacsrs}</li>
        <li>Nama CSR Mobile: ${namacsrm}</li>
    </ul>
    <h3>Nilai indeks mystery shopper:</h3>
    <h2>${nilaiTotal}</h2>
    <h3>Catatan tambahan penilai:</h3>
    <h2>${catatanPenilai}</h2>
    <h2>${arrayOfNo}</h2>
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
        // res.render('index');
    });

    //Proses pengisian buffer dengan data yang mau diisi
        //Add an image, constrain it to a given size, and center it vertically and horizontally
        doc.image('public/logo_telkom.png', {
            fit: [250, 300],
            align: 'center'
            });;
        // Input text di dalam pdf
        doc.text('Lembar penilaian untuk mystery shopper sebagai bahan evaluasi Plasa Telkom Yogyakarta.');
        doc.text('Hasil penilaian adalah: '+nilaiTotal);
        doc.text('Penilaian dilakukan oleh: '+namapengisi);
        doc.text('Penilaian dilakukan pada: '+tanggalisi);
        doc.text('CSR Stationaire yang melayani pelanggan: '+namacsrs);
        doc.text('CSR Mobile yang melayani pelanggan: '+namacsrm);
        doc.text('Poin yang belum terpenuhi: ');
        
        for (var i = 0; i < arrayOfNo.length; i++) {
            doc.text('- '+arrayOfNo[i]);
        }
    //Execute method end() setelah buffer pdf selesai diisi
    doc.end();
    //respon akhir ketika sudah sukses
    res.status(200).send({'message': 'Transmission sent!'});
});

//App start indicator
app.listen(3000 ,() => {
    console.log('Server started...');
    console.log('http://localhost:3000');
});