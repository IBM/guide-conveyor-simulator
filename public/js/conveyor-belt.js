// Variables used for the animations
var stop = false;
var animationSpeed = 1.0;
var animatedElements = [];

// IoT Platform & MQTT Related Variables
var deviceInfo = {
    // You can onfigure these to your liking, or automate the generation of them
    deviceId:   "",
    typeId:     "iot-conveyor-belt",
    password:   ""
};

// Mobile Sensor Related Variables
var ax = 0,
	ay = 0,
	az = 0;

var last_sample = {};
var shifted_filter = {};
// High-pass filter to remove gravity offset from the acceleration waveforms

var client;
var iot_host;
var iot_port;
var iot_clientid;
var iot_username;
var iot_password;
var topic = "sensorData";
var iot_service_link;

var isConnected = false;
window.msgCount = 0;

// ********** TABLE OF CONTENTS **********
/*
   1. IoT Platform Device
   2. MQTT
   3. Mobile Sensor Data
   4. Animations/Interactions
*/
// ********** TABLE OF CONTENTS - END ********** //






// ********************************** //
// ***** 1. IoT Platform Device ***** //

// Initialize the application
// Getting the VCAP_SERVICES credentials from the backend
function init() {
    $.ajax({
        url: "/credentials",
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            console.log(response);

            // Set necessary fields for the MQTT Connection to the IoT Platform
            window.iot_host = response.org + ".messaging.internetofthings.ibmcloud.com";
            window.iot_port = 443;
            window.deviceClient = new IBMIoTF.IotfDevice({
                                                        "org":          response.org,
                                                        "id":           deviceInfo.deviceId,
                                                        "type":         deviceInfo.typeId,
                                                        "auth-method":  "token",
                                                        "auth-token":   deviceInfo.password
                                                    });
            registerDevice();
        },
        error: function(xhr, status, error) {
            console.error("Could not fetch organization information.");
        }
    });

    $.ajax({
        url: "/iotServiceLink",
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            iot_service_link = response;
        },
        error: function(xhr, status, error) {
            console.error("Could not fetch organization information.");
        }
    });
}

// Register the device through the backend to the IoT Platform
// (1st. creates device type, then the actual device, all values configured at the top of this file)
function registerDevice() {
    console.log("Attempting to Register the Device");

    // Make an AJAX call to the backend
    $.ajax({
        url: "/api/registerDevice",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(deviceInfo),
        success: function(response) {
            console.log("Attempting connect");

            // After registration is successful, attempt connecting to MQTT
            connectDevice();
        },
        error: function(xhr, status, error) {
            if (xhr.status === 403) {
                // Authentication check succeeded and told us we're invalid
                console.error("Incorrect code!");
            } else {
                // Something else went wrong
                console.error("Failed to authenticate! " + error);
            }
        }
    });
}



// ******************* //
// ***** 2. MQTT ***** //

// Once connected, this functions is called to publish MQTT events to the IoT Platform
function publish(publishFields) {
    console.log(publishFields);

    // We only attempt to publish if we're actually connected, saving CPU and battery
    if (isConnected) {
        // The payload that will be sent (all fields go in here)
        var payload = {
            "d": {
                "id": deviceInfo.deviceId,
                "ts": (new Date()).getTime(),
                "ay": Math.max(ax, ay, az).toFixed(2)
            }
        };

        if (publishFields.running === false) {
            publishFields["rpm"] = 0;
        }

        for (var i = 0; i < Object.keys(publishFields).length; i++) {
            var index = Object.keys(publishFields)[i];
            payload.d[index] = publishFields[index];
        }

        // Publish message
        try {
            window.deviceClient.publish(topic, "json", JSON.stringify(payload));
            window.msgCount += 1;
            
            $("pre code#publishedMessage").html(JSON.stringify(payload, null, "\t"));
            $('pre code#publishedMessage').each(function(i, block) {
                hljs.highlightBlock(block);
            });

            console.log("[%s] Published", new Date().getTime());
        } catch (err) {
            console.error(err);

            // If there is an error, set the "connection" indicator on the screen to "Disconnected"
            isConnected = false;
            changeConnectionStatusImage("images/disconnected.svg");
            document.getElementById("connection").innerHTML = "Disconnected";

            setTimeout(connectDevice(), 1000);
        }
    }
}

