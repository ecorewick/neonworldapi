

const dboperations = require('./dboperations');
var express = require('express');
var bodyParser = require('body-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cors = require('cors');

const multer = require('multer');

var CryptoJS = require("crypto-js");
var CoinPayments = require('coinpayments');

var https = require('https'),
    crypto = require('crypto'),
    events = require('events'),
    qs = require('querystring'),
    eventEmitter = new events.EventEmitter();








const port = process.env.PORT || 3000;



const sql = require("mssql");
var config = require('./dbconfig');


const { sign } = require("jsonwebtoken");
const path = require('path');
// const { hostname } = require('os');

var app = express();
var router = express.Router();


//set for Global configuration access
dotenv.config();

// app.use(cors());
app.use(cors({ origin: "*" }))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', router);

app.use('/images', express.static('images'));




var drespose = "";


//// Global START

router.route('/country').get((request, response) => {

    try {
        dboperations.getCountry().then(result => {
            console.log(result);
            response.json(result["recordsets"][0]);
        })
    }
    catch (error) {

    }

});


router.route('/countrylist').post((request, response) => {

    try {
        dboperations.getCountry().then(result => {
            console.log(result);
            response.json(result["recordsets"][0]);
        })
    }
    catch (error) {

    }

});


router.post("/statelist", function (request, response) {

    let order = { ...request.body }
    dboperations.statelist(order).then(result => {

        console.log(result);
        response.json(result["recordsets"][0]);

    });

});

router.post("/adminlogin", function (request, response) {


    try {

        console.log('start');
        let order = { ...request.body }
        dboperations.adminapi(order).then(result => {

            console.log(result.recordsets);


            if (result.recordsets[0][0].Valid == "TRUE") {
                const user = { id: result.recordsets[0][0].ID };

                var data = result.recordsets[0][0].UserID;
                // Encrypt
                var cipherUserID = CryptoJS.AES.encrypt(JSON.stringify(data), 'msecret-keys@9128').toString();
                console.log(cipherUserID);
                const token = jwt.sign({ USERID: data }, "msecret-keys@9128", { expiresIn: "15m" });
                response.json({
                    token: token,
                    status: "success",
                    message: "valid",
                    id: result.recordsets[0][0].AdminID,
                    UserID: result.recordsets[0][0].UserID,
                    FullName: 'Admin',
                    EmailID: '',
                    valid: result.recordsets[0][0].Valid,
                    url: result.recordsets[0][0].URL,
                    ismember: '0',
                    Encrypt: cipherUserID
                });

            }
            else {
                response.json({
                    status: "failure",
                    msg: 'Invalid UserID or Password',

                });



            }
        });

    }
    catch (error) {

    }


});


router.post("/signin", function (request, response) {


    try {

        let order = { ...request.body }
        dboperations.signinapi(order).then(result => {

            // console.log(result.recordsets);


            if (result.recordsets[0][0].Valid == "TRUE") {


                const data = result.recordsets[0][0].USERID;
                // Encrypt
                var cipherUserID = CryptoJS.AES.encrypt(JSON.stringify(data), 'msecret-keys@9128').toString();

                const token = jwt.sign({ USERID: data }, "msecret-keys@9128", { expiresIn: "30m" });
                response.json({
                    token: token,
                    status: "success",
                    msg: 'Valid',
                    id: result.recordsets[0][0].ID,
                    UserID: result.recordsets[0][0].USERID,
                    FullName: result.recordsets[0][0].FIRSTNAME,
                    EmailID: result.recordsets[0][0].EMailId,
                    valid: result.recordsets[0][0].Valid,
                    url: result.recordsets[0][0].URL,
                    ismember: '1',
                    Encrypt: cipherUserID
                });

            }
            else {
                response.json({

                    status: "failure",
                    msg: 'Invalid UserID or Password',

                });
            }
        });


    } catch (error) {

    }


});

router.post("/getmemerdashboard", async function (request, response) {


    console.log('dashboard');
    try {
        const token1 = request.header('Authorization');
        const MemberUserID = request.body.UserID;





        try {
            console.log('token1');
            console.log(token1);
            console.log('Secrect key--1');
            const decoded = jwt.verify(token1, 'msecret-keys@9128');

            console.log(decoded);
            console.log(decoded.USERID);
            console.log(MemberUserID);
            console.log('Secrect key --2');
            //request.USERID = decoded.USERID;
            if (decoded.USERID != null) {

                const conn = await sql.connect(config);
                const resp = await conn.request()
                    .input("UserID", MemberUserID)
                    .execute("USP_GetCustomerDashBoardDtls");

                console.log(resp.recordsets[0]);



                return response.status(200).json({ data: resp.recordsets });
            }
            else {
                res.status(200).json({ status: 'Invalid Secrect key' });
            }
            //  next();
        } catch (error) {
            res.status(401).json({ status: 'Session expaired Invalid Secrect key' });
        }

    }
    catch (error) {

    }

});


router.post("/getprofile", function (request, response) {

    console.log('*111***1')
    let order = { ...request.body }
    const token1 = request.header('Authorization');
    console.log('*111***2')
  
    dboperations.getprofileadmin(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1,
                data: result.recordsets[0],


            });
        }
    });
 
});


router.post("/updateprofile", function (request, response) {

    let order = { ...request.body }

   
    dboperations.updateprofileadmin(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1, 
                data: result.recordsets[0],

            });
        }
    });


});

router.post("/loginverify", function (request, response) {

    try {

        console.log('ccc1');
        // let order= {...request.body}

        const token1 = request.header('Authorization');
        console.log(token1);
        if (!token1) return res.status(401).json({ error: 'Access denied' });
        console.log('ccc2');
        try {
            console.log('ccc3');
            const decoded = jwt.verify(token1, 'msecret-keys@9128');
            console.log('ccc3---11');
            console.log(decoded.USERID);
            console.log('ccc4---2');
            console.log('ccc4---3');
            //request.USERID = decoded.USERID;

            if (decoded.USERID != null) {
                console.log('ccc4---3---valid');
                response.status(200).json({ status: 'Valid token' });
            }
            else {
                console.log('ccc4---3---invalid');
                response.status(200).json({ status: 'Invalid token' });
            }
            // next();
        } catch (error) {
            console.log('ccc4---3---expair');
            response.status(401).json({ status: 'Session expaired Invalid token' });
        }





    }
    catch (error) {

    }


});


router.post("/CheckSpnsor", function (request, response) {

    let order = { ...request.body }
    dboperations.getCheckSpnsor(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});


router.post("/signup", function (request, response) {

    let order = { ...request.body }
    dboperations.insertReg(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            var data = result.recordsets[0][0].MEMBERUSERID;
            // Encrypt
            var cipherUserID = CryptoJS.AES.encrypt(JSON.stringify(data), 'msecret-keys@9128').toString();
            console.log(cipherUserID);
           

            response.json({
                id: cipherUserID,
                data: result["recordsets"][0],

            });
        }
    });

});

