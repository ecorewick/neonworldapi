

const dboperations = require('./dboperations');
var express = require('express');
var bodyParser = require('body-parser');
const dotenv = require('dotenv');
 const jwt = require('jsonwebtoken');
const cors = require('cors');

const multer = require('multer');

var CryptoJS = require("crypto-js");

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
app.use(cors({origin:"*"}))
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use('/api', router);

app.use('/images', express.static('images'));




var drespose="";


//// Global START


router.route('/country').get((request,response)=>{

    try{
        dboperations.getCountry().then(result =>{
               console.log(result);
               response.json(result["recordsets"][0]);
           })
         }
        catch(error){

        }

});


router.route('/countrylist').post((request,response)=>{

    try{
        dboperations.getCountry().then(result =>{
               console.log(result);
               response.json(result["recordsets"][0]);
           })
         }
        catch(error){

        }

});


router.post("/statelist", function(request, response){

    let order= {...request.body}
    dboperations.statelist(order).then(result => {
       
      console.log(result);
        response.json(result["recordsets"][0]);

    });
    
});

router.post("/adminlogin", function(request, response){


    try{

        console.log('start');
        let order= {...request.body}
        dboperations.adminapi(order).then(result => {
        
         console.log(result.recordsets);
 
           
            if(result.recordsets[0][0].Valid =="TRUE")
            {
                const user= {id:result.recordsets[0][0].ID};
    
                var data =  result.recordsets[0][0].UserID;
                  // Encrypt
                var cipherUserID = CryptoJS.AES.encrypt(JSON.stringify(data), 'msecret-keys@9128').toString();
                console.log(cipherUserID);
                const token = jwt.sign({USERID:data},"msecret-keys@9128", {expiresIn:"15m"});
                response.json({
                    token:token,
                    status:"success",
                    message:"valid",
                    id:result.recordsets[0][0].AdminID,
                    UserID:result.recordsets[0][0].UserID,
                    FullName:'Admin',
                    EmailID:'',
                    valid:result.recordsets[0][0].Valid,
                    url:result.recordsets[0][0].URL,
                    ismember:'0',
                    Encrypt:cipherUserID
                });
        
             }
             else{
                response.json({
                    status:"failure",
                    msg:'Invalid UserID or Password',
                   
                });



             }
        });

    }
    catch(error){

    }
   
    
});


router.post("/signin", function(request, response){


    try
    {

        let order= {...request.body}
        dboperations.signinapi(order).then(result => {
        
           // console.log(result.recordsets);
    
           
            if(result.recordsets[0][0].Valid=="TRUE")
            {
                const user= {id:result.recordsets[0][0].ID};
    
                var data =  result.recordsets[0][0].UserID;
                  // Encrypt
                var cipherUserID = CryptoJS.AES.encrypt(JSON.stringify(data), 'msecret-keys@9128').toString();
    
                const token = jwt.sign({USERID:user},"msecret-keys@9128", {expiresIn:"30m"});
                response.json({
                    token:token,
                    status:"success",
                    msg:'Valid',
                    id:result.recordsets[0][0].ID,
                    UserID:result.recordsets[0][0].USERID,
                    FullName:result.recordsets[0][0].FIRSTNAME,
                    EmailID:result.recordsets[0][0].EMailId,
                    valid:result.recordsets[0][0].Valid,
                    url:result.recordsets[0][0].URL,
                    ismember:'1',
                    Encrypt:cipherUserID
                });
        
             }
             else{
                response.json({
                    
                    status:"failure",
                    msg:'Invalid UserID or Password',
            
                });
             }
        });


    } catch(error){

    }
  
    
});

router.post("/getmemerdashboard", function(request, response){

    let order= {...request.body}
    dboperations.getmemberdashboard(order).then(result => {
    
       console.log(result.recordsets);
      response.json(result["recordsets"][0]);
          
    
    });
    
});













































router.route('/getwithdrawalstatus').post((request,response)=>{

    try{
        dboperations.getwithdrawalstatus().then(result =>{
               console.log(result);
               response.json(result["recordsets"][0]);
           })
         }
        catch(error){

        }

});

router.post("/updatewithdrawalstatus", function(request, response){

    let order= {...request.body}
    dboperations.updatwithdrawal(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});



router.post("/CheckSpnsor", function(request, response){

    let order= {...request.body}
    dboperations.getCheckSpnsor(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});


router.post("/signup", function(request, response){

    let order= {...request.body}
    dboperations.insertReg(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json(result["recordsets"][0]);
            }
    });
    
});
router.post("/welcome", function(request, response){

    try{

    
    let order= {...request.body}
    dboperations.getwelcome(order).then(result => {
    
        console.log('1113');
          response.json(result["recordsets"][0]);

    
    });

    }
    catch(error){

    }




    
});



router.post("/loginverify", function(request, response){

    try{

        console.log('ccc1');
       // let order= {...request.body}

        const token1 = request.header('Authorization');
        console.log(token1);
        if (!token1) return res.status(401).json({ error: 'Access denied' });
        console.log('ccc2');
        try {
            console.log('ccc3');
            const decoded = jwt.verify(token1, 'msecret-keys@9128');
            console.log(decoded);
            console.log('ccc4');
            request.USERID = decoded.USERID;
            if(decoded.USERID != null)
            {
                response.status(200).json({ status: 'Valid token' });
            }
            else{
                response.status(200).json({ status: 'Invalid token' });
            }
           next();
            } catch (error) {
                response.status(401).json({ status: 'Session expaired Invalid token' });
            }
            
      

      

    }
    catch(error){

    }
   
    
});



router.post("/getdashboard", function(request, response){

    let order= {...request.body}
    dboperations.getdashboard(order).then(result => {
    
       
        if(result !=null){
            console.log(result.recordsets[0])
            response.json({
                data:result.recordsets[0],
               

            });
        }
    
    });
    
});


router.post("/getname", function(request, response){

    try{

    
    let order= {...request.body}
    dboperations.getName(order).then(result => {
    
        console.log('1113');
          console.log(result.recordsets[0]);
          console.log('1114');
          response.json({
                message:"success",
                result:result.recordsets[0]
            });
            //console.log(token);

           // response.json(token);
    
    });

    }
    catch(error){

    }




    
});


router.post("/updatememberpassword", function(request, response){

    let order= {...request.body}
    dboperations.updatepassword(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   

                });
            }
    });
    
});

router.post("/updateadminpassword", function(request, response){

    let order= {...request.body}
    dboperations.updateadminpwd(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                  

                });
            }
    });
    
});


router.post("/getprofile", function(request, response){

    let order= {...request.body}
    dboperations.getprofileadmin(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   

                });
            }
    });
    
});

router.post("/getbalancebywallet", function(request, response){

    let order= {...request.body}
    dboperations.getbalancebywallet(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});


router.post("/updateprofile", function(request, response){

    let order= {...request.body}
    dboperations.updateprofileadmin(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});


router.post("/checkfutureroiincome", function(request, response){

    let order= {...request.body}
    dboperations.checkroiincome(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});

router.post("/updateroisetting", function(request, response){

    let order= {...request.body}
    dboperations.roisetting(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});

router.post("/roilist", function(request, response){

    let order= {...request.body}
    dboperations.roilist(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   

                });
            }
    });
    
});

router.post("/updatebtcaddres", function(request, response){

    let order= {...request.body}
    dboperations.updatebtcaddress(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});


crypto.randomBytes(12,function (err, bytes){
console.log(bytes.toString("hex"));
});
//deposit

const storage = multer.diskStorage({
    destination:function(request, file, cb){
        cb(null,'./images')
    },
    filename:function(request, file, cb){
        crypto.randomBytes(12, function(err,bytes){
            const fn= bytes.toString("hex")+ path.extname(file.originalname)
            cb(null,fn)
        })
    }
})


const upload = multer({storage:storage})

router.post("/insetdepositrequest",upload.single("filename"),async function(request, response){

   let order= {...request.body}
  

    console.log();
    console.log(request.body.userid);
    console.log(request.body.amount);
    console.log(request.body.referenceno);
    


    try{
        
       
        const conn= await sql.connect(config);
            const res =await conn.request()
           
            .input("filename", request.file.filename)
            .input("TxID", request.body.txid)
            .input("Amount", request.body.amount)
            .input("PaymentMode", request.body.PaymentMode)
            .input("Address", request.body.Address)
            .input("MEMBERID", request.body.userid)
            .execute("Usp_insertDepositRequest");
           // console.log(res);
            //return res;

                if(res !=null){
                       
                        response.json({
                            data:res.recordsets[0],
                            
                        });
             }


    }
    catch(error){
        console.log(error);
    }


       
});




router.post("/approvedrequest", function(request, response){

    let order= {...request.body}
    dboperations.updateapprovedrequest(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});

router.post("/rejectrequest", function(request, response){

    let order= {...request.body}
    dboperations.updaterejectrequest(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});






router.post("/getdirectteam", function(request, response){

    let order= {...request.body}
    dboperations.directteam(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   

                });
            }
    });
    
});

router.post("/getMyteam", function(request, response){

    let order= {...request.body}
    dboperations.teamnetwork(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],                   
                });
            }
    });
    
});

router.post("/getdailyincome", function(request, response){

    let order= {...request.body}
    dboperations.dailyincome(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],                   
                });
            }
    });
    
});


router.post("/getdirectincome", function(request, response){

    let order= {...request.body}
    dboperations.directincome(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],                   
                });
            }
    });
    
});

//Deposit Request

router.post("/getdepositrequestlist", function(request, response){

    let order= {...request.body}
    dboperations.depositrequest(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],                   
                });
            }
    });
    
});
//End


router.post("/upgradadmin", function(request, response){

    let order= {...request.body}
    dboperations.upgradeadmin(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],                   
                });
            }
    });
    
});

router.post("/upgradenow", function(request, response){

    let order= {...request.body}
    dboperations.upgrade(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],                   
                });
            }
    });
    
});

router.post("/RechargeDtls", function(request, response){

    let order= {...request.body}
    dboperations.Upgradedetails(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});


router.post("/fundtransfertotradingwallet", function(request, response){

    let order= {...request.body}
    dboperations.fundtranfertotrading(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});

router.post("/fundtransfer", function(request, response){

    let order= {...request.body}
    dboperations.fundtranfer(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});

router.post("/fundtransferdtls", function(request, response){

    let order= {...request.body}
    dboperations.fundtranferDetails(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});

router.post("/walletstatement", function(request, response){

    let order= {...request.body}
    dboperations.walletbalancelist(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});

router.post("/ministatement", function(request, response){

    let order= {...request.body}
    dboperations.getministatement(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});

router.post("/membersearchdtls", function(request, response){

    let order= {...request.body}
    dboperations.membersearch(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});


router.post("/blockunblock", function(request, response){

    let order= {...request.body}
    dboperations.blockunblock(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});



router.post("/withdrwalrequest", function(request, response){

    let order= {...request.body}
    dboperations.withdrwalrequest(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});










router.post("/withdrwalrequestuser", function(request, response){

    let order= {...request.body}
    dboperations.withdrwalrequestuser(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});


router.post("/approvedwithdrawalrequest", function(request, response){

    let order= {...request.body}
    dboperations.updatewithdrawalapprovedrequest(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});

router.post("/rejectwithdrawalrequest", function(request, response){

    let order= {...request.body}
    dboperations.updatewithdrawalrejectrequest(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});




router.post("/withdrwalrequestDetails", function(request, response){

    let order= {...request.body}
    dboperations.withdrwalrequestDetails(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});



router.post("/ibcommisionsDtls", function(request, response){

    let order= {...request.body}
    dboperations.ibcommisions(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});


router.post("/tradingbonusDtls", function(request, response){

    let order= {...request.body}
    dboperations.tradingbonus(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});

router.post("/teamwithwalbousdtls", function(request, response){

    let order= {...request.body}
    dboperations.teamwithwalbous(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});


router.post("/insertFundcreditordebit", function(request, response){

    let order= {...request.body}
    dboperations.insertfundcredit(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],                   
                });
            }
    });
    
});
router.get("/getsupportreqlist", function(request, response){

    let order= {...request.body}
    dboperations.getSupportReqUserIDlist(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});


router.post("/getSupporttokenlistbyuserid", function(request, response){

    let order= {...request.body}
    dboperations.Supporttokenlistbyuserid(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});
router.post("/getchatlistbyticketid", function(request, response){

    let order= {...request.body}
    dboperations.getchatbyadmin(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});
router.post("/insertchatadmin", function(request, response){

    let order= {...request.body}
    dboperations.insertmessageadmin(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});
router.post("/insertchatcloseadmin", function(request, response){

    let order= {...request.body}
    dboperations.closeticketadmin(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],
                   
                });
            }
    });
    
});





router.route('/RankNames').get((request,response)=>{

    try{
        dboperations.getRankNames().then(result =>{
               console.log(result);
               response.json(result["recordsets"][0]);
           })
         }
        catch(error){

        }

});

router.post("/Rankachivers", function(request, response){

    let order= {...request.body}
    dboperations.getRankachivers(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json({
                    data:result.recordsets[0],                   
                });
            }
    });
    
});

//Mobile app


router.post("/profile", function(request, response){

    let order= {...request.body}
    dboperations.getprofileadmin(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json(result["recordsets"][0]);
            }
    });
    
});




router.post("/updateuserprofile",upload.single("filename"),async function(request, response){

    let order= {...request.body}
   
 
     console.log();
     console.log(request.body.userid);
     console.log(request.body.name);
     console.log(request.body.address);
     console.log(request.body.country);
     console.log(request.body.state);
     console.log(request.body.pincode);
     console.log(request.body.mobileno);
     console.log(request.body.emailid);
 
 
     try{
         
        
         const conn= await sql.connect(config);
             const res =await conn.request()
            
             .input("TITLE", "Mr")
             .input("DIST", "")
             .input("STATE", request.body.state)
             .input("COUNTRY",request.body.country)
             .input("FIRSTNAME",request.body.name)
            .input("ADDRESS",request.body.address)
            .input("CITY","")
            .input("PINCODE",request.body.pincode)
            .input("MOBILENO",request.body.mobileno)
            .input("EMAILID",request.body.emailid)
            .input("MemberID",request.body.userid)
            .input("ProfileImage",request.file.filename)



             .execute("Usp_editregistration_member");
            // console.log(res);
             //return res;
 
                 if(res !=null){
                    
                    response.json({
                        data:res.recordsets[0],
                        
                    });
              }
 
 
     }
     catch(error){
         console.log(error);
     }
 
 
        
 });
 

 
router.post("/kycprofile", function(request, response){

    let order= {...request.body}
    dboperations.getkycprofile(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json(result["recordsets"][0]);
            }
    });
    
});



const cpUpload = upload.fields([{ name: 'filename', maxCount: 1 }, { name: 'filename1', maxCount: 1 }])

router.post("/updatekycprofile",cpUpload,async function(request, response){

    let order= {...request.body}
   
     console.log('Dtata--1');
     console.log(request.body.userid);
     console.log(request.files['filename'][0].filename.toString());
     console.log(request.files['filename1'][0].filename.toString());
     console.log(request.body.panno);
     console.log(request.body.aadharno);
     console.log('Dtata--2');
 
 
     try{
         
        
         const conn= await sql.connect(config);
             const res =await conn.request()
            
            .input("Panno",request.body.panno)
            .input("Aadharno",request.body.aadharno)
            .input("MEMBERID",request.body.userid)
            .input("aadharimage",request.files['filename'][0].filename.toString())
            .input("PancardImage",request.files['filename1'][0].filename.toString())


             .execute("USP_Updatekyc");
            // console.log(res);
             //return res;
 
                 if(res !=null){
                    
                    response.json({
                        data:res.recordsets[0],
                        
                    });
              }
 
 
     }
     catch(error){
         console.log(error);
     }
 
 
        
 });
 
 




router.post("/mydirectteam", function(request, response){

    let order= {...request.body}
    dboperations.directteammember(order).then(result => {
    
          if(result !=null){
                console.log(result.recordsets[0])
                response.json(result["recordsets"][0]);
            }
    });
    
});

router.post("/mylevelteam", function(request, response){

    let order= {...request.body}
    dboperations.mylevelteam(order).then(result => {
    
        if(result !=null){
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });
    
});

router.post("/getlevelachiver", function(request, response){

    let order= {...request.body}
    dboperations.levelachiverreport(order).then(result => {
    
        if(result !=null){
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });
    
});

router.post("/mytotalteam", function(request, response){

    let order= {...request.body}
    dboperations.getmytotalteam(order).then(result => {
    
        if(result !=null){
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });
    
});


router.post("/depositrequestlistuser", function(request, response){

    let order= {...request.body}
    dboperations.depositrequestdetails(order).then(result => {
    
        if(result !=null){
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });
    
});




router.post("/walletstatementuser", function(request, response){

    let order= {...request.body}
    dboperations.getwalletstatement(order).then(result => {
    
        if(result !=null){
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });
    
});
router.post("/withdrwalrequestDetailsuser", function(request, response){

    let order= {...request.body}
    dboperations.withdrwalrequestdetailsuser(order).then(result => {
    
        if(result !=null){
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });
    
});

router.post("/ibocomm", function(request, response){

    let order= {...request.body}
    dboperations.getibocomm(order).then(result => {
    
        if(result !=null){
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });
    
});
router.post("/tradingbonus", function(request, response){

    let order= {...request.body}
    dboperations.gettradingbonus(order).then(result => {
    
        if(result !=null){
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });
    
});
router.post("/withdrawalbonus", function(request, response){

    let order= {...request.body}
    dboperations.getwithdrawalbonus(order).then(result => {
    
        if(result !=null){
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



router.post("/getLuckydrawcoupon", function(request, response){

    let order= {...request.body}
    dboperations.luckydrawcoupon(order).then(result => {
    
        if(result !=null){
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });
    
});


router.post("/getadminaddressbyid", function(request, response){

    let order= {...request.body}
    dboperations.getadminaddress(order).then(result => {
    
        if(result !=null){
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });
    
});

router.post("/RechargeDtlsbyuser", function(request, response){

    let order= {...request.body}
    dboperations.Upgradedetailsbymob(order).then(result => {
        if(result !=null){
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });
    
});

router.post("/insertsupportcreatenew",upload.single("filename"),async function(request, response){

    let order= {...request.body}
   
 
     console.log();
     console.log(request.body.userid);

     try{
         
        
         const conn= await sql.connect(config);
             const res =await conn.request()
            
             .input("File", request.file.filename)
             .input("Message", request.body.Message)
             .input("Subject", request.body.subject)
             .input("UserID", request.body.userid)
             .execute("USP_InsertChatbyUser");
            // console.log(res);
             //return res;
 
                 if(res !=null){
                        
                         response.json({
                             data:res.recordsets[0],
                             
                         });
              }
 
 
     }
     catch(error){
         console.log(error);
     }
        
 });



 router.post("/insertchatbyuserbyticketID", function(request, response){

    let order= {...request.body}
    dboperations.insertchatbyuser(order).then(result => {
    
        if(result !=null){
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });
    
});



router.post("/getSupporttokenlistIDbymob", function(request, response){

    let order= {...request.body}
    dboperations.supporttokenlistbyUseridmob(order).then(result => {
    
          
        if(result !=null){
            console.log(result.recordsets[0])
            response.json(result["recordsets"][0]);
        }
    });
    
});



router.post("/getchatlistbyticketidmob", function(request, response){

    let order= {...request.body}
    dboperations.getchatbyadmin(order).then(result => {
    
        if(result !=null){
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