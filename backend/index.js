// import jwt from "jsonwebtoken"
var jwt = require("jsonwebtoken");
const express= require('express');
const bodyparser = require('body-parser');
const cors= require('cors');
const app = express();
app.use(cors());
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
app.use(cors());
app.use(bodyparser.json());

const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database:'labreservationsystem',
	port:3306
});

db.connect(err=>{
	if(err) {console.log('err')}
	console.log('database connected successfully')
})

app.get('/devices/:id', (req, res)=>{
	// console.log('Get all users');
	let qrId= req.params.id;
	let qrr = `SELECT devices.id, devices.rack,devices.consoleport, devices.unit, devices.devicename, devices.consoleip, devices.powercycleip,devices.managementip , devices.powercycleport,  devices.teamname, devices.projectname,
	 devices.status,users.name FROM devices INNER JOIN users ON devices.teamname=users.teamname where users.id='${qrId}'`;
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		res.send({
			message: 'all users data',
			data:results
		});
	};
	});
	
});

app.get('/userdeviceinfo', (req, res)=>{
	// console.log('Get all users');
	let ISToffSet = 330; //IST is 5:30; i.e. 60*5+30 = 330 in minutes 
    let offset= ISToffSet*60*1000;
    let date=new Date();
    startTime=new Date(date.getTime()+offset);
    startTime=startTime.toISOString().substring(0,16);
	let deleted= 'deleted';
	let qrr = `select deviceid from userdeviceinfo where time<= '${startTime}' and endtime >='${startTime}' and status != '${deleted}'`;
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		res.send({
			message: 'all users data',
			data:results
		});
	};
	});
	
});

// get data by id
app.get('/device/:id', (req, res)=>{
	// console.log(req.params.id);
	let qrId= req.params.id;
	
	let qrr = `SELECT * FROM devices  where id ='${qrId}'`;
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		res.send({
			message: 'all data by id',
			data:results
		});
	}
	else{
		message: 'data not found'
	}

	});
	
});


app.get('/users/:id', (req, res)=>{
	// console.log(req.params.id);
	let qrId= req.params.id;
	
	let qrr = `SELECT * FROM users where id ='${qrId}'`;
	db.query(qrr, (err, results)=> {
		
	if(results.length>0){
		res.send({
			message: 'all data by id',
			data:results
		});
	}
	else{
		message: 'username or password wrong'
	}

	});
	
});

app.get('/devices/:id/:current', (req, res)=>{
	// console.log(req.params.id);
	let qrId= req.params.id;
	
	let qrr = `SELECT * FROM devices where userid ='${qrId}'`;
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		res.send({
			message: 'all data by id',
			data:results
		});
	}
	else{
		message: 'data not found'
	}

	});
	
});

app.get('/users/:id/:access', (req, res)=>{
	// console.log(req.params.id);
	let qrId= req.params.id;
	
	let qrr = `SELECT b.id, b.teamname,b.name, b.accesslevel FROM users a INNER JOIN users b ON a.teamname= b.teamname where a.id='${qrId}' and b.id != a.id`;
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		res.send({
			message: 'all data by id',
			data:results
		});
	}
	else{
		message: 'data not found'
	}

	});
	
});



app.get('/cart/:id', (req, res)=>{
	// console.log(req.params.id);
	let qrId= req.params.id;
	let qrr = `select cart.deviceid,cart.id, devices.rack,devices.consoleport, devices.unit, devices.devicename, devices.consoleip, devices.powercycleip,devices.managementip , devices.powercycleport,  devices.teamname, devices.projectname,
	devices.status  from cart INNER JOIN devices ON cart.deviceid=devices.id where cart.userid='${qrId}'`;
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		res.send({
			message: 'all data from cart',
			data:results
		});
	}
	else{
		message: 'data not found'
	}

	});
	
});


app.get('/cart/:id/:date', (req, res)=>{
	// console.log(req.params.id);
	let qrId= req.params.id;
	let date = req.params.date+"_____";
	let deleted = 'deleted';
	let qrr = `select userdeviceinfo.time, userdeviceinfo.endtime , userdeviceinfo.timeid, userdeviceinfo.name from userdeviceinfo INNER JOIN cart ON userdeviceinfo.deviceid=cart.deviceid where userdeviceinfo.userid= cart.userid and userdeviceinfo.status!= '${deleted}' and userdeviceinfo.time LIKE '${date}'`;
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		res.send({
			message: 'all data from cart',
			data:results
		});
	}
	else{
		message: 'data not found'
	}

	});
	
});

// post data
app.post('/users', async (req, res)=>{
	
	let username = req.body.username;
	let password1= req.body.password;

	
	let qrr = `SELECT * FROM users WHERE name LIKE "${username}"`;
	db.query(qrr, async (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		
		// console.log(results);
		const isEqual = await bcrypt.compare(password1,results[0].password);
		if(isEqual){
		
		const token = jwt.sign(
			{
			  email: results[0].username,
			  userId: results[0].id,
			},
			'secretfortoken',
			{ expiresIn: '1h' }
		  );
		//   console.log(token);

		//   res.status(200).json({ token: token, userId: results[0].id });


		  res.send({
			message: 'data present',
			data: results,
			token:token
			
		});
		// res.status(200).json({ token: token, userId: results[0].id });

	}
	else{
		message:'password not matched'
	}
	}
	else{
		meaage:'user not exists'
	}
	
	
});
});