router.post("/welcome", function (request, response) {

    try {


        let order = { ...request.body }
        dboperations.getwelcome(order).then(result => {

            if (result != null) {
                console.log(result.recordsets[0])
                response.json({
                    data: result.recordsets[0],

                });
            }


        });

    }
    catch (error) {

    }





});

router.post("/updatememberpassword", function (request, response) {

    let order = { ...request.body }
   
    dboperations.updatepassword(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1,
                data: result.recordsets[0],


            });
        }
    });
   

});


router.post("/getdirectteam", function (request, response) {

    let order = { ...request.body }


    dboperations.directteam(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1, 
                data: result.recordsets[0],


            });
        }
    });
    
    

});


router.post("/getMyteam", function (request, response) {

    let order = { ...request.body }
  
    dboperations.teamnetwork(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1,
                data: result.recordsets[0],
            });
        }
    });
   

});

router.post("/getdailyincomeroi", function (request, response) {

    let order = { ...request.body }
   
    dboperations.dailyincome(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1,
                data: result.recordsets[0],
            });
        }
    });
   
});


router.post("/levelcommission", function (request, response) {

    let order = { ...request.body }

    dboperations.getlevelcommission(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1,
                data: result.recordsets[0],

            });
        }
    });
  

});



router.post("/passupincomecommission", function (request, response) {

    let order = { ...request.body }
    dboperations.getpassupincomecommission(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1,
                data: result.recordsets[0],

            });
        }
    });


});

router.post("/binarycommission", function (request, response) {

    let order = { ...request.body }
    dboperations.getbinarycommission(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode: 1,
                data: result.recordsets[0],

            });
        }



    });

});


router.post("/binarytree", function (request, response) {

    let order = { ...request.body }

  
    dboperations.getbinarytree(order).then(result => {


        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode: 1,
                data: result.recordsets[0],

            });
        }

    });
   

});



router.post("/growthtree", function (request, response) {

    let order = { ...request.body }

    dboperations.getgrowthtree(order).then(result => {

      
        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode: 1,
                data: result.recordsets[0],

            });
        }



    });


   

});

router.post("/balancebywallet", function (request, response) {

    let order = { ...request.body }

  

    try {

        const token1 = request.header('Authorization');
         console.log(token1);
        if (!token1) return res.status(401).json({ error: 'Access denied' });
        try {
            const decoded = jwt.verify(token1, 'msecret-keys@9128');
            if (decoded.USERID != null) {

                dboperations.getbalancewallet(order).then(result => {

                    if (result != null) {
                        console.log(result.recordsets[0])
                        response.json({
                            statuscode: 0,
                            status: 'valid token',
                            data: result.recordsets[0],

                        });
                    }
                });
                      


           
            }
            else {
               
                 response.status(200).json({ statuscode:1, status: 'Invalid token' });
            }
            // next();
        } catch (error) {
           
            response.status(401).json({ statuscode:1, status: 'Session expaired Invalid token' });
        }

    }
    catch (error) {

    }


});




router.post("/transferfund", function (request, response) {

    let order = { ...request.body }
    console.log('rtrtrt');
    try {

        const token1 = request.header('Authorization');
         console.log(token1);
        if (!token1) return res.status(401).json({ error: 'Access denied' });
        try {
            const decoded = jwt.verify(token1, 'msecret-keys@9128');
            if (decoded.USERID != null) {




             dboperations.inserttransferfund(order).then(result => {

                if (result != null) {
                    console.log(result.recordsets[0])
                    response.json({
                        statuscode: 0,
                        data: result.recordsets[0],


                    });
                }
            });




            }
            else {
               
                response.status(200).json({ statuscode:1, status: 'Invalid token' });
            }
            // next();
        } catch (error) {
            console.log(error);
            response.status(401).json({ statuscode:1, status: 'Session expaired Invalid token' });
        }





    }
    catch (error) {

    }

    


});

router.post("/fundtransferdetails", function (request, response) {

    let order = { ...request.body }
    dboperations.getfundtransferdetails(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1,
                data: result.recordsets[0],

            });
        }
    });


});


router.route('/autoid').get((request,response)=>{

    dboperations.getautoid().then(result =>{
     //   console.log(result);
        response.json(result.recordsets[0]);
    })
});



router.route('/activepaymentprovider').get((request,response)=>{

    dboperations.getactivepaymentprovider().then(result =>{
        console.log(result);
        response.json(result.recordsets[0]);
    })
});

router.post("/createtransaction", function(request, res){
     
    let order= {...request.body}
    console.log(order.amount);
    console.log('create transaction');
    createtransaction('create_transaction',order.mid,order.amount,order.currency1,order.currency2,order.buyer_email,order.buyer_name,order.item_name,order.item_number,order.clientID,order.secrectKey,{}); //coinpaymentsApiCall('get_basic_info',{});
            
       setTimeout(() => 
        {
            console.log(drespose);
                        
             res.json({
                           
             data:drespose,
             timestamp:"1715842276065"
                            
        });           
  }, 2400);
            
});
                    
async function createtransaction(cmd,mid,amount,currency1,currency2,buyer_email,buyer_name,item_name,item_number,clientID,secrectKey, req = {}) {


    console.log('create transaction-- Start1');
    console.log(cmd);
    console.log(mid);
    console.log(amount);
    console.log(currency1);
    console.log(currency2);
    console.log(buyer_email);
    console.log(buyer_name);
    console.log(item_name);
    console.log(item_number);
    console.log(clientID);
    console.log(secrectKey);
    console.log('create transaction-- END');
   // var bytes = CryptoJS.AES.decrypt(mid, 'msecret-keys@9128');
    console.log('****4444**********1');
   // var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    console.log('****/////8888**************1');
    const publicKey = clientID;//'41025b0d38a6d0d1167394c0b666e29de8e6c2be02f19f6c409123a02a667d86';
    const privateKey = secrectKey;//'E2abD9c48C6d36BE722CAfe21FA407898a9C5568514a6c0a25dF774DD9cdbfeD';
    console.log('**************1');
    // Set the API command and required fields
    req.version = 1;
    req.cmd = cmd;
    req.amount = amount;  
    req.currency1=currency1;
    req.currency2=currency2;
    req.buyer_email=buyer_email;
    req.buyer_name=buyer_name;
    req.item_name=item_name;
    req.item_number=item_number;
    req.key = publicKey;
    req.ipn_url="https://neonworldapi.onrender.com/api/depositipn";
    req.format = 'json';
    console.log('**************2');
    // Generate the query string
         const postData = new URLSearchParams(req).toString();
      //   const postData = "rate"
        console.log(req);
        console.log('**************3');

       // Calculate the HMAC signature on the POST data
       const hmac = crypto.createHmac('sha512', privateKey).update(postData).digest('hex');
       console.log(hmac);
       fetch('https://www.coinpayments.net/api.php', {
        method: 'POST',
        body:postData,
        headers: {
          'HMAC': hmac,  'Content-Type': 'application/x-www-form-urlencoded'
        }
        })
        .then(function(response){ 
          console.log('xxxxxxx1');
           return response.json()
    }
       )
        .then(function(data)
        {
           // console.log(data)
            drespose=data;
            console.log('cdcdcd');
              console.log(data.result.amount);
              console.log(data.result.txn_id);
              console.log(data.result.address);
              console.log(data.result.timeout);
              console.log(data.result.status_url);
              console.log(data.result.checkout_url);

              insertcoinaddress(mid,item_number,data.result.address,data.result.txn_id,data.result.amount,data.result.amount,mid,currency2,data.result.timeout)
            return data;
      }).catch(error => console.error('Error:', error)); 
      

}