// Once MQTT Connects
function onConnectSuccess() {
    // The device connected successfully
    console.log("Connected Successfully!");
    
    if ($("div#publishedMessage.hidden").hasClass("hidden")) $("div#publishedMessage.hidden").removeClass("hidden");

    isConnected = true;
    changeConnectionStatusImage("images/connected.svg");
    document.getElementById("connection").innerHTML = "Connected" +
                        (iot_service_link !== undefined ? (" to <a href='" + iot_service_link.url + "' target='_blank'>" + iot_service_link.serviceName + "</a>") : "");

    var publishFields = {
        running: stop ? false : true,
    };

    if (!stop) publishFields["rpm"] = animationSpeed.toFixed(1);
    publish(publishFields);
}

// Once MQTT Fails
function onConnectFailure(error) {
    console.error(error);

    // The device failed to connect. Let's try again in one second.
    console.log("Could not connect to IBM Watson IoT Platform! Trying again in one second.");

    // Try connecting after 1000 milliseconds
    setTimeout(connectDevice(), 1000);
}


// Connect to MQTT
function connectDevice() {
    $("#deviceId").html(deviceInfo.deviceId);

    // Update connection status on screen to "Connecting"
    changeConnectionStatusImage("images/connecting.svg");
    document.getElementById("connection").innerHTML = "Connecting";
    console.log("Connecting device to IBM Watson IoT Platform...");

    // Initiate the MQTT connection using the password set above in line 8
    try {
        window.deviceClient.connect();
    } catch(e) {
        onConnectFailure(e);
    }

    window.deviceClient.on('connect', onConnectSuccess);
}



// ************************************** //
// ***** 3. Mobile Sensor Data ***** //
function filterOffset(sample, channel) {
    if(sample === null || sample === undefined) return 0;
    if(last_sample[channel] === undefined) last_sample[channel] = sample;
    if(shifted_filter[channel] === undefined) shifted_filter[channel] = 0;
    var shiftedFCL = shifted_filter[channel] + ((sample-last_sample[channel])*256);
    shifted_filter[channel] = shiftedFCL - (shiftedFCL/256);
    last_sample[channel] = sample;
    return ((shifted_filter[channel]+128)/256);
}

window.ondevicemotion = function(event) {
    ax = parseFloat((event.acceleration.x || filterOffset(event.accelerationIncludingGravity.x, "ax") || 0));
    ay = parseFloat((event.acceleration.y || filterOffset(event.accelerationIncludingGravity.y, "ay") || 0));
    az = parseFloat((event.acceleration.z || filterOffset(event.accelerationIncludingGravity.z, "az") || 0));
};

// ************************************** //
// ***** 4. Animations/Interactions ***** //
//***** to handle multiple clicks*****//
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

function dropbox(index) {
    var firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

    if (!stop) {
        var tween = Tweene.line($("g#box-" + index))
            .from({translateY: -252})
            //.to({translateY: 0}, 400, 100, "easeInQuad")
            .to({translateY: 0,easing:"easeInQuad"} )
            .to({translateX: 237.5}, 1000, '++=0', 'linear')
            .to({translateX: 575}, 1000, '++=0', 'linear', function() {
                if (index === "1") {
                    dropbox("2");
                } else if (index === "2") {
                    dropbox("1");
                }
            })
            .to({translateX: 630, translateY: 15, rotateZ: firefox ? 0 : 30}, 300, '++=0', 'linear')
            .to({translateX: 650, translateY: 30, rotateZ: firefox ? 0 : 40}, 100, '++=0', 'linear')
            .to({translateX: 715, translateY: 150}, 300, '++=0', 'linear')
            .to({translateY: 400, rotateZ: firefox ? 0 : 100}, 300, '++=0', 'linear')
            .to({ translateY: -252, translateX: 0, rotateZ: 0 }, 0, '++=0', 'linear', function() {
                animatedElements.splice(animatedElements.indexOf(tween), 1);
            })
            .speed(animationSpeed)
            .loops(0)
            .play();

        animatedElements.push(tween);
    }
}

function rotator() {
    // if (animatedElements.indexOf("line#rotator") === -1) animatedElements.push("line#rotator");

    $("line#rotator")
        .delay(0)
        .velocity({ rotateZ: 360 }, {
            duration: 2000,
            easing: "linear",
            loop: true
        });
}