app.post('/users/:changepassword', async (req, res)=>{
	
	let password = req.body.password;
	let uId= req.body.userId;
	const hashedPassword = await bcrypt.hash(password, 12);

	let qrr = `update users set password='${hashedPassword}' where id=${uId}` ;
	db.query(qrr, async (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		
	

		  res.send({
			message: 'chnaged',
			
		});
		// res.status(200).json({ token: token, userId: results[0].id });

	}

});
})
 

app.put('/project',  (req, res)=>{
	
	let projectname= req.body.projectname;
	let teamname= req.body.teamname;
	let type= req.body.type;
	
	let tempQrr=`select * from project where projectname= '${projectname}'`;
	db.query(tempQrr,  (err, results)=> {
		if(err){
			console.log(err);
		}
		if(results.length==0){
			    let qrr = `insert into project (projectname, teamname, type) values ('${projectname}', '${teamname}', '${type}') ` ;
				db.query(qrr,  (err, results)=> {
				if(err){
					console.log(err);
				}
				if(results.length>0){
					res.send({
						message: 'Project Registered !',
					});
				}
			});
		}
		else{
			
				res.status(663).json({
					message: 'Project name already present !'
				})
		}
		
	})
})


// update data
app.put('/devices/:id/:status', (req, res)=> {
	let uId= req.params.id;
	let status = req.body.status;
	

	
	let qrr = `update devices set status='${status}' where id=${uId}`;

	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	
	res.send({
		message: 'data updated successfully'

			
	})
	
})
})


app.put('/cart', (req, res)=> {
	let dId= req.body.deviceId;
	let uId= req.body.userId;
	let tempQuery = `select * from cart where deviceid='${dId}' and userid = '${uId}' `;
	db.query(tempQuery, (err, results)=> {
		let qrr= `insert into cart (deviceid, userid) values ('${dId}', '${uId}')`;
		if(results.length==0){
			db.query(qrr, (err, results)=> {
			res.send({
				message: 'added to cart'

			})
		})
	}

	
})
})

app.put('/topology/:id', (req, res)=> {
	let timeId= req.body.timeid;
	let name=req.body.name;
	let teamname= req.body.team;
	let startTime= req.body.startTime;
	let endTime= req.body.endTime;
	let uId= req.body.uId;
	let values= [];
	for(let i=0;i<req.body.DeviceId.length;i++){
		let temp = [];
		temp.push(name);
		temp.push(teamname);
		temp.push(startTime);
		temp.push(endTime);
		temp.push(req.body.DeviceId[i]);
		temp.push(uId);
		temp.push(timeId);
		values.push(temp);
	}
	// console.log(values+"huhu");
	let tempQuery = `insert into userdeviceinfo (name, team , time, endtime, deviceid, userid, timeid) values ?`;
	db.query(tempQuery, [values], (err, results)=> {
		
		if(results.length==0){
		
			res.send({
				message: 'added to userdeviceinfo table for the topology'

			})
		
	}

	
})
})

app.put('/topology/:id/:extended/:update', (req, res)=> {
	let timeId= req.body.timeid;
	let name=req.body.name;
	let teamname= req.body.team;
	let startTime= req.body.startTime;
	let endTime= req.body.endTime;
	let uId= req.body.uId;
	let start= req.body.startDate;
	let end= req.body.endDate;
	
	// console.log(new Date(start), new Date(end));
	let arr= []

		for(let dt=new Date(start); dt<=new Date(end); dt.setDate(dt.getDate()+1)){
			let ISToffSet = 330; //IST is 5:30; i.e. 60*5+30 = 330 in minutes 
			let offset= ISToffSet*60*1000;
			let date=new Date(dt);
			
			let startTime=new Date(date.getTime()+offset);
			
			
			startTime=startTime.toISOString().substring(0,11);
			arr.push(startTime);
		}
		// console.log(arr);

	let values= [];
	for(let i=0;i<req.body.DeviceId.length;i++){
		for(j=0;j<arr.length;j++){
			let temp = [];
			temp.push(name);
			temp.push(teamname);
			temp.push(arr[j].substring(0, 11)+startTime);
			temp.push(arr[j].substring(0, 11)+endTime);
			temp.push(req.body.DeviceId[i]);
			temp.push(uId);
			temp.push(timeId);
			values.push(temp);
		}
	}
	// console.log(values+"huhu");
	let tempQuery = `insert into userdeviceinfo (name, team , time, endtime, deviceid, userid, timeid) values ?`;
	db.query(tempQuery, [values], (err, results)=> {
		
		if(results.length==0){
		
			res.send({
				message: 'added to userdeviceinfo table for the topology'

			})
		
	}

	
})

})