async function insertcoinaddress(mid,autoid,payaddress,payid,paymentamount,amount,decryptedData,cryptoype, timeout){

    try{
        
       
        const conn= await sql.connect(config);
            const res =await conn.request()
           
            .input("AUtoID",autoid)
            .input("addres",payaddress)
            .input("transID",payid)
            .input("amount",paymentamount)
            .input("depositamount",amount)
            .input("UserID",mid)
            .input("deposittype",cryptoype)
            .input("amount_topay",paymentamount)
            .input("SessionUserid",mid)
            .input("InvestType",'Deposit')
            .input("netamt",amount)
            .input("Id",payid)
            .input("returnendtime",timeout)
            .input("byuserid",decryptedData)
            .input("timeout",timeout)
            .input("paymentserviceprovider",'coinpayment')
           

            .execute("USP_Updatepayaddressandstatus_deposit");
            return res;
    }
    catch(error){
        console.log(error);
    }

}

router.post("/qrcodechecktimer_invest", function(request, response){

    let order= {...request.body}
    dboperations.qrcodechecktimer_invest(order).then(result => {
    
          if(result !=null){
            console.log('-------------result----------')
                console.log(result)
                response.json(
                    {
                    status:'true',
                    data:result.recordsets[0],
                    timestamp:"1715842276065",

                });
            }
    });
    
});
router.post("/qrcodechecktimer_deposit", function(request, response){

    let order= {...request.body}
    dboperations.qrcodechecktimer_depp(order).then(result => {
    
          if(result !=null){
            console.log('-------------result----------')
                console.log(result)
                response.json(
                    {
                    status:'true',
                    data:result.recordsets[0],
                    timestamp:"1715842276065",

                });
            }
    });
    
});


router.post("/canceltransaction", function(request, response){

    let order= {...request.body}
    dboperations.canceltransaction(order).then(result => {
    
          if(result !=null){
            console.log('-------------result----------')
                console.log(result)
                response.json(
                    {
                    status:'true',
                    data:result,
                    timestamp:"1715842276065",

                });
            }
    });
    
});


router.post("/checknowpaymenttransaction", function(request, response){

    const data = []

    let order= {...request.body}
    dboperations.getchecktransaction(order).then(result => {
    
          if(result !=null){
            console.log('-------------result----------')
            // console.log(result.recordsets[0][0])
            // console.log(result.recordsets[0][0].TransID)
           // data=result.recordsets[0];

            for (let i = 0; i < result.recordsets[0].length; i++) {
               console.log(result.recordsets[0][i].TransID);
               console.log(result.recordset[0][i].servicetype);

               const axios = require('axios');

               let config = {
                 method: 'get',
                 maxBodyLength: Infinity,
                 url: 'https://api.nowpayments.io/v1/payment/'+result.recordsets[0][i].TransID,
                 headers: { 
                   'x-api-key': '6K4XYJH-SED4D68-JFH81QQ-99AKRYZ'
                 }
               };
               
               axios.request(config)
               .then((response) => {
                 console.log(JSON.stringify(response.data));
                  const  status=JSON.stringify(response.data.payment_status).replaceAll('"', '');
                  console.log('check status start');
                  
                    if(status=="finished" || status=="partially_paid" || status=="confirmed" || status=="sending")
                    {
                        console.log(result.recordsets[0][i].TransID);
                        insert_success_transaction(result.recordsets[0][i].order_id,result.recordsets[0][i].actually_paid);

                          console.log(status);
                    
                    } 
                    else
                    {
                        console.log('zz '+status);
                    } 

                  console.log('check status end');



               })
               .catch((error) => {
                 console.log(error);
               });







            } 


                response.json(
                    {
                    status:'true',
                    data:result,
                    timestamp:"1715842276065",

                });
            }
    });
    
});



async function insert_success_transaction(autoid,paidamount){

    try{
        
            const conn= await sql.connect(config);
            const res =await conn.request()
            .input("AutoID",autoid)
            .input("DepositAmount",paidamount)  
            .execute("USP_Approval_Deposite_NowPayments_Deposit");
            return res;
    }catch(error){
        console.log(error);
    }

}


router.post("/depositdetails", function (request, response) {

    let order = { ...request.body }

    dboperations.getdepositdetails(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1,
                data: result.recordsets[0],

            });
        }
    });
  

});



//membership

router.post("/getCheckMemberShip", function (request, response) {

    let order = { ...request.body }

    dboperations.CheckMemberShip(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1,
                data: result.recordsets[0],

            });
        }
    });
  

});


router.post("/getCheckMemberShipwithprovider", function (request, response) {

    let order = { ...request.body }

    dboperations.CheckMemberShipwithprovider(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1,
                data: result.recordsets[0],

            });
        }
    });
  

});
router.post("/qrcodechecktimer_membership", function(request, response){

    let order= {...request.body}
    dboperations.qrcodechecktimer_membership(order).then(result => {
    
          if(result !=null){
            console.log('-------------result----------')
                console.log(result)
                response.json(
                    {
                    status:'true',
                    data:result.recordsets[0],
                    timestamp:"1715842276065",

                });
            }
    });
    
});



router.route('/autoidmembership').get((request,response)=>{

    dboperations.getautoid_membership().then(result =>{
        console.log(result);
        response.json(result.recordsets[0]);
    })
});

router.post("/createmembershiptransaction", function(request, res){
     



    let order = { ...request.body }
    console.log(order.amount);
    console.log('create transaction for membership----1');
    try {

        const token1 = request.header('Authorization');
        console.log('create transaction for membership----2');
         console.log(token1);
         console.log('create transaction for membership----3');
        if (!token1) return res.status(401).json({ error: 'Access denied' });
        console.log('create transaction for membership----4');

        try {

            console.log('Token Check');
                console.log('create transaction for membership----5');
            const decoded = jwt.verify(token1, 'msecret-keys@9128');
            console.log('create transaction for membership----6');
            console.log('decoded Token Check');

            if (decoded.USERID != null) {
                console.log('create transaction for membership----7');
                console.log('Valid Token');


                createmembershiptransaction('create_transaction',order.mid,order.amount,order.currency1,order.currency2,order.buyer_email,order.buyer_name,order.item_name,order.item_number,order.clientID,order.secrectKey,order.packid,{}); //coinpaymentsApiCall('get_basic_info',{});
            
                setTimeout(() => 
                 {
                     console.log(drespose);
                                 
                      res.json({
                                    
                      data:drespose,
                      timestamp:"1715842276065"
                                     
                 });           
              }, 2400);
                



            }
            else {
               
                res.json({ statuscode:1, status: 'Invalid token' });
            }
            // next();
        } catch (error) {
           

            res.json({ statuscode:1, status: 'Session expaired Invalid token' });
        }





    }
    catch (error) {
        res.json({ statuscode:1, status: 'Session expaired Invalid token' });
    }

    





            
});
                    
