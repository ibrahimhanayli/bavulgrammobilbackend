const express = require('express') //server için gerekli modüller
const mysql = require('mysql'); //veritabanı bağlantısı için gerekli modüller
const cors = require('cors'); //cors ayarları için gerekli modüller
const bp = require('body-parser') //post işlemleri için gerekli modüller

const app = express()

app.use(cors());
app.use(bp.json()) //json veri almak ve göndermek için
app.use(bp.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.raw());
app.use(express.text());

//veritabanı bağlantısı ayarları
const con = mysql.createConnection({
    host: "db4free.net",
    user: "ihanayli",
    password: "12345678",
    database: "bavulgram"
  });

//yeni bavul teslimatı kayıt işlemi
app.post('/kayit', async(req, res) => {

    //gelen istek(req) içerisindeki body içerisindeki verileri alıyoruz
    let { ad,soyad,tel,eposta,adres,ucret } = req.body; 

    //sql sorgumuzu hazırlıyoruz
    const sql = `INSERT INTO kayitlar SET ad='${ad}', soyad='${soyad}', telefon='${tel}', eposta='${eposta}', adres='${adres}', ucret='${ucret}', durum=1`
    
    //sql sorgumuzu çalıştırıyoruz
    con.query(sql,function(hata,sonuc){ 
        if(hata){
            //Sorgu çalışırken hata oluşursa hata mesajını gönderiyoruz
          res.status(200).send('Kayıt oluşturulamadı');
        }else{
            //Sorgu başarılı olursa bavul kodunu gönderiyoruz
          res.status(200).send(`Kayıt oluşturuldu. Bavul Kodu = ${sonuc.insertId}`);
        }
      })
    return;
})

//bavul takip işlemi örn: takip/1  1 numaralı bavulun durumunu gösterir
app.get('/takip/:bkod', async(req, res) => {
  
    //sql sorgumuzu hazırlıyoruz
    const sql = `select durum from kayitlar where kimlik=${req.params.bkod}`

    //sql sorgumuzu çalıştırıyoruz
    con.query(
       sql,
     function(hata,sonuc){ 
         //Sorgu çalışırken hata oluşursa hata mesajını gönderiyoruz
       if(hata){
         res.status(200).send('Kayıt Bulunamadı');
       }else{
              //Sorgu başarılı olursa bavul durumunu gönderiyoruz
            if(sonuc.length==0)
                res.status(200).send('Kayıt Bulunamadı');
            else
            //durum 1 ise teslimat sürecinde, 2 ise teslim edildi
                res.status(200).send(sonuc[0].durum==1 ? "Teslimat sürecinde" : "Teslim edildi");
       }
     })
 
    return;
})

//bavul teslimatı işlemi  örn: teslim/1  1 numaralı bavul teslim edilir
app.post('/teslim/:bkod', async(req, res) => {
    //sql sorgumuzu hazırlıyoruz
    const sql = `update kayitlar set durum=2 where kimlik=${req.params.bkod}`
    //sql sorgumuzu çalıştırıyoruz
    con.query(
        sql,
      function(hata,sonuc){ 
        if(hata){
          res.status(200).send('Kayıt Bulunamadı');
        }else{
            //Sorgu başarılı olursa bavul durumunu gönderiyoruz
            //sorgu sonucunda değişiklik olmaması durumunda kayıt bulunamadı mesajı gönderiyoruz
            if(sonuc.changedRows==0)
                res.status(200).send('Kayıt Bulunamadı');
            else
                res.status(200).send("Bavul başarıyla teslim edildi");
        }
      })
    return;
})

//sunucuyu 3000 portunda dinlemeye başlıyoruz
app.listen(3000)