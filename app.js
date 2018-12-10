var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var indexRoutes = require('./routes/index');
var ibmIoTRoutes = require('./routes/ibm-iot');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/ibmiotf/dist')));

/* === VCAP_SERVICES - START === */
/* === Grab VCAP_SERVICES information either from Bluemix, or from a local file called VCAP_SERVICES.json === */
function configureCredentials(vcap) {
	config = vcap;

	var iotService = config['iotf-service'];
  credentials = iotService[0].credentials;
  credentials["serviceName"] = iotService[0].name;
}

try {
	var VCAP_SERVICES = require(__dirname + '/VCAP_SERVICES.json');

  if (process.env.VCAP_SERVICES) {
		configureCredentials(JSON.parse(process.env.VCAP_SERVICES));
	} else {
		configureCredentials(VCAP_SERVICES);
	}
} catch (error) {
	console.log(error);
	console.log("Fallback to Bluemix VCAP_SERVICES");

	if (process.env.VCAP_SERVICES) {
		configureCredentials(JSON.parse(process.env.VCAP_SERVICES));
	} else {
		console.log("ERROR: IoT Service was not bound!");
	}
}

var basicConfig = {
	org: credentials.org,
	apiKey: credentials.apiKey,
	apiToken: credentials.apiToken,
  serviceName: credentials.serviceName
};

var options = {
  host: basicConfig.org + '.internetofthings.ibmcloud.com',
  port: 443,
  headers: {
    'Content-Type': 'application/json'
  },
  auth: basicConfig.apiKey + ':' + basicConfig.apiToken
};

app.set('iot_credentials', basicConfig);
app.set('iot_options', options);
/* === VCAP_SERVICES - END === */

app.use('/', indexRoutes);
app.use('/api', ibmIoTRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