async function createmembershiptransaction(cmd,mid,amount,currency1,currency2,buyer_email,buyer_name,item_name,item_number,clientID,secrectKey,packid, req = {}) {


    console.log('create transaction-Membership- Start1');
    console.log(cmd);
    console.log(mid);
    console.log(amount);
    console.log(currency1);
    console.log(currency2);
    console.log(buyer_email);
    console.log(buyer_name);
    console.log(item_name);
    console.log(item_number);
    console.log(clientID);
    console.log(secrectKey);
    console.log('create transaction-Membership- END');
   // var bytes = CryptoJS.AES.decrypt(mid, 'msecret-keys@9128');
    console.log('****4444**********1');
   // var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    console.log('****/////8888**************1');
    const publicKey = clientID;//'41025b0d38a6d0d1167394c0b666e29de8e6c2be02f19f6c409123a02a667d86';
    const privateKey = secrectKey;//'E2abD9c48C6d36BE722CAfe21FA407898a9C5568514a6c0a25dF774DD9cdbfeD';
    console.log('**************1');
    // Set the API command and required fields
    req.version = 1;
    req.cmd = cmd;
    req.amount = amount;  
    req.currency1=currency1;
    req.currency2=currency2;
    req.buyer_email=buyer_email;
    req.buyer_name=buyer_name;
    req.item_name=item_name;
    req.item_number=item_number;
    req.key = publicKey;
    req.ipn_url="https://neonworldapi.onrender.com/api/membershipipn";
    req.format = 'json';
    console.log('**************2');
    // Generate the query string
         const postData = new URLSearchParams(req).toString();
      //   const postData = "rate"
        console.log(req);
        console.log('**************3');

       // Calculate the HMAC signature on the POST data
       const hmac = crypto.createHmac('sha512', privateKey).update(postData).digest('hex');
       console.log(hmac);
       fetch('https://www.coinpayments.net/api.php', {
        method: 'POST',
        body:postData,
        headers: {
          'HMAC': hmac,  'Content-Type': 'application/x-www-form-urlencoded'
        }
        })
        .then(function(response){ 
          console.log('xxxxxxx1');
           return response.json()
    }
       )
        .then(function(data)
        {
           // console.log(data)
            drespose=data;
            console.log('cdcdcd');
              console.log(data.result.amount);
              console.log(data.result.txn_id);
              console.log(data.result.address);
              console.log(data.result.timeout);
              console.log(data.result.status_url);
              console.log(data.result.checkout_url);

              insertmembershipcoinaddress(mid,item_number,data.result.address,data.result.txn_id,data.result.amount,data.result.amount,mid,currency2,data.result.timeout,packid)
            return data;
      }).catch(error => console.error('Error:', error)); 
      

}

async function insertmembershipcoinaddress(mid,autoid,payaddress,payid,paymentamount,amount,decryptedData,cryptoype, timeout,packid){

    try{
        
        console.log('Nenbership data entry');
        const conn= await sql.connect(config);
            const res =await conn.request()
           
            .input("AUtoID",autoid)
            .input("addres",payaddress)
            .input("transID",payid)
            .input("amount",paymentamount)
            .input("depositamount",amount)

            .input("deposittype",cryptoype)

            .input("UserID",mid)
          
            .input("amount_topay",paymentamount)
            .input("SessionUserid",mid)
            .input("InvestType",'membership')
            .input("netamt",amount)
            .input("Id",payid)
            .input("returnendtime",timeout)
            .input("byuserid",decryptedData)
            .input("timeout",timeout)
            .input("paymentserviceprovider",'coinpayment')
          
            .execute("USP_Updatepayaddressandstatus_membership");
            return res;
    }
    catch(error){
        console.log(error);
    }

}






//for investment

router.route('/autoidinvest').get((request,response)=>{

    dboperations.getautoid_invest().then(result =>{
     //   console.log(result);
        response.json(result.recordsets[0]);
    })
});

router.post("/createinvesttransaction", function(request, res){
     



    let order = { ...request.body }
    console.log(order.amount);
    console.log('create transaction');
    try {

        const token1 = request.header('Authorization');
         console.log(token1);
        if (!token1) return res.status(401).json({ error: 'Access denied' });

        try {
            console.log('Token Check');
            
            const decoded = jwt.verify(token1, 'msecret-keys@9128');
           
            console.log('decoded Token Check');

            if (decoded.USERID != null) {

                console.log('Valid Token');


                createinvesttransaction('create_transaction',order.mid,order.amount,order.currency1,order.currency2,order.buyer_email,order.buyer_name,order.item_name,order.item_number,order.clientID,order.secrectKey,order.packid,{}); //coinpaymentsApiCall('get_basic_info',{});
            
                setTimeout(() => 
                 {
                     console.log(drespose);
                                 
                      res.json({
                                    
                      data:drespose,
                      timestamp:"1715842276065"
                                     
                 });           
              }, 2400);
                



            }
            else {
               
                res.json({ statuscode:1, status: 'Invalid token' });
            }
            // next();
        } catch (error) {
           

            res.json({ statuscode:1, status: 'Session expaired Invalid token' });
        }





    }
    catch (error) {
        res.json({ statuscode:1, status: 'Session expaired Invalid token' });
    }

    





            
});
                    
