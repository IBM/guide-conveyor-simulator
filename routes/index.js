var express = require('express');
var router  = express.Router();
var https   = require('https');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/credentials', function(req, res) {
  var basicConfig = req.app.get('iot_credentials');

	res.json({
		org: basicConfig.org,
		serviceName: basicConfig.serviceName
	});
});

router.get('/iotServiceLink', function(req, res) {
  var basicConfig = req.app.get('iot_credentials');

  console.log("BASIC CONFIG", basicConfig);

	var options = {
		host: basicConfig.org + '.internetofthings.ibmcloud.com',
		port: 443,
		headers: {
		  'Content-Type': 'application/json'
		},
		auth: basicConfig.apiKey + ':' + basicConfig.apiToken,
		method: 'GET',
		path: 'api/v0002/'
	};

	var org_req = https.request(options, function(org_res) {
		var str = '';
		org_res.on('data', function(chunk) {
			str += chunk;
		});
		org_res.on('end', function() {
			try {
        console.log("STRING", str);
				var org = JSON.parse(str);
        
				var url = "https://bluemix.net/services/" + org.bluemix.serviceInstanceGuid + "?ace_config=%7B%22orgGuid%22%3A%22" + org.bluemix.organizationGuid + "%22%2C%22spaceGuid%22%3A%22" + org.bluemix.spaceGuid;
				
        res.json({ url: url, serviceName: basicConfig.serviceName });
			} catch (e) {
        console.log("Something went wrong...", e);
        console.log("RESPONSE", str);

        res.send(500);
      }

			console.log("iotServiceLink end: ", str.toString());
		});
	}).on('error', function(e) { console.log("ERROR", e); });
	org_req.end();
});

module.exports = router;