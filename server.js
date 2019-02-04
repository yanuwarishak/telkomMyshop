const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const nodemailer = require('nodemailer');
const path = require('path');
const pdfkit = require('pdfkit');
const PORT = process.env.PORT || 8080;

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
    //Ambil data dari Ajax biar bisa dipakai di backend
    let formContent = req.body.formContent;
    let arrayOfNo = req.body.arrayOfNo;

    //Buat variable dari value yang digunakan
    let namapengisi = getValueByName(formContent, 'namapengisi');
    let tanggalisi = getValueByName(formContent, 'tanggalisi');
    let namacsrm = getValueByName(formContent, 'namacsrs');
    let namacsrs = getValueByName(formContent, 'namacsrm');
    let nilaiTotal = getValueByName(formContent, 'nilaiTotal');
    let catatanPenilai = getValueByName(formContent, 'catatanPenilai');
    let emailOptional = getValueByName(formContent, 'emailOptional');

    //Buat isi konten email
    const kontenEmail = `
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
        <td bgcolor =#ffffff>
            <h3>Hasil penilaian: </h3>
            <h3>${nilaiTotal}</h3>
        </td>
    </tr>
    <tr>
        <td bgcolor = "#ffffff" >
            <h3>Catatan tambahan :</h3>
            <h4>${catatanPenilai}</h5>
        </td>
    </tr>
    <tr>
    <td align="center" bgcolor="#ff071a">
        <h4 style="color:white";> &copy; Witel Yogyakarta </h4>
    </td>
    </tr>
    </table>
    `;
    
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
            to: `"yanuwarishak@gmail.com", ${emailOptional}`, // list of receivers
            subject: "Hasil Penilaian", // Subject line
            html: kontenEmail, // html body
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
    });

    //Proses pengisian buffer dengan data yang mau diisi
    //Add an image, constrain it to a given size, and center it vertically and horizontally

    doc.fontSize(25).text('Hasil Evaluasi Mystery Shopper',{
        align: 'center'
        });
        
        doc.fontSize(20).text('Plasa Telkom Yogyakarta.',{
        align: 'center'
        });

    doc.moveDown()
        .fontSize(13)
        .text('Lembar hasil penilaian dari proses pengamatan mystery shopper yang selanjutnya akan digunakan sebagai bahan evaluasi Plasa Telkom Yogyakarta.',{
        align: 'left'
        });

    doc.moveDown()
        .fontSize(12).text('Hasil penilaian adalah: ')
        .fontSize(22).text(''+nilaiTotal);

    doc.moveDown()
        .fontSize(12).text('Penilaian dilakukan oleh: ')
        .fontSize(18).text(''+namapengisi)
        .fontSize(12).text('Penilaian dilakukan pada: ')
        .fontSize(18).text(''+tanggalisi);

    doc.moveDown();
    doc.text('CSR Stationaire yang melayani pelanggan: '+namacsrs);
    doc.text('CSR Mobile yang melayani pelanggan: '+namacsrm);
    // Add another page
    doc.addPage()
    .fontSize(12)
    .text('Poin Penilaian yang belum terpenuhi :', 100, 100)
    .moveDown();

    var nomer = [];
    for (var k = 1; k <= arrayOfNo.length; k++) {
       nomer.push(k);
    }

    for (var i = 0; i < arrayOfNo.length; i++) {
        doc.text(+nomer[i] +'. '+arrayOfNo[i]);
    }

    // doc.text('Catatan tambahan dari penilai: ');
    doc.moveDown()
        .fontSize(18).text('Catatan tambahan dari penilai:') 
        .fontSize(12).text(''+catatanPenilai);

    //Execute method end() setelah buffer pdf selesai diisi
    doc.end();
    //respon akhir ketika sudah sukses
    res.status(200).send({'message': 'Transmission sent!'});
});

//App start indicator
app.listen(8080 ,() => {
    console.log('Server started...');
});