async function createinvesttransaction(cmd,mid,amount,currency1,currency2,buyer_email,buyer_name,item_name,item_number,clientID,secrectKey,packid, req = {}) {


    console.log('create transaction-- Start1');
    console.log(cmd);
    console.log(mid);
    console.log(amount);
    console.log(currency1);
    console.log(currency2);
    console.log(buyer_email);
    console.log(buyer_name);
    console.log(item_name);
    console.log(item_number);
    console.log(clientID);
    console.log(secrectKey);
    console.log('create transaction-- END');
   // var bytes = CryptoJS.AES.decrypt(mid, 'msecret-keys@9128');
    console.log('****4444**********1');
   // var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    console.log('****/////8888**************1');
    const publicKey = clientID;//'41025b0d38a6d0d1167394c0b666e29de8e6c2be02f19f6c409123a02a667d86';
    const privateKey = secrectKey;//'E2abD9c48C6d36BE722CAfe21FA407898a9C5568514a6c0a25dF774DD9cdbfeD';
    console.log('**************1');
    // Set the API command and required fields
    req.version = 1;
    req.cmd = cmd;
    req.amount = amount;  
    req.currency1=currency1;
    req.currency2=currency2;
    req.buyer_email=buyer_email;
    req.buyer_name=buyer_name;
    req.item_name=item_name;
    req.item_number=item_number;
    req.key = publicKey;
    req.ipn_url="https://neonworldapi.onrender.com/api/investipn";
    req.format = 'json';
    console.log('**************2');
    // Generate the query string
         const postData = new URLSearchParams(req).toString();
      //   const postData = "rate"
        console.log(req);
        console.log('**************3');

       // Calculate the HMAC signature on the POST data
       const hmac = crypto.createHmac('sha512', privateKey).update(postData).digest('hex');
       console.log(hmac);
       fetch('https://www.coinpayments.net/api.php', {
        method: 'POST',
        body:postData,
        headers: {
          'HMAC': hmac,  'Content-Type': 'application/x-www-form-urlencoded'
        }
        })
        .then(function(response){ 
          console.log('xxxxxxx1');
           return response.json()
    }
       )
        .then(function(data)
        {
           // console.log(data)
            drespose=data;
            console.log('cdcdcd');
              console.log(data.result.amount);
              console.log(data.result.txn_id);
              console.log(data.result.address);
              console.log(data.result.timeout);
              console.log(data.result.status_url);
              console.log(data.result.checkout_url);

              insertinvestcoinaddress(mid,item_number,data.result.address,data.result.txn_id,data.result.amount,data.result.amount,mid,currency2,data.result.timeout,packid)
            return data;
      }).catch(error => console.error('Error:', error)); 
      

}

async function insertinvestcoinaddress(mid,autoid,payaddress,payid,paymentamount,amount,decryptedData,cryptoype, timeout,packid){

    try{
        
       
        const conn= await sql.connect(config);
            const res =await conn.request()
           
            .input("AUtoID",autoid)
            .input("addres",payaddress)
            .input("transID",payid)
            .input("amount",paymentamount)
            .input("depositamount",amount)
            .input("UserID",mid)
            .input("deposittype",cryptoype)
            .input("amount_topay",paymentamount)
            .input("SessionUserid",mid)
            .input("InvestType",'Investment')
            .input("netamt",amount)
            .input("Id",payid)
            .input("returnendtime",timeout)
            .input("byuserid",decryptedData)
            .input("timeout",timeout)
            .input("paymentserviceprovider",'coinpayment')
            .input("packid",packid)

            .execute("USP_Updatepayaddressandstatus");
            return res;
    }
    catch(error){
        console.log(error);
    }

}


router.post("/investreport", function (request, response) {

    let order = { ...request.body }
    
    dboperations.getinvestreport(order).then(result => {

        if (result != null) {
            console.log(result)
            response.json({
                statuscode:1,
                data: result.recordsets[0],

            });
        }
    });
  

});


//for subscrption
router.route('/autoidsubscription').get((request,response)=>{

    dboperations.getautoid_subscription().then(result =>{
     //   console.log(result);
        response.json(result.recordsets[0]);
    })
});
router.post("/createsubscriptiontransaction", function(request, res){
     



    let order = { ...request.body }
    console.log(order.amount);
    console.log('create transaction');
    try {

        const token1 = request.header('Authorization');
         console.log(token1);
        if (!token1) return res.status(401).json({ error: 'Access denied' });

        try {
            console.log('Token Check');
            
            const decoded = jwt.verify(token1, 'msecret-keys@9128');
           
            console.log('decoded Token Check');

            if (decoded.USERID != null) {

                console.log('Valid Token');


                createsubscriptiontransaction('create_transaction',order.mid,order.amount,order.currency1,order.currency2,order.buyer_email,order.buyer_name,order.item_name,order.item_number,order.clientID,order.secrectKey,order.packid,{}); //coinpaymentsApiCall('get_basic_info',{});
            
                setTimeout(() => 
                 {
                     console.log(drespose);
                                 
                      res.json({
                                    
                      data:drespose,
                      timestamp:"1715842276065"
                                     
                 });           
              }, 2400);
                



            }
            else {
               
                res.json({ statuscode:1, status: 'Invalid token' });
            }
            // next();
        } catch (error) {
           

            res.json({ statuscode:1, status: 'Session expaired Invalid token' });
        }





    }
    catch (error) {
        res.json({ statuscode:1, status: 'Session expaired Invalid token' });
    }

    





            
});
                    
async function createsubscriptiontransaction(cmd,mid,amount,currency1,currency2,buyer_email,buyer_name,item_name,item_number,clientID,secrectKey,packid, req = {}) {


    console.log('create transaction-- Start1');
    console.log(cmd);
    console.log(mid);
    console.log(amount);
    console.log(currency1);
    console.log(currency2);
    console.log(buyer_email);
    console.log(buyer_name);
    console.log(item_name);
    console.log(item_number);
    console.log(clientID);
    console.log(secrectKey);
    console.log('create transaction-- END');
   // var bytes = CryptoJS.AES.decrypt(mid, 'msecret-keys@9128');
    console.log('****4444**********1');
   // var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    console.log('****/////8888**************1');
    const publicKey = clientID;//'41025b0d38a6d0d1167394c0b666e29de8e6c2be02f19f6c409123a02a667d86';
    const privateKey = secrectKey;//'E2abD9c48C6d36BE722CAfe21FA407898a9C5568514a6c0a25dF774DD9cdbfeD';
    console.log('**************1');
    // Set the API command and required fields
    req.version = 1;
    req.cmd = cmd;
    req.amount = amount;  
    req.currency1=currency1;
    req.currency2=currency2;
    req.buyer_email=buyer_email;
    req.buyer_name=buyer_name;
    req.item_name=item_name;
    req.item_number=item_number;
    req.key = publicKey;
    req.ipn_url="https://neonworldapi.onrender.com/api/subscriptionipn";
    req.format = 'json';
    console.log('**************2');
    // Generate the query string
         const postData = new URLSearchParams(req).toString();
      //   const postData = "rate"
        console.log(req);
        console.log('**************3');

       // Calculate the HMAC signature on the POST data
       const hmac = crypto.createHmac('sha512', privateKey).update(postData).digest('hex');
       console.log(hmac);
       fetch('https://www.coinpayments.net/api.php', {
        method: 'POST',
        body:postData,
        headers: {
          'HMAC': hmac,  'Content-Type': 'application/x-www-form-urlencoded'
        }
        })
        .then(function(response){ 
          console.log('xxxxxxx1');
           return response.json()
    }
       )
        .then(function(data)
        {
           // console.log(data)
            drespose=data;
            console.log('cdcdcd');
              console.log(data.result.amount);
              console.log(data.result.txn_id);
              console.log(data.result.address);
              console.log(data.result.timeout);
              console.log(data.result.status_url);
              console.log(data.result.checkout_url);

              insertsubscriptioncoinaddress(mid,item_number,data.result.address,data.result.txn_id,data.result.amount,data.result.amount,mid,currency2,data.result.timeout,packid)
            return data;
      }).catch(error => console.error('Error:', error)); 
      

}