app.post('/topology/:id', (req, res)=> {
	let timeId= req.body.timeid;
	let name=req.body.name;
	let teamname= req.body.team;
	let startTime= req.body.startTime;
	let endTime= req.body.endTime;
	let uId= req.body.uId;
	let start= req.body.startDate;
	let end= req.body.endDate;
	
	// console.log(new Date(start), new Date(end));
	let arr= []

		for(let dt=new Date(start); dt<=new Date(end); dt.setDate(dt.getDate()+1)){
			let ISToffSet = 330; //IST is 5:30; i.e. 60*5+30 = 330 in minutes 
			let offset= ISToffSet*60*1000;
			let date=new Date(dt);
			
			let startTime=new Date(date.getTime()+offset);
			
			
			startTime=startTime.toISOString().substring(0,11);
			arr.push(startTime);
		}
		// console.log(arr);

	let values= [];
	// for(let i=0;i<req.body.DeviceId.length;i++){
		for(j=0;j<arr.length;j++){
			let temp = [];
			temp.push(name);
			temp.push(teamname);
			temp.push(arr[j].substring(0, 11)+startTime);
			temp.push(arr[j].substring(0, 11)+endTime);
			temp.push(req.body.DeviceId);
			temp.push(uId);
			temp.push(timeId);
			values.push(temp);
		}
	// }
	// console.log(values+"huhu");
	let tempQuery = `insert into userdeviceinfo (name, team , time, endtime, deviceid, userid, timeid) values ?`;
	db.query(tempQuery, [values], (err, results)=> {
		
		if(results.length==0){
		
			res.send({
				message: 'added to userdeviceinfo table for the topology'

			})
		
	}

	
})

})

app.put('/device/:id', (req, res)=> {
	let uId= req.params.id;
	let fullName = req.body.fullname;
	let eMail = req.body.email;
	let Mobile = req.body.mobile;


	
	let qrr = `update devices set fullname='${fullName}',  email='${eMail}', mobile ='${Mobile}' where id=${uId}`;

	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	
	res.send({
		message: 'data updated successfully'

			
	})
	
})
})
app.put('/devices', (req, res)=> {
	
	let rack = req.body.rack;
	let unit = req.body.unit;
	let devicename = req.body.devicename;
	let consoleip = req.body.consoleip;
	let consoleport = req.body.consoleport;
	let managementip = req.body.managementip;
	let powercycleip = req.body.powercycleip;
	let powercycleport = req.body.powercycleport;
	let teamname = req.body.teamname;
	let projectname = req.body.projectname;
	let serialNumber= req.body.serialnumber;
	let Mac= req.body.mac;
	let tg = req.body.tg;
	let status= 'Unreserved'
	let tempQuery= `select * from devices where rack='${rack}' and unit='${unit}' and devicename='${devicename}'`;
	db.query(tempQuery, (err, results)=> {
		if(results.length>0){
			res.send({
				message: 'data already present'
		
				
		})
		}
		if(results.length==0){
			let qrr = `INSERT INTO devices (rack, unit, devicename, consoleip, consoleport, managementip, powercycleip, powercycleport, teamname, projectname, status, serialnumber, mac, tg) VALUES ('${rack}', '${unit}', '${devicename}', '${consoleip}', '${consoleport}', '${managementip}', '${powercycleip}', '${powercycleport}','${teamname}', '${projectname}', '${status}', '${serialNumber}', '${Mac}', '${tg}')`;

	db.query(qrr, (err, results)=> {
		if(err){
			res.status(663).json({
				message: 'upload valid input'
			})
			return;
			
	}
	res.send({
		message: 'data updated successfully'

		
})
	})
}
	
		
	})
	
		
	})



app.post('/devices/:deviceData', (req, res)=> {
	let data = req.body;
	// console.log(data);
	let valid = true;
	let ans = [];
	let finalArray=[];
	for(let i=0;i<data.length;i++){
		let temp = [];
		if(data[i].rack==undefined || data[i].unit==undefined || data[i].devicename==undefined || data[i].consoleip==undefined || data[i].consoleport==undefined || data[i].managementip==undefined || data[i].powercycleip==undefined || data[i].powercycleport==undefined || data[i].teamname==undefined || data[i].projectname==undefined ||  data[i].serialnumber==undefined || data[i].mac==undefined){
			valid=false;
		}
		else{
			temp.push(data[i].rack);
			temp.push(data[i].unit);
			temp.push(data[i].devicename);
			temp.push(data[i].consoleip);
			temp.push(data[i].consoleport);
			temp.push(data[i].managementip);
			temp.push(data[i].powercycleip);
			temp.push(data[i].powercycleport);
			temp.push(data[i].teamname);
			temp.push(data[i].projectname);
			// temp.push(data[i].status);
			temp.push(data[i].serialnumber);
			temp.push(data[i].mac);
			temp.push(data[i].tg);
		}
		ans.push(temp);
	}
	// console.log(ans, "answer array", valid);
	if(valid){
		for(let i=0;i<ans.length;i++){
			let tempQuery= `select * from devices where rack='${ans[i][0]}' and unit='${ans[i][1]}' and devicename='${ans[i][2]}'`;
			// let values=ans[i];
			db.query(tempQuery,(err, results)=> {
				if(err){
				res.status(663).json({
					message: 'wrong file chosen'
				})
				return;
			}
				// console.log(results);
				if(results.length==0){
				let qrr = `INSERT INTO devices (rack, unit, devicename, consoleip, consoleport, managementip, powercycleip, powercycleport, teamname, projectname, serialnumber, mac, tg) VALUES (?)`;
				let values = ans[i];
		
				db.query(qrr, [values], (err, results)=> {
				if(err){
					res.status(663).json({
						message: 'wrong file chosen'
					})
					return ;
				}
				
				res.send({
					message: 'data updated successfully'
			
						
				})
				
			})
		}
		
		})
		}
	}
	else{
		res.status(663).json({
			message: 'wrong file chosen'
		})
		return;
	}
		
		
	
 
	
})


