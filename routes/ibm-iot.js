var express = require('express')
  , router  = express.Router()
  , https   = require('https');

router.post('/registerDevice', function(req, res) {
  var basicConfig = req.app.get('iot_credentials');
  var options = req.app.get('iot_options');

  options['method'] = 'POST';
  options['path'] = 'api/v0002/device/types';

	var deviceId = null, typeId = null, password = null;
	if (req.body.deviceId) { deviceId = req.body.deviceId; }
	if (req.body.typeId) { typeId = req.body.typeId; }
	if (req.body.password) { password = req.body.password; }

	var deviceTypeDetails = {
		id: typeId
	};
	console.log(deviceTypeDetails);

	var type_req = https.request(options, function(type_res) {
		var str = '';

		type_res.on('data', function(chunk) {
			str += chunk;
		});

		type_res.on('end', function() {
			console.log("createDeviceType end: ", str.toString());
      console.log(basicConfig);

			var dev_options = {
				host: basicConfig.org + '.internetofthings.ibmcloud.com',
				port: 443,
				headers: {
				  'Content-Type': 'application/json'
				},
				auth: basicConfig.apiKey + ':' + basicConfig.apiToken,
				method: 'POST',
				path: 'api/v0002/device/types/'+typeId+'/devices'
			}

			var deviceDetails = {
				deviceId: deviceId,
				authToken: password
			};
			console.log(deviceDetails);

			var dev_req = https.request(dev_options, function(dev_res) {
				var str = '';
				dev_res.on('data', function(chunk) {
					str += chunk;
				});
				dev_res.on('end', function() {
					console.log("createDevice end: ", str.toString());
					res.send({ result: "Success!" });
				});
			}).on('error', function(e) { console.log("ERROR", e); });
			dev_req.write(JSON.stringify(deviceDetails));
			dev_req.end();
		});
	}).on('error', function(e) { console.log("ERROR", e); });

	type_req.write(JSON.stringify(deviceTypeDetails));
	type_req.end();
});

module.exports = router;