async function insertsubscriptioncoinaddress(mid,autoid,payaddress,payid,paymentamount,amount,decryptedData,cryptoype, timeout,packid){

    try{
        
       
        const conn= await sql.connect(config);
            const res =await conn.request()
           
            .input("AUtoID",autoid)
            .input("addres",payaddress)
            .input("transID",payid)
            .input("amount",paymentamount)
            .input("depositamount",amount)
            .input("UserID",mid)
            .input("deposittype",cryptoype)
            .input("amount_topay",paymentamount)
            .input("SessionUserid",mid)
            .input("InvestType",'Subscription')
            .input("netamt",amount)
            .input("Id",payid)
            .input("returnendtime",timeout)
            .input("byuserid",decryptedData)
            .input("timeout",timeout)
            .input("paymentserviceprovider",'coinpayment')
            .input("packid",packid)

            .execute("USP_Updatepayaddressandstatus_subscription");
            return res;
    }
    catch(error){
        console.log(error);
    }

}


router.post("/subscriptiondetails", function (request, response) {

    let order = { ...request.body }

    dboperations.getsubscriptiondetails(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1,
                data: result.recordsets[0],

            });
        }
    });
  

});









router.post("/depositipn", function (request, res){
     

    // console.log('Received IPN:', request.body);
  
    // // Process the IPN message and verify the payment here
    
    // res.send('OK'); // Respond back to CoinPayments

    const ipnData = req.body;

    // Log the IPN data for debugging
    console.log(ipnData);
  
    // Process IPN data (verify, update order status, etc.)
    if (ipnData.status == 100) {
        console.log('Payment successful');
          console.log(req.body);
      // Update your database, fulfill the order, etc.
    }
  
    res.send('IPN received');
   
            
});
router.post("/membershipipn", function (request, res){
     

    // console.log('Received IPN:', request.body);
  
    // // Process the IPN message and verify the payment here
    
    // res.send('OK'); // Respond back to CoinPayments

    const ipnData = req.body;

    // Log the IPN data for debugging
    console.log(ipnData);
  
    // Process IPN data (verify, update order status, etc.)
    if (ipnData.status == 100) {
        console.log('Payment successful');
          console.log(req.body);
      // Update your database, fulfill the order, etc.
    }
  
    res.send('IPN received');
   
            
});
router.post("/investipn", function (request, res){
     

    // console.log('Received IPN:', request.body);
  
    // // Process the IPN message and verify the payment here
    
    // res.send('OK'); // Respond back to CoinPayments

    const ipnData = req.body;

    // Log the IPN data for debugging
    console.log(ipnData);
  
    // Process IPN data (verify, update order status, etc.)
    if (ipnData.status == 100) {
        console.log('Payment successful');
          console.log(req.body);
      // Update your database, fulfill the order, etc.
    }
  
    res.send('IPN received');
   
            
});

router.post("/subscriptionipn", function (request, res){
     

    // console.log('Received IPN:', request.body);
  
    // // Process the IPN message and verify the payment here
    
    // res.send('OK'); // Respond back to CoinPayments

    const ipnData = req.body;

    // Log the IPN data for debugging
    console.log(ipnData);
  
    // Process IPN data (verify, update order status, etc.)
    if (ipnData.status == 100) {
        console.log('Payment successful');
          console.log(req.body);
      // Update your database, fulfill the order, etc.
    }
  
    res.send('IPN received');
   
            
});





///////////////////////////////////////////////////////////////////////////////////////
/////////////*************************   Admin Start  ********************/////////////
///////////////////////////////////////////////////////////////////////////////////////

router.post("/membersearch", function (request, response) {

    let order = { ...request.body }

    dboperations.getmembersearch(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1,
                data: result.recordsets[0],

            });
        }
    });
  

});

router.post("/updateadminpassword", function (request, response) {

    let order = { ...request.body }
   
    dboperations.updateadminpasswordbyadmin(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1,
                data: result.recordsets[0],


            });
        }
    });
   

});

router.post("/getdirectteamadmin", function (request, response) {

    let order = { ...request.body }


    dboperations.directteamadmin(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1, 
                data: result.recordsets[0],


            });
        }
    });
    
    

});


router.post("/getMyteamadmin", function (request, response) {

    let order = { ...request.body }
  
    dboperations.teamnetworkadmin(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1,
                data: result.recordsets[0],
            });
        }
    });
   

});



router.route('/binarypayout').get((request,response)=>{

    
    try{
        dboperations.getbinarypayout().then(result =>{
               console.log(result);
               response.json(result["recordsets"][0]);
           })
         }
        catch(error){

        }

});

router.route('/binarycommission_slot').get((request,response)=>{

    
    try{
        dboperations.getbinaryComm_slot().then(result =>{
               console.log(result);
               response.json(result["recordsets"][0]);
           })
         }
        catch(error){

        }

});


router.post("/getdailyincomeroiadmin", function (request, response) {

    let order = { ...request.body }
   
    dboperations.dailyincomeadmin(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1,
                data: result.recordsets[0],
            });
        }
    });
   
});

router.post("/levelcommissionadmin", function (request, response) {

    let order = { ...request.body }

    dboperations.getlevelcommissionadmin(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1,
                data: result.recordsets[0],

            });
        }
    });
  

});



router.post("/passupincomecommissionadmin", function (request, response) {

    let order = { ...request.body }
    dboperations.getpassupincomecommissionadmin(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1,
                data: result.recordsets[0],

            });
        }
    });


});

router.post("/getname", function (request, response) {

    try {


        let order = { ...request.body }
        dboperations.getName(order).then(result => {

            console.log('1113');
            console.log(result.recordsets[0]);
            console.log('1114');
            response.json({
                message: "success",
                result: result.recordsets[0]
            });
            //console.log(token);

            // response.json(token);

        });

    }
    catch (error) {

    }





});


router.post("/getbalancebywallet", function (request, response) {

    let order = { ...request.body }
    dboperations.getbalancebywallet(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});



router.post("/insertFundcreditordebit", function (request, response) {

    let order = { ...request.body }
    dboperations.insertfundcredit(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],
            });
        }
    });

});


router.post("/walletstatement_admin", function (request, response) {

    let order = { ...request.body }
    dboperations.walletbalancelistbyadmin(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});

router.post("/ministatement", function (request, response) {

    let order = { ...request.body }
    dboperations.getministatement(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});


router.post("/depositadmindetails", function (request, response) {

    let order = { ...request.body }

    dboperations.getdepositdetailsadmin(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1,
                data: result.recordsets[0],

            });
        }
    });
  

});



router.post("/investmentadmindetails", function (request, response) {

    let order = { ...request.body }

    dboperations.getinvestmentdetailsadmin(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1,
                data: result.recordsets[0],

            });
        }
    });
  

});