// Update connection status image on screen
function changeConnectionStatusImage(image) {
    document.getElementById("connectionImage").src = image;
}

$(document).ready(function() {
    $("#form-login").submit(function( event ) {
        event.preventDefault();

        var usernameEntered = $("input#username").val();
        var passwordEntered = $("input#password").val();

        function showErrorOnRegister(message) {
            if ($("form#form-login p.message").hasClass("hidden")) {
                $("form#form-login p.message").removeClass("hidden");
            }

            $("form#form-login p.message b").html(message);
        }

        if (usernameEntered.length === 0 && passwordEntered.length === 0) {
            showErrorOnRegister("a Device ID & Password");
        } else if (usernameEntered.length === 0) {
            showErrorOnRegister("a Device ID");
        } else if (passwordEntered.length === 0) {
            showErrorOnRegister("a Password");
        } else {
            if (!$("form#form-login p.message").hasClass("hidden")) {
                $("form#form-login p.message").addClass("hidden");
            }

            deviceInfo.deviceId = $("input#username").val();
            deviceInfo.password = $("input#password").val();

            $("div#modal-login").fadeOut( "fast", function() {
                init();
            });
        }
    });

    rotator();
    dropbox("1");

    $("a.btn.start").addClass("disabled");

    function toggleAnimations(pause) {
        stop = pause ? true : false;

        for (var i = 0; i < animatedElements.length; i++) {
            if (pause) animatedElements[i].pause();
            else animatedElements[i].resume();
        }
    }

    $("a.stop").click(function(event) {
        event.preventDefault();
        console.log("STOP Clicked");

        toggleAnimations(true);

        if ($("a.btn.start").hasClass("disabled")) {
            $("a.btn.start").removeClass("disabled");
        }

        if (!$("a.btn.stop").hasClass("disabled")) {
            $("a.btn.stop").addClass("disabled");
        }

        if (!$("a.speed-down").hasClass("disabled")) {
            $("a.speed-down").addClass("disabled");
        }

        if (!$("a.speed-up").hasClass("disabled")) {
            $("a.speed-up").addClass("disabled");
        }

        if (isConnected) {
            publish({
                    "running": false
            });
        }
    });

    $("a.start").click(function(event) {
        event.preventDefault();
        console.log("START Clicked");

        toggleAnimations(false);

        if ($("a.btn.stop").hasClass("disabled")) {
            $("a.btn.stop").removeClass("disabled");
        }

        if (!$("a.btn.start").hasClass("disabled")) {
            $("a.btn.start").addClass("disabled");
        }

        if ($("a.speed-down").hasClass("disabled")) {
            $("a.speed-down").removeClass("disabled");
        }

        if ($("a.speed-up").hasClass("disabled")) {
            $("a.speed-up").removeClass("disabled");
        }

        publish({
            "running": true,
            "rpm": animationSpeed.toFixed(1)
        });
    });

    function round(value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }

    function updateSpeedOnScreen() {
        $("span#speed-value").html(round(animationSpeed, 1) + "x");
    }

    var adjustSpeed =debounce(function adjustSpeed() {
      console.log("After debounce");
        for (var i = 0; i < animatedElements.length; i++) {
            animatedElements[i].speed(animationSpeed);
        }
    },1000,false);

    $("a.speed-down").click(function(event) {
        event.preventDefault();
        console.log("SPEED DOWN Clicked");

        animationSpeed -= 0.1;
        adjustSpeed();

        if (isConnected) {
            publish({
                "running": true,
                "rpm": animationSpeed.toFixed(1)
            });
        }

        //rotator();
        updateSpeedOnScreen();

        console.log(animationSpeed);

        if (animationSpeed.toFixed(1) === "0.1") {
            $("a.speed-down").addClass("disabled");
        }
    });

    $("a.speed-up").click(function(event) {
        event.preventDefault();
        console.log("SPEED UP Clicked");

        animationSpeed += 0.1;
        adjustSpeed();

        if (isConnected) {
            publish({
                "rpm": animationSpeed.toFixed(1),
                "running": true
            });
        }

      //  rotator();
        updateSpeedOnScreen();

        console.log(animationSpeed);
    });
});