app.put('/devices/:url/:ids/:news/:update', (req, res)=> {
	
	let ISToffSet = 330; //IST is 5:30; i.e. 60*5+30 = 330 in minutes 
	let offset= ISToffSet*60*1000;
	let date=new Date();
	let currentTime=new Date(date.getTime()+offset);
   
	
	let time=currentTime.toISOString().substring(0,16);
	

	let status = 'Unreserved';
	let currentStatus= 'Reserved';
	let qrr = `update devices set status='${status}'  where status='${currentStatus}' and endtime<='${time}'`
	
	db.query(qrr, (err, results)=> {
		// console.log(results);
	if(err){
		console.log(err);
	}
	
	res.send({
		message: 'data updated successfully'

			
	})
	
})
})

// app.put('/devices/:device/:update/:information', (req, res)=> {
	
// 	let name = req.body.name;
// 	let status = req.body.status;
// 	let uId= req.params.device;
// 	let userId = req.body.id;
// 	let starttime= req.body.starttime;
// 	let endtime= req.body.endtime;
// 	let qrr = `update devices set username='${name}',  time='${starttime}', endtime='${endtime}', status ='${status}', userid='${userId}' where id='${uId}'`;
// 	db.query(qrr, (err, results)=> {
		
// 	if(err){
// 		console.log(err);
// 	}
	
// 	res.send({
// 		message: 'data updated in devices'

			
// 	})
	
// })
// })



app.put('/userdeviceinfo/:user/:device', (req, res)=> {
	

	let name = req.body.name;
	
	let teamname= req.body.teamname;
	let deviceId= req.params.device;
	let userId= req.params.user;
	let time = req.body.starttime;
	let endTime= req.body.endtime;
	let timeid= req.body.timeid;

	let qrr = `insert into userdeviceinfo (name, team, deviceid, userid, time, endtime, timeid) VALUES ('${name}','${teamname}', '${deviceId}', '${userId}', '${time}', '${endTime}', '${timeid}')`;
	// console.log("harah");
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	
	res.send({
		message: 'data updated userdeviceinfo'

			
	})
	
})
})









app.put('/userdeviceinfo/:userdeviceinfoid', (req, res)=> {
	
	
	let currentTime= req.body.Time;
	let udId = req.params.userdeviceinfoid;
	let status = req.body.status;
	let qrr = `update userdeviceinfo set endtime='${currentTime}' ,status = '${status}' where id='${udId}'`;

	// console.log("harah");
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	
	res.send({
		message: 'data updated userdeviceinfo wrt time status'

			
	})
	
})
})
app.put('/userdeviceinfo/:userdeviceinfoid/:name/:time', (req, res)=> {
	
	
	let currentTime= req.body.Time;
	let udId = req.params.userdeviceinfoid;
	let status = req.body.status;
	let ISToffSet = 330; //IST is 5:30; i.e. 60*5+30 = 330 in minutes 
	let offset= ISToffSet*60*1000;
	let date=new Date();
	let Curtime=new Date(date.getTime()+offset);
   
	
	let time=Curtime.toISOString().substring(0,16);
	// let date = new Date();

	let name= req.params.name;
	let qrr = `update userdeviceinfo INNER JOIN topology on topology.deviceid= userdeviceinfo.deviceid set endtime='${time}' ,status = '${status}' where topology.topologyname='${name}' and userdeviceinfo.time LIKE '${currentTime}'`;

	// console.log("harah");
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	
	res.send({
		message: 'data updated userdeviceinfo wrt time status'

			
	})
	
})
})
app.put('/topology', (req, res)=> {
	
	
	let devices=req.body.devices;
	let name= req.body.name;
	let teamname= req.body.teamname;
	let type=req.body.type;
	let qrr = `select * from topology where topologyname = '${name}'`;

	// console.log("harah");
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		res.status(663).json({
			message: 'Topology name already present :('
		})
		return;

	}
	else{
		let data= [];
		for(let i=0;i<devices.length;i++){
			let temp = [];
			temp.push(name);
			temp.push(devices[i]);
			temp.push(teamname);
			temp.push(type);
			data.push(temp);

		}
		let query= `INSERT INTO topology (topologyname, deviceid, teamname, type) VALUES ?`
		let values= data;
		db.query(query, [values], (err, results)=>{
			res.send({
				message:'Added '
					
			})
		})
		
	}
	
})
})



app.put('/users', async (req, res)=> {
	
	let fullName = req.body.fullname;
	let password = req.body.password;
	let team = req.body.teamname;
	let accesslevel = req.body.accesslevel;
	const hashedPassword = await bcrypt.hash(password, 12);

	let tempQuery=`select * from users where name='${fullName}'`
	db.query(tempQuery, (err, results)=> {
		if(results.length>0){
			res.send({
				message: 'username already exists'
			})
		}
		if(results.length==0){
		let qrr = `INSERT INTO users (name, password, teamname, accesslevel) VALUES ('${fullName}', '${hashedPassword}', '${team}', '${accesslevel}')`;
		db.query(qrr,(err, results)=> {
			if(err){
				if(err){
					res.status(663).json({
						message: 'check your excel file'
					})
					return;
				}
			}
			
			res.send({
				message: 'user added successfully'
		
					
			})
			
		})

		}
		
		
	})


	
})



app.put('/cart/:id/:updateUserdeviceinfoStatus/:update', (req, res)=> {
	data = []
	let updateDeviceData= req.body;
	for(let i=0;i<updateDeviceData.readUserValue.length;i++){
	
		let temp = []
		temp.push(updateDeviceData.name);
		temp.push(updateDeviceData.teamname);
		temp.push(updateDeviceData.readUserValue[i].deviceid);
		temp.push(updateDeviceData.UId);
		temp.push(updateDeviceData.starttime);
		temp.push(updateDeviceData.endtime);
		temp.push(updateDeviceData.timeid);
		data.push(temp);

		
	}
	
	
	let qrr = `insert into userdeviceinfo  (name, team, deviceid, userid, time, endtime, timeid) VALUES ?`;
	// console.log("harah"); 
	let values= data;
	db.query(qrr, [values],(err, results)=> {
	if(err){
		console.log(err);
	}
	
	res.send({
		message: 'data updated userdeviceinfo',
		data:results

			
	})
	
})
})


app.put('/cart/:id/:updateDevicesStatus',  (req, res)=> {
	let name = req.body.name;
	let status = req.body.status;
	let uId= req.params.id;
	let starttime= req.body.starttime;
	let endtime= req.body.deviceFormValue.endtime;
	let unreserve= 'Unreserved';
	// console.log("jshduhd")
	let qrr = ` devices INNER JOIN cart ON devices.id=cart.deviceid set devices.username='${name}',  devices.time=update'${starttime}', devices.endtime='${endtime}', devices.status ='${status}', devices.userid='${uId}' where cart.userid='${uId}' and devices.status='${unreserve}'`;
	db.query(qrr, (err, results)=> {
		
	if(err){
		console.log(err);
	}
	
	res.send({
		message: 'data updated in devices',
		data:results

			
	})
	
})
})


app.put('/users/:uploadData', async (req, res)=> {
	
	let data = req.body;
	// console.log(data);
	let ans = [];
	let valid = true;
	for(let i=0;i<data.length;i++){
		let temp = [];
		if(data[i].name!=undefined){
		temp.push(data[i].name);
		}
		else{
			valid=false;
		}
		if(data[i].password!=undefined){
			const hashedPassword = await bcrypt.hash(data[i].password, 12);
			temp.push(hashedPassword);
			}
			else{
				valid=false;
			}
		if(data[i].teamname!=undefined){
				temp.push(data[i].teamname);
				}
				else{
					valid=false;
				}
		if(data[i].accesslevel!=undefined){
					temp.push(data[i].accesslevel);
					}
					else{
						valid=false;
					}
		
		
		ans.push(temp);
	
	}
	
	// console.log(ans);
	// console.log(data[0].length,  valid);
    if(valid){

   for(let i=0;i<ans.length;i++){
	let tempQuery= `select * from users where name='${ans[i][0]}'`
	db.query(tempQuery,(err, results)=> {
		
		if(results.length==0){
			let qrr = `INSERT INTO users (name, password, teamname, accesslevel) VALUES (?)`;
	let values = ans[i];
	db.query(qrr, [values],(err, results)=> {
	
		
	
	res.send({
		message: 'data updated successfully'

			
	})
	
})
}
	})
	
	
}
	}
	else{
		res.status(663).json({
			message: 'check your excel file'
		})
		return;
	}
})


// delete data

app.delete('/cart/:id/:userid', (req, res)=> {
	let uId= req.params.id;
	
	let qrr = `delete from cart where id='${uId}'`;

	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	// console.log("ububeubu")
	res.send({
		message: 'data deleted successfully',
		data:results
			
			
	});

	
	
});
});

app.delete('/userdeviceinfo/:name/delete', (req, res)=> {
	let topologyName= req.params.name;
	
	let qrr = `delete userdeviceinfo from userdeviceinfo INNER JOIN topology ON topology.deviceid=userdeviceinfo.deviceid where topology.topologyname='${topologyName}'`;

	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	// console.log("ububeubu")
	res.send({
		message: 'data deleted successfully',
		data:results
			
			
	});

	
	
});
});
app.delete('/topology/:name', (req, res)=> {
	let name= req.params.name;
	
	let qrr = `delete from topology where topologyname='${name}'`;

	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	// console.log("ububeubu")
	res.send({
		message: 'data deleted successfully from topology',
		data:results
			
			
	});


	
	
});
});

app.delete('/userdeviceinfo/:userdeviceinfoid', (req, res)=> {
	let udId= req.params.userdeviceinfoid;
	// console.log('yes'+ udId)
	let qrr = `delete from userdeviceinfo where id='${udId}'`;

	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	// console.log("ububeubu")
	res.send({
		message: 'data deleted successfully',
		data:results
			
			
	});

	
	
});
});



app.delete('/userdeviceinfo/:userdeviceinfoid/delete/data/userdevice', (req, res)=> {
	let udId= req.params.userdeviceinfoid;
	// console.log('yes'+ udId)
	let qrr = `delete from userdeviceinfo where deviceid='${udId}'`;

	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	// console.log("ububeubu")
	res.send({
		message: 'data deleted successfully',
		data:results
			
			
	});

	
	
});
});


app.delete('/userdeviceinfo/:userdeviceinfoid/:name/:time', (req, res)=> {
	let udId= req.params.userdeviceinfoid;
	let name = req.params.name;
	let time= req.params.time;
	let updatedTime=time.replaceAll('_', '-'); 
	let qrr = `delete userdeviceinfo from userdeviceinfo JOIN topology ON  userdeviceinfo.deviceid=topology.deviceid where topology.topologyname='${name}' and userdeviceinfo.time LIKE '${updatedTime}'`;
	// console.log(updatedTime, "updated time");

	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	// console.log("ububeubu")
	res.send({
		message: 'data deleted successfully',
		data:results
			
			
	});

	
	
});
});

app.get('/project/:id', (req, res)=>{
	// console.log('Get all users');
	let qrId = req.params.id;
	let qrr = `select * from project INNER JOIN users ON project.teamname=users.teamname where users.id=${qrId} `;
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		res.send({
			message: 'all users data',
			data:results
		});
	};
	});
	
});




app.put('/topology/:id/:name', (req, res)=>{
	// console.log('Get all users');
	let uId = req.params.id;
	let name= req.params.name;
	let datetime= req.body.datetime+'_____';
	let status = 'deleted';
	let qrr = `select * from userdeviceinfo INNER JOIN topology ON userdeviceinfo.deviceid=topology.deviceid where topologyname='${name}' and time LIKE '${datetime}' and userdeviceinfo.status != '${status}'`;
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		res.send({
			message: 'all avaible time slots for topology',
			data:results
		});
	};
	});
	
});

app.get('/topology/:teamname', (req, res)=>{
	// console.log('Get all users');
	let teamName = req.params.teamname;
	// console.log(teamName);
	let qrr = `select * from topology INNER JOIN devices ON topology.teamname=devices.teamname where topology.deviceid=devices.id and topology.teamname='${teamName}'`;
	db.query(qrr, (err,results)=> {
	
		if(err){
			res.status(663).json({
				message: 'upload valid excel file'
			})
			return;
		}
		
	// console.log(results);
	if(results.length>0){
		res.send({
			message: 'all users data',
			data:results
		});
	};
	});
	
});


app.get('/userdeviceinfo/:deviceid/:dateTime', (req, res)=>{
	// console.log('Get all users');
	let dId = req.params.deviceid;
	let currentDate= req.params.dateTime;
	let date= currentDate.substring(0, 11)+"_____";
	let qrr = `select * from userdeviceinfo where deviceid=${dId} and time LIKE '${date}' `;
	// console.log(dId);
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		// console.log(results);
		res.send({
			message: 'date and time information',
			data:results
		});
	};
	});
	
});

app.post('/userdeviceinfo', (req, res)=>{
	let name= req.body.name;
	let startDate= req.body.sDate+'T00:00';
	let endDate= req.body.eDate+'T24:00';
	// console.log(dId);
	let deleted= 'deleted';

	let qrr= `select userdeviceinfo.timeid, userdeviceinfo.time, userdeviceinfo.endtime from userdeviceinfo INNER JOIN topology ON topology.deviceid= userdeviceinfo.deviceid where topology.topologyname= '${name}' and time>='${startDate}' and endtime <= '${endDate}' and userdeviceinfo.status!='${deleted}' `
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		// console.log(results);
		res.send({
			message: 'date and time information',
			data:results
		});
	};
	});

})
app.post('/userdeviceinfo/data', (req, res)=>{
	let dId= req.body.deviceId;
	let startDate= req.body.sDate+'T00:00';
	let endDate= req.body.eDate+'T24:00';
	// console.log(dId);
	let deleted= 'deleted';

	let qrr= `select timeid,time, endtime from userdeviceinfo  where deviceid='${dId}' and time>='${startDate}' and endtime <= '${endDate}' and status!='${deleted}' `
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		// console.log(results);
		res.send({
			message: 'date and time information',
			data:results
		});
	};
	});

})
app.get('/userdeviceinfo/:name', (req, res)=>{
	// console.log('Get all users');
	let name= req.params.name;
	let ISToffSet = 330; //IST is 5:30; i.e. 60*5+30 = 330 in minutes 
    let offset= ISToffSet*60*1000;
    let date=new Date();
    let startTime=new Date(date.getTime()+offset);
   
    // startTime=startTime.toISOString().substring(0,16);
   
    startTime.setDate(startTime.getDate() + 1);
    let extendedTime= startTime.toISOString().substring(0,11)+ '00:00';
	
	let qrr = `select DISTINCT userdeviceinfo.time,  userdeviceinfo.endtime, userdeviceinfo.name from userdeviceinfo INNER JOIN topology ON userdeviceinfo.deviceid= topology.deviceid where topology.topologyname='${name}' and  userdeviceinfo.time>= '${extendedTime}'  `;
	// console.log(dId);
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		// console.log(results);
		res.send({
			message: 'date and time information',
			data:results
		});
	};
	});
	
});



app.get('/userdeviceinfo/:userid/:dateTime/history', (req, res)=>{
	// console.log('Get all users');
	let uId = req.params.userid;
	let currentDate= req.params.dateTime.replaceAll('_', '-');
	let deleted= 'deleted';
	let date= currentDate.substring(0, 13)+':'+ currentDate.substring(14, 16);
	// console.log(date, uId);
	let qrr = `select userdeviceinfo.id, userdeviceinfo.time, userdeviceinfo.endtime, devices.teamname,  devices.devicename from userdeviceinfo INNER JOIN devices ON userdeviceinfo.deviceid=devices.id where userdeviceinfo.userid='${uId}' and (userdeviceinfo.endtime<='${date}' or userdeviceinfo.status='${deleted}') and devices.id NOT in (select deviceid from topology)`;
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		// console.log(results);
		res.send({
			message: 'date and time information',
			data:results
		});
	};
	});
	
});

app.get('/topology/:userid/:dateTime/history/device', (req, res)=>{
	// console.log('Get all users');
	let uId = req.params.userid;
	let currentDate= req.params.dateTime.replaceAll('_', '-');
	let deleted= 'deleted';
	let date= currentDate.substring(0, 13)+':'+ currentDate.substring(14, 16);
	// console.log(date, uId);
	let qrr = `select  DISTINCT userdeviceinfo.time, userdeviceinfo.id, userdeviceinfo.endtime, userdeviceinfo.team,  topology.topologyname from userdeviceinfo INNER JOIN topology ON userdeviceinfo.deviceid=topology.deviceid where userdeviceinfo.userid='${uId}' and  (userdeviceinfo.endtime<='${date}' or userdeviceinfo.status='${deleted}') group by topology.topologyname , userdeviceinfo.time`;

	// let qrr = `select userdeviceinfo.id, userdeviceinfo.time, userdeviceinfo.endtime, devices.teamname,  devices.devicename from userdeviceinfo INNER JOIN devices ON userdeviceinfo.deviceid=devices.id where userdeviceinfo.userid='${uId}' and (userdeviceinfo.endtime<='${date}' or userdeviceinfo.status='${deleted}') and devices.id NOT in (select deviceid from topology)`;
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		// console.log(results);
		res.send({
			message: 'date and time information',
			data:results
		});
	};
	});
	
});


app.get('/userdeviceinfo/:userid/:dateTime/current/device/status', (req, res)=>{
	// console.log('Get all users');
	let uId = req.params.userid;
	let currentDate= req.params.dateTime.replaceAll('_', '-');
	let status= 'deleted';
	let date= currentDate.substring(0, 13)+':'+ currentDate.substring(14, 16);;
	// console.log(date);
	let deleted= 'deleted';
	let qrr = `select   userdeviceinfo.time, userdeviceinfo.id, userdeviceinfo.endtime, userdeviceinfo.team,  devices.devicename from userdeviceinfo INNER JOIN devices ON userdeviceinfo.deviceid=devices.id  where userdeviceinfo.userid='${uId}' and  userdeviceinfo.endtime>='${date}' and userdeviceinfo.time<='${date}' and userdeviceinfo.status!='${deleted}' and devices.id NOT In (select deviceid from topology);`;

	// let qrr = `select  userdeviceinfo.id, devices.rack, devices.unit, userdeviceinfo.time, userdeviceinfo.endtime, devices.teamname, devices.projectname, devices.devicename from userdeviceinfo INNER JOIN devices ON userdeviceinfo.deviceid=devices.id where userdeviceinfo.userid='${uId}' and userdeviceinfo.endtime>='${date}' and userdeviceinfo.time<='${date}' and userdeviceinfo.status!='${status}'`;
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		// console.log(results);
		res.send({
			message: 'date and time information',
			data:results
		});
	};
	});
	
});

app.get('/userdeviceinfo/:userid/:dateTime/schedule/device', (req, res)=>{
	// console.log('Get all users');
	let uId = req.params.userid;
	let currentDate= req.params.dateTime.replaceAll('_', '-');
	let date= currentDate.substring(0, 13)+':'+ currentDate.substring(14, 16);
	// console.log(date);
	let qrr = `select  DISTINCT userdeviceinfo.time, userdeviceinfo.id, userdeviceinfo.endtime, userdeviceinfo.team,  topology.topologyname from userdeviceinfo INNER JOIN topology ON userdeviceinfo.deviceid=topology.deviceid where userdeviceinfo.userid='${uId}' and userdeviceinfo.time>'${date}' group by topology.topologyname , userdeviceinfo.time`;
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		// console.log(results);
		res.send({
			message: 'date and time information',
			data:results
		});
	};
	});
	
});

app.get('/topology/:userid/:dateTime/current', (req, res)=>{
	// console.log('Get all users');
	let uId = req.params.userid;
	let deleted= 'deleted';
	let currentDate= req.params.dateTime.replaceAll('_', '-');
	let date= currentDate.substring(0, 13)+':'+ currentDate.substring(14, 16);
	// console.log(date);
	let qrr = `select  DISTINCT userdeviceinfo.time, userdeviceinfo.id, userdeviceinfo.endtime, userdeviceinfo.team,  topology.topologyname from userdeviceinfo INNER JOIN topology ON userdeviceinfo.deviceid=topology.deviceid where userdeviceinfo.userid='${uId}' and userdeviceinfo.endtime>='${date}' and userdeviceinfo.time<='${date}' and userdeviceinfo.status != '${deleted}' group by topology.topologyname , userdeviceinfo.time`;
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		// console.log(results);
		res.send({
			message: 'date and time information',
			data:results
		});
	};
	});
	
});


app.get('/topology/:userid/:dateTime', (req, res)=>{
	// console.log('Get all users');
	let uId = req.params.userid;
	let currentDate= req.params.dateTime.replaceAll('_', '-');
	let date= currentDate.substring(0, 13)+':'+ currentDate.substring(14, 16);
	// console.log(date);
	let qrr = `select   userdeviceinfo.time, userdeviceinfo.id, userdeviceinfo.endtime, userdeviceinfo.team,  devices.devicename from userdeviceinfo INNER JOIN devices ON userdeviceinfo.deviceid=devices.id  where userdeviceinfo.userid='${uId}' and userdeviceinfo.time>'${date}' and devices.id NOT In (select deviceid from topology);`;
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		// console.log(results);
		res.send({
			message: 'date and time information',
			data:results
		});
	};
	});
	
});

app.get('/project/:id/:access', (req, res)=>{
	// console.log('Get all users');
	let qrId = req.params.id;
	let qrr = `select * from project `;
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		res.send({
			message: 'all users data',
			data:results
		});
	};
	});
	
});
app.get('/project/:name/type/project', (req, res)=>{
	// console.log('Get all users');
	// let qrId = req.params.id;
	let name= req.params.name;
	let qrr = `select type from project where projectname = '${name}' `;
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		res.send({
			message: 'all users data',
			data:results
		});
	};
	});
	
});
app.get('/devices', (req, res)=>{
	// console.log('Get all users');
	let qrr = `SELECT * FROM devices`;
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		res.send({
			message: 'all users data',
			data:results
		});
	};
	});
	
});

app.get('/devices/:id/:name', (req, res)=>{
	// console.log('Get all users');
	let names= req.params.name;

	let qrr = `SELECT * FROM devices where projectname=${names}`;
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		res.send({
			message: 'all users data',
			data:results
		});
	};
	});
	
});

// get data by id
app.get('/userdeviceinfo/:id', (req, res)=>{
	// console.log(req.params.id);
	let qrId= req.params.id;
	
	let qrr = `SELECT userdeviceinfo.id, devices.unit, devices.rack, devices.devicename, userdeviceinfo.time, userdeviceinfo.endtime, devices.teamname,devices.projectname FROM userdeviceinfo INNER JOIN devices ON userdeviceinfo.deviceid=devices.id where userdeviceinfo.userid='${qrId}' ORDER BY userdeviceinfo.id desc`;
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		res.send({
			message: 'all data by id',
			data:results
		});
	}
	else{
		message: 'data not found'
	}

	});
	
});



app.get('/devices/:name', (req, res)=>{
	console.log(req.params.name);
	let qrId= req.params.name;
	
	let qrr = `SELECT * FROM devices `;
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err);
	}
	if(results.length>0){
		res.send({
			message: 'all data by name',
			data:results
		});
	}
	else{
		message: 'data not found'
	}

	});
	
});

// get data by name
app.get('/userdeviceinfo', (req, res)=>{
	// console.log(req.params.id);
	// let qrName= req.params.name;
	// console.log(qrName);
	//SELECT Orders.OrderID, Customers.CustomerName, Orders.OrderDate FROM Orders INNER JOIN Customers ON Orders.CustomerID=Customers.CustomerID;
	let qrr = `select *  FROM userdeviceinfo INNER JOIN devices on devices.id=userdeviceinfo.deviceid`;
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err)
	}
	if(results.length>0){
		res.send({
			message: 'all data by name',
			data:results
		});
	}
	else{
		message: 'data not found'
	}

	});
	
});


app.get('/devices/:id/get/information', (req, res)=>{
	// console.log(req.params.id);
	// let qrName= req.params.name;
	// console.log(qrName);\
	let id= req.params.id;
	let deleted='deleted';
	//SELECT Orders.OrderID, Customers.CustomerName, Orders.OrderDate FROM Orders INNER JOIN Customers ON Orders.CustomerID=Customers.CustomerID;
	let qrr = `select time, endtime, name  FROM userdeviceinfo where deviceid='${id}' and status!='${deleted}'`;
	db.query(qrr, (err, results)=> {
	if(err){
		console.log(err)
	}
	if(results.length>0){
		res.send({
			message: 'all data by name',
			data:results
		});
	}
	else{
		message: 'data not found'
	}

	});
	
});


app.listen(3000, ()=>{
    // nodemon 127.0.0.1
    console.log('port 3000');
})