router.post("/subscriptionadmindetails", function (request, response) {

    let order = { ...request.body }

    dboperations.getsubscriptiondetailsadmin(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1,
                data: result.recordsets[0],

            });
        }
    });
  

});


router.post("/membershipadmindetails", function (request, response) {

    let order = { ...request.body }

    dboperations.getmembershipdetailsadmin(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                statuscode:1,
                data: result.recordsets[0],

            });
        }
    });
  

});
///////////////////////////////////////////////////////////////////////////////////////
/////////////*************************   Admin End  ********************/////////////
///////////////////////////////////////////////////////////////////////////////////////




























































































router.route('/getwithdrawalstatus').post((request, response) => {

    try {
        dboperations.getwithdrawalstatus().then(result => {
            console.log(result);
            response.json(result["recordsets"][0]);
        })
    }
    catch (error) {

    }

});

router.post("/updatewithdrawalstatus", function (request, response) {

    let order = { ...request.body }
    dboperations.updatwithdrawal(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});











router.post("/getdashboard", function (request, response) {

    let order = { ...request.body }
    dboperations.getdashboard(order).then(result => {


        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],


            });
        }

    });

});






router.post("/updateadminpasswordnew", function (request, response) {

    let order = { ...request.body }
    dboperations.updateadminpwd(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],


            });
        }
    });

});







router.post("/checkfutureroiincome", function (request, response) {

    let order = { ...request.body }
    dboperations.checkroiincome(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});

router.post("/updateroisetting", function (request, response) {

    let order = { ...request.body }
    dboperations.roisetting(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});

router.post("/roilist", function (request, response) {

    let order = { ...request.body }
    dboperations.roilist(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],


            });
        }
    });

});

router.post("/updatebtcaddres", function (request, response) {

    let order = { ...request.body }
    dboperations.updatebtcaddress(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});


crypto.randomBytes(12, function (err, bytes) {
    console.log(bytes.toString("hex"));
});
//deposit

const storage = multer.diskStorage({
    destination: function (request, file, cb) {
        cb(null, './images')
    },
    filename: function (request, file, cb) {
        crypto.randomBytes(12, function (err, bytes) {
            const fn = bytes.toString("hex") + path.extname(file.originalname)
            cb(null, fn)
        })
    }
})


const upload = multer({ storage: storage })

router.post("/insetdepositrequest", upload.single("filename"), async function (request, response) {

    let order = { ...request.body }


    console.log();
    console.log(request.body.userid);
    console.log(request.body.amount);
    console.log(request.body.referenceno);



    try {


        const conn = await sql.connect(config);
        const res = await conn.request()

            .input("filename", request.file.filename)
            .input("TxID", request.body.txid)
            .input("Amount", request.body.amount)
            .input("PaymentMode", request.body.PaymentMode)
            .input("Address", request.body.Address)
            .input("MEMBERID", request.body.userid)
            .execute("Usp_insertDepositRequest");
        // console.log(res);
        //return res;

        if (res != null) {

            response.json({
                data: res.recordsets[0],

            });
        }


    }
    catch (error) {
        console.log(error);
    }



});




router.post("/approvedrequest", function (request, response) {

    let order = { ...request.body }
    dboperations.updateapprovedrequest(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});

router.post("/rejectrequest", function (request, response) {

    let order = { ...request.body }
    dboperations.updaterejectrequest(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});







router.post("/getdailyincome", function (request, response) {

    let order = { ...request.body }
    dboperations.dailyincome(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],
            });
        }
    });

});


router.post("/getdirectincome", function (request, response) {

    let order = { ...request.body }
    dboperations.directincome(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],
            });
        }
    });

});

//Deposit Request

router.post("/getdepositrequestlist", function (request, response) {

    let order = { ...request.body }
    dboperations.depositrequest(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],
            });
        }
    });

});
//End


router.post("/upgradadmin", function (request, response) {

    let order = { ...request.body }
    dboperations.upgradeadmin(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],
            });
        }
    });

});

router.post("/upgradenow", function (request, response) {

    let order = { ...request.body }
    dboperations.upgrade(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],
            });
        }
    });

});

router.post("/RechargeDtls", function (request, response) {

    let order = { ...request.body }
    dboperations.Upgradedetails(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});


router.post("/fundtransfertotradingwallet", function (request, response) {

    let order = { ...request.body }
    dboperations.fundtranfertotrading(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});

router.post("/fundtransfer", function (request, response) {

    let order = { ...request.body }
    dboperations.fundtranfer(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});

router.post("/fundtransferdtls", function (request, response) {

    let order = { ...request.body }
    dboperations.fundtranferDetails(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});

router.post("/walletstatement", function (request, response) {

    let order = { ...request.body }
    dboperations.walletbalancelist(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});



router.post("/membersearchdtls", function (request, response) {

    let order = { ...request.body }
    dboperations.membersearch(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});


router.post("/blockunblock", function (request, response) {

    let order = { ...request.body }
    dboperations.blockunblock(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});



router.post("/withdrwalrequest", function (request, response) {

    let order = { ...request.body }
    dboperations.withdrwalrequest(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});










router.post("/withdrwalrequestuser", function (request, response) {

    let order = { ...request.body }
    dboperations.withdrwalrequestuser(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});


router.post("/approvedwithdrawalrequest", function (request, response) {

    let order = { ...request.body }
    dboperations.updatewithdrawalapprovedrequest(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});

router.post("/rejectwithdrawalrequest", function (request, response) {

    let order = { ...request.body }
    dboperations.updatewithdrawalrejectrequest(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});




router.post("/withdrwalrequestDetails", function (request, response) {

    let order = { ...request.body }
    dboperations.withdrwalrequestDetails(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});



router.post("/ibcommisionsDtls", function (request, response) {

    let order = { ...request.body }
    dboperations.ibcommisions(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});


router.post("/tradingbonusDtls", function (request, response) {

    let order = { ...request.body }
    dboperations.tradingbonus(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});

router.post("/teamwithwalbousdtls", function (request, response) {

    let order = { ...request.body }
    dboperations.teamwithwalbous(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});



router.get("/getsupportreqlist", function (request, response) {

    let order = { ...request.body }
    dboperations.getSupportReqUserIDlist(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});


router.post("/getSupporttokenlistbyuserid", function (request, response) {

    let order = { ...request.body }
    dboperations.Supporttokenlistbyuserid(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});
router.post("/getchatlistbyticketid", function (request, response) {

    let order = { ...request.body }
    dboperations.getchatbyadmin(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});
router.post("/insertchatadmin", function (request, response) {

    let order = { ...request.body }
    dboperations.insertmessageadmin(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});
router.post("/insertchatcloseadmin", function (request, response) {

    let order = { ...request.body }
    dboperations.closeticketadmin(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],

            });
        }
    });

});





router.route('/RankNames').get((request, response) => {

    try {
        dboperations.getRankNames().then(result => {
            console.log(result);
            response.json(result["recordsets"][0]);
        })
    }
    catch (error) {

    }

});

router.post("/Rankachivers", function (request, response) {

    let order = { ...request.body }
    dboperations.getRankachivers(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json({
                data: result.recordsets[0],
            });
        }
    });

});

//Mobile app


router.post("/profile", function (request, response) {

    let order = { ...request.body }
    dboperations.getprofileadmin(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });

});




router.post("/updateuserprofile", upload.single("filename"), async function (request, response) {

    let order = { ...request.body }


    console.log();
    console.log(request.body.userid);
    console.log(request.body.name);
    console.log(request.body.address);
    console.log(request.body.country);
    console.log(request.body.state);
    console.log(request.body.pincode);
    console.log(request.body.mobileno);
    console.log(request.body.emailid);


    try {


        const conn = await sql.connect(config);
        const res = await conn.request()

            .input("TITLE", "Mr")
            .input("DIST", "")
            .input("STATE", request.body.state)
            .input("COUNTRY", request.body.country)
            .input("FIRSTNAME", request.body.name)
            .input("ADDRESS", request.body.address)
            .input("CITY", "")
            .input("PINCODE", request.body.pincode)
            .input("MOBILENO", request.body.mobileno)
            .input("EMAILID", request.body.emailid)
            .input("MemberID", request.body.userid)
            .input("ProfileImage", request.file.filename)



            .execute("Usp_editregistration_member");
        // console.log(res);
        //return res;

        if (res != null) {

            response.json({
                data: res.recordsets[0],

            });
        }


    }
    catch (error) {
        console.log(error);
    }



});



router.post("/kycprofile", function (request, response) {

    let order = { ...request.body }
    dboperations.getkycprofile(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });

});



const cpUpload = upload.fields([{ name: 'filename', maxCount: 1 }, { name: 'filename1', maxCount: 1 }])

router.post("/updatekycprofile", cpUpload, async function (request, response) {

    let order = { ...request.body }

    console.log('Dtata--1');
    console.log(request.body.userid);
    console.log(request.files['filename'][0].filename.toString());
    console.log(request.files['filename1'][0].filename.toString());
    console.log(request.body.panno);
    console.log(request.body.aadharno);
    console.log('Dtata--2');


    try {


        const conn = await sql.connect(config);
        const res = await conn.request()

            .input("Panno", request.body.panno)
            .input("Aadharno", request.body.aadharno)
            .input("MEMBERID", request.body.userid)
            .input("aadharimage", request.files['filename'][0].filename.toString())
            .input("PancardImage", request.files['filename1'][0].filename.toString())


            .execute("USP_Updatekyc");
        // console.log(res);
        //return res;

        if (res != null) {

            response.json({
                data: res.recordsets[0],

            });
        }


    }
    catch (error) {
        console.log(error);
    }



});






router.post("/mydirectteam", function (request, response) {

    let order = { ...request.body }
    dboperations.directteammember(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });

});

router.post("/mylevelteam", function (request, response) {

    let order = { ...request.body }
    dboperations.mylevelteam(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });

});

router.post("/getlevelachiver", function (request, response) {

    let order = { ...request.body }
    dboperations.levelachiverreport(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });

});

router.post("/mytotalteam", function (request, response) {

    let order = { ...request.body }
    dboperations.getmytotalteam(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });

});


router.post("/depositrequestlistuser", function (request, response) {

    let order = { ...request.body }
    dboperations.depositrequestdetails(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });

});




router.post("/walletstatementuser", function (request, response) {

    let order = { ...request.body }
    dboperations.getwalletstatement(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });

});
router.post("/withdrwalrequestDetailsuser", function (request, response) {

    let order = { ...request.body }
    dboperations.withdrwalrequestdetailsuser(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });

});

router.post("/ibocomm", function (request, response) {

    let order = { ...request.body }
    dboperations.getibocomm(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });

});
router.post("/tradingbonus", function (request, response) {

    let order = { ...request.body }
    dboperations.gettradingbonus(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });

});
router.post("/withdrawalbonus", function (request, response) {

    let order = { ...request.body }
    dboperations.getwithdrawalbonus(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });

});


// router.post("/getgeneratiolevelincome", function(request, response){

//     let order= {...request.body}
//     dboperations.generationlevelincomeuser(order).then(result => {

//         if(result !=null){
//             console.log(result.recordsets[0])
//             response.json(result["recordsets"][0]);
//         }
//     });

// });
// router.post("/getweeklygenerationincome", function(request, response){

//     let order= {...request.body}
//     dboperations.weeklygenerationincomeuser(order).then(result => {

//         if(result !=null){
//             console.log(result.recordsets[0])
//             response.json(result["recordsets"][0]);
//         }
//     });

// });
// router.post("/getTeamRank", function(request, response){

//     let order= {...request.body}
//     dboperations.TeamRank(order).then(result => {

//         if(result !=null){
//             console.log(result.recordsets[0])
//             response.json(result["recordsets"][0]);
//         }
//     });

// });

// router.post("/getCtoincome", function(request, response){

//     let order= {...request.body}
//     dboperations.Ctoincome(order).then(result => {

//         if(result !=null){
//             console.log(result.recordsets[0])
//             response.json(result["recordsets"][0]);
//         }
//     });

// });



router.post("/getLuckydrawcoupon", function (request, response) {

    let order = { ...request.body }
    dboperations.luckydrawcoupon(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });

});


router.post("/getadminaddressbyid", function (request, response) {

    let order = { ...request.body }
    dboperations.getadminaddress(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });

});

router.post("/RechargeDtlsbyuser", function (request, response) {

    let order = { ...request.body }
    dboperations.Upgradedetailsbymob(order).then(result => {
        if (result != null) {
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });

});

router.post("/insertsupportcreatenew", upload.single("filename"), async function (request, response) {

    let order = { ...request.body }


    console.log();
    console.log(request.body.userid);

    try {


        const conn = await sql.connect(config);
        const res = await conn.request()

            .input("File", request.file.filename)
            .input("Message", request.body.Message)
            .input("Subject", request.body.subject)
            .input("UserID", request.body.userid)
            .execute("USP_InsertChatbyUser");
        // console.log(res);
        //return res;

        if (res != null) {

            response.json({
                data: res.recordsets[0],

            });
        }


    }
    catch (error) {
        console.log(error);
    }

});



router.post("/insertchatbyuserbyticketID", function (request, response) {

    let order = { ...request.body }
    dboperations.insertchatbyuser(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });

});



router.post("/getSupporttokenlistIDbymob", function (request, response) {

    let order = { ...request.body }
    dboperations.supporttokenlistbyUseridmob(order).then(result => {


        if (result != null) {
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });

});



router.post("/getchatlistbyticketidmob", function (request, response) {

    let order = { ...request.body }
    dboperations.getchatbyadmin(order).then(result => {

        if (result != null) {
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });

});

//End Mobile app


app.listen(port, (c) => {
    console.log(
        `Server is working on port ${port} in ${process.env.NODE_ENV} Mode.`
    )
});