**__Skill Level__**: Beginner
<br>**__N.B__**: All services used in this repo are Lite plans.

# [Connecting a conveyor belt device](https://developer.ibm.com/code/patterns/build-monitor-iot-driven-conveyor-belt/)  
Create a basic conveyor belt with an IoT device that sends monitoring data to Watson IoT Platform on IBM Cloud

## Overview and goal

This guide steps you through the process of connecting devices to  Watson IoT Platform, monitoring and acting on device data

We set up a connected conveyor belt and use it to send IoT data to Watson IoT Platform. Depending on your skill level, you can follow one or both of the following paths to set up your conveyor belt:
* Path A  
This path gets you started quickly by installing a conveyor belt simulator app on IBM Cloud. The app self-registers a device with Watson IoT Platform and automatically sends well-formatted data to the platform. Instructions for this path are in [Step 2A - Use the simulator sample app from GitHub](#step-2a---deploy-the-sample-conveyor-belt-web-application).  
* Path B  
This path is technically more challenging and requires additional hardware, Python programming skills, and manual registration of your device with Watson IoT Platform. Instructions for this path are in  [Step 2B - Build a physical conveyor belt with a Raspberry Pi and an electric motor](#step-2b---build-a-raspberry-pi-powered-conveyor-belt).

As part of this guide, you will:
1. Create and deploy a Watson IoT Platform organization by using Cloud Foundry CLI.
2. Build and deploy a sample conveyor belt device.
3. Connect the simulated conveyor belt device to Watson IoT Platform.
4. Monitor and visualize device data by using the Watson IoT Platform dashboards.

> To get started with Watson IoT Platform using a different IoT device, see the [Getting started tutorial](https://console.bluemix.net/docs/services/IoT/getting-started.html#getting-started-with-iotp).

![Architecture Diagram](images/architecture.png)

1. Create & Deploy Watson IoT Platform on IBM Cloud
2. Build  & Deploy Simulated Sample Conveyor
3. Connect the conveyor belt to the Watson IoT Platform
4. Monitor & Visualize device data on the Watson IoT dashboard.

Click here to view the [IBM Pattern](https://developer.ibm.com/code/patterns/build-monitor-iot-driven-conveyor-belt/) for this project.
## Prerequisites

You will need the following accounts and tools:
* [IBM Cloud account](https://console.ng.bluemix.net/registration/)
* [Bluemix CLI](https://console.bluemix.net/docs/cli/reference/bluemix_cli/index.html#getting-started)
* Optional: [Git](https://git-scm.com/downloads)
If you choose to use Git to download the code samples you must also have a [GitHub.com account](https://github.com). You can also download the code as a compressed file without a GitHub.com account.
* Optional: A mobile phone on which to run the *Conveyor belt* sample web application to send accelerometer data.

## Deploy to IBM Cloud
If you want to deploy directly to IBM Cloud, click on 'Deploy to IBM Cloud' button below to create a IBM Cloud DevOps service toolchain and pipeline for deploying basic conveyor belt with an IoT device that sends monitoring data to Watson IoT Platform on IBM Cloud, else jump to [Steps](#steps)

[![Deploy to IBM Cloud](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/IBM/guide-conveyor-simulator.git&branch=master)

After deploying the application, please continue with [Step 3 - See raw data in Watson IoT Platform](#step-3---see-raw-data-in-watson-iot-platform).

## Steps
1. [Deploy Watson IoT Platform](#step-1----deploy-watson-iot-platform)
2. Do one of the following 2 steps:

   2a. [Deploy the sample conveyor belt web application](#step-2a---deploy-the-sample-conveyor-belt-web-application)

   2b. [Build a Raspberry Pi-powered conveyor belt](#step-2b---build-a-raspberry-pi-powered-conveyor-belt)

3. [See raw data in Watson IoT Platform](#step-3---see-raw-data-in-watson-iot-platform)
4. [Visualize live data in Watson IoT Platform](#step-4---visualize-live-data-in-watson-iot-platform)

## Step 1 -  Deploy Watson IoT Platform

> Watson IoT Platform provides powerful application access to IoT devices and data to help you rapidly compose analytics applications, visualization dashboards, and mobile IoT apps. The steps that follow will deploy an instance of the Watson IoT Platform service with the name `iotp-for-conveyor` in your IBM Cloud environment. If you already have a service instance running, you can use that instance with the guide and skip this first step. Just make sure that you use the correct service name and IBM Cloud space when you proceed through the guides.

1. From the command line, set your API endpoint by running the bx api command.   
Replace the `API-ENDPOINT` value with the API endpoint for your region.
```
bx api <API-ENDPOINT>
```
Example: `bx api https://api.ng.bluemix.net`
<table>
<tr>
<th>Region</th>
<th>API Endpoint</th>
</tr>
<tr>
<td>US South</td>
<td>https://api.ng.bluemix.net</td>
</tr>
<tr>
<td>United Kingdom</td>
<td>https://api.eu-gb.bluemix.net</td>
</tr>
</table>

2. Log into your IBM Cloud account.
```
bx login
```
If prompted, select the organization and space where you want to deploy Watson IoT Platform and the sample app. **Note** example a) org: lbenn@us.ibm.com  b) space = dev

3. Deploy the Watson IoT Platform service to IBM Cloud.
```    
bx create-service iotf-service iotf-service-free YOUR_IOT_PLATFORM_NAME
```

For YOUR_IOT_PLATFORM_NAME, use *iotp-for-conveyor*.  
Example: `bx create-service iotf-service iotf-service-free iotp-for-conveyor`

Next, you will create a sample conveyor belt device. Choose which path you want to take:
 - Path A: [Step 2A - Use the simulator sample app from GitHub](#step-2a---deploy-the-sample-conveyor-belt-web-application).  
 - Path B: [Step 2B - Build a physical conveyor belt with a Raspberry Pi and an electric motor](#step-2b---build-a-raspberry-pi-powered-conveyor-belt).  

## Step 2A - Deploy the sample conveyor belt web application  

The sample app lets you simulate a IBM Cloud connected industrial conveyor belt. You can start and stop the belt and adjust the speed of the belt. Every change to the belt is sent to IBM Cloud in the form of an MQTT message that is displayed in the app. You can monitor the belt behavior by using the default dashboard cards. The sample app is built using the Node.js client libraries at: [https://github.com/ibm-watson-iot/iot-nodejs](https://github.com/ibm-watson-iot/iot-nodejs)

![Conveyor belt app](images/app_conveyor_belt.png)

* From the *guide-conveyor-simulator* directory, push your app to IBM Cloud and give it a new name by replacing YOUR_APP_NAME in the bx push command. Use the --no-start option because you will start the app in the next stage after it is bound to Watson IoT Platform.
> Note: Deploying your application can take a few minutes.

```bash
bx app push YOUR_APP_NAME --no-start
```  

* In the *guide-conveyor-simulator* directory, bind your app to your instance of the Watson IoT Platform by using the names that you provided for each.
```bash
bx bind-service YOUR_APP_NAME iotp-for-conveyor
```
>For more information about binding applications, see [Connecting applications](https://console.bluemix.net/docs/services/IoT/platform_authorization.html#bluemix-binding).

* Start your application for the binding to take effect.
```bash
bx start YOUR_APP_NAME
```
At this stage, your sample web application is deployed on IBM Cloud. When deployment is completed, a message is displayed to indicate that your app is running.
Example:
```bash
name:              YOUR_APP_NAME
requested state:   started
instances:         1/1
usage:             64M x 1 instances
routes:            YOUR_APP_NAM.mybluemix.net
last uploaded:     Tue 09 May 09:29:49 EDT 2017
stack:             cflinuxfs2
buildpack:         SDK for Node.js(TM) (ibm-node.js-4.8.0,
                   buildpack-v3.11-20170303-1144)
start command:     ./vendor/initial_startup.rb

     state     since                  cpu    memory         disk            details
#0   running   2017-05-09T13:35:08Z   0.0%   19.6M of 64M   66.2M of 256M
```


> Troubleshoot errors in the deployment process by using the `bx app logs YOUR_APP_NAME --recent` command.

* In a browser, access the app.  
Open the following URL: `https://YOUR_APP_NAME.mybluemix.net`    
Example: `https://conveyorbelt.mybluemix.net/`.

* Enter a device ID and token for your device.  
The sample app automatically registers a device of type `iot-conveyor-belt` with the device ID (e.g. my-first-device) and token that you provided. For more information about registering devices, see [Connecting devices](https://console.bluemix.net/docs/services/IoT/iotplatform_task.html#iotplatform_subtask1).
4. Continue with [Step 3 - See raw data in Watson IoT Platform](#step-3---see-raw-data-in-watson-iot-platform).

## Step 2B - Build a Raspberry Pi-powered conveyor belt

The Raspberry Pi solution is built using the Python client libraries at: [https://github.com/ibm-watson-iot/iot-python](https://github.com/ibm-watson-iot/iot-python)

### Schematic diagram for the circuit

![Circuit Diagram](images/raspi_circuit.png)

### Required connections

The following connections between the Raspberry Pi and the L298N Dual H Bridge Motor Driver Board are required. Connect:

- Pin 2 of the Raspberry Pi to +5v on the L298N board
- Pin 6 of the Raspberry Pi to GND on the L298N board
- Pin 13 of the Raspberry Pi to the IN1 of the L298N board
- Pin 15 of the Raspberry Pi to the IN2 of the L298N board
- +9v of the battery to +12v on the L298N board
- -9v of the battery to GND on the L298N board
- The +ve node of the motor to OUT1 on the L298N board
- The -ve node of the motor to OUT2 on the L298N board

### Hardware requirements

1. [Raspberry Pi(2/3)](https://www.raspberrypi.org/) with Raspbian Jessie (8.x).
2. [L298N Dual H Bridge Motor Driver Board](https://tronixlabs.com.au/robotics/motor-controllers/l298n-dual-motor-controller-module-2a-australia/)
3. 9V DC motor
4. 9V Battery

### Raspberry Pi software requirements
- Python 2.7.9 and above, installed with Raspbian Jessie (8.x).
- [Watson IoT Python library](https://github.com/ibm-watson-iot/iot-python)
- Optional: Git.  
If you do not have git installed on your Raspberry Pi, you can install it by using the following command:  
```bash
$ sudo apt-get install git
```

### Detailed steps

1. Open the terminal or SSH to your Raspberry Pi.
2. Use your favorite git tool to clone the following repository to your Raspberry Pi:  
https://github.com/ibm-watson-iot/guide-conveyor-rasp-pi
In Git Shell, use the following command:
```bash
$ git clone https://github.com/ibm-watson-iot/guide-conveyor-rasp-pi
```
3. Register the device with Watson IoT Platform.
For more information about registering devices, see [Connecting devices](https://console.bluemix.net/docs/services/IoT/iotplatform_task.html#iotplatform_subtask1).
     * In the IBM console, click **Launch** other Watson IoT Platform service details page.The Watson IoT Platform web console opens in a new browser tab at the following URL:
         ```
         https://ORG_ID.internetofthings.ibmcloud.com/dashboard/#/overview
         ```
         Where ORG_ID is the unique six character ID of [your Watson IoT Platform organization](https://console.bluemix.net/docs/services/IoT/iotplatform_overview.html#organizations).
     * In the Overview dashboard, from the menu pane, select **Devices** and then click **Add Device**.
     * Create a device type for the device that you are adding.
         - Click **Create device type**.
         - Enter the device type name `iotp-for-conveyor` and a description for the device type.  
    >**Note:** You can enter any device type name, but the other guides in the series expect devices that use the device type `iotp-for-conveyor`. If you use a different device type, you must modify the settings in the other guides accordingly.

         - Optional: Enter device type attributes and metadata.
     * Click **Next** to begin the process of adding your device with the selected device type.
     * Enter a device ID, for example, `conveyor_belt`.
     * Click **Next** to complete the process.
     * Provide an authentication token or accept an automatically generated token.
     * Verify the summary information is correct and then click **Add** to add the connection.
     * In the device information page, copy and save the following details:
         * Organization ID
         * Device Type
         * Device ID
         * Authentication Method
         * Authentication Token. You'll need the values for the Organization ID, Device Type, Device ID, and Authentication Token to configure your device to connect to Watson IoT Platform.

4. Navigate to the *guide-conveyor-rasp-pi* root of the cloned repository.
5. Make the shell script executable by using this command `sudo chmod +x setup.sh`
6. Run the *setup.sh* file and enter the details that you copied from the device information page when prompted.
```bash  
./setup.sh
```  

7. Run the deviceClient program.  
When you run the program, your Raspberry Pi starts the motor and it will run for up to 2 minutes based on parameter settings.
```bash
python deviceClient.py -t 2
```

While the motor is running, the program publishes events of event type `sensorData` that have the following sample payload structure:  
```
{
"d": {
  "elapsed": 1,
  "running": true,
  "temperature": 35.00,
  "ay": "0.00",
  "rpm": "0.6"
}
}
```

8. Continue with [ Step 3 - See raw data in Watson IoT Platform](#step-3---see-raw-data-in-Watson-iot-platform).

## Step 3 - See raw data in Watson IoT Platform

1. Verify that the device is registered with Watson IoT Platform.
    * Login to your IBM dashboard at:  [https://bluemix.net](https://bluemix.net/)
    * From [your list of services](https://bluemix.net/dashboard/services), click the *iotp-for-conveyor* Watson IoT Platform} service.
    * Click *Launch* to open the Watson IoT Platform dashboard in a new browser tab.  
        You can bookmark the URL for easy access later.   
        Example: `https://*iot-org-id*.internetofthings.ibmcloud.com`.
    * From the menu, select **Devices** and verify that your new device is displayed.

2. View raw data
    * From the menu, select **Boards**.
    * Select the **Device Centric Analytics** board.
    * Locate the **Devices I Care About** card and select your device.  
        The device name is displayed in the Device Properties card.

3. Send sensor data to the platform.   
The device sends data to Watson IoT Platform when sensor readings change. You can simulate this data sending by stopping, starting or changing the speed of the conveyor belt.
>**Path A:** If you are accessing the app on a mobile browser, try shaking your smart phone to trigger accelerometer data for the conveyor belt.

4. Verify that the updated device data points that correspond to the published message are displayed in the Device Properties card.  
Message example A:
  ```
{
    "d": {
        "id": "belt1",
        "ts": 1494341288662,
        "ay": "0.00",
        "running": true,
        "rpm": "0.6"
    }
}
  ```
Message example B:
  ```
{
    "d": {
    "elapsed": 1,
    "running": true,
    "temperature": 35.00,
    "ay": "0.00",
    "rpm": "0.6"
  }
}
  ```

## Step 4 - Visualize live data in Watson IoT Platform

To create a dashboard card to see live conveyor belt data:
1. On the same Device Centric Analytics board, click **Add New Card** and then select **Line Chart**.
2. For card source data, click **Cards**.   
A list of card names is displayed.
3. Select **Devices I Care About** and then click **Next**.
4. Click **Connect new data set** and enter the following values for the data set parameters:
      - Event: sensorData
      - Property: d.rpm
      - Name: Belt RPM
      - Type: Float
      - Unit: rpm
5. Click **Next**.
6. On the card preview page, select **L**, and then click **Next**.
7. On the card information page, change the name of the title to `Belt data` and then click **Submit**.
8. Change the speed of your belt to see live data in your new card.
9. Optional: Add a second data set to add acceleration data for the belt.  


If you use your phone to connect to the sample app, you can shake the phone to send acceleration data for the belt.
 1. Click the menu icon on your card and select to edit the card.
 2. For card source data, select **Cards**.   
 3. Select **Devices I Care About** and click **Next**.
 4. Click **Connect new data set** and enter the following values:
    - Event: sensorData
    - Property: d.ay
    - Name: Accel. Y
    - Type: Float
    - Unit: gs
 5. Click **Next**.
 6. Path A only: Shake your phone to see the live accelerometer data in your new card.
For more information about creating boards and cards, see [Visualizing real-time data by using boards and cards](https://console.bluemix.net/docs/services/IoT/data_visualization.html#boards_and_cards).

## Useful links

* [IBM Cloud](https://bluemix.net/)  
* [IBM Cloud Documentation](https://www.ng.bluemix.net/docs/)  
* [IBM Cloud Developers Community](http://developer.ibm.com/bluemix)  
* [IBM Watson Internet of Things](http://www.ibm.com/internet-of-things/)  
* [IBM Watson IoT Platform](http://www.ibm.com/internet-of-things/iot-solutions/watson-iot-platform/)   
* [IBM Watson IoT Platform Developers Community](https://developer.ibm.com/iotplatform/)


## <h2>Learn more</h2>
<ul>
<li><strong>Artificial Intelligence Code Patterns</strong>: Enjoyed this Code Pattern? Check out our other <a href="https://developer.ibm.com/code/technologies/artificial-intelligence/" rel="nofollow">AI Code Patterns</a>.</li>
<li><strong>Data Analytics Code Patterns</strong>: Enjoyed this Code Pattern? Check out our other <a href="https://developer.ibm.com/code/technologies/data-science/" rel="nofollow">Data Analytics Code Patterns</a></li>
<li><strong>AI and Data Code Pattern Playlist</strong>: Bookmark our <a href="https://www.youtube.com/playlist?list=PLzUbsvIyrNfknNewObx5N7uGZ5FKH0Fde" rel="nofollow">playlist</a> with all of our Code Pattern videos</li>
<li><strong>With Watson</strong>: Want to take your Watson app to the next level? Looking to utilize Watson Brand assets? <a href="https://www.ibm.com/watson/with-watson/" rel="nofollow">Join the With Watson program</a> to leverage exclusive brand, marketing, and tech resources to amplify and accelerate your Watson embedded commercial solution.</li>
<li><strong>Watson Studios</strong>: Master the art of data science with IBM's <a href="https://datascience.ibm.com/" rel="nofollow">Watson Studios</a></li>
<li><strong>PowerAI</strong>: Get started or get scaling, faster, with a software distribution for machine learning running on the Enterprise Platform for AI: <a href="https://www.ibm.com/ms-en/marketplace/deep-learning-platform" rel="nofollow">IBM Power Systems</a></li>
<li><strong>Spark on IBM Cloud</strong>: Need a Spark cluster? Create up to 30 Spark executors on IBM Cloud with our <a href="https://console.bluemix.net/catalog/services/apache-spark" rel="nofollow">Spark service</a></li>
<li><strong>Kubernetes on IBM Cloud</strong>: Deliver your apps with the combined the power of <a href="https://www.ibm.com/cloud-computing/bluemix/containers" rel="nofollow">Kubernetes and Docker on IBM Cloud</a></li>
</ul>


## License
This code pattern is licensed under the Apache Software License, Version 2.  Separate third party code objects invoked within this code pattern are licensed by their respective providers pursuant to their own separate licenses. Contributions are subject to the [Developer Certificate of Origin, Version 1.1 (DCO)](https://developercertificate.org/) and the [Apache Software License, Version 2](http://www.apache.org/licenses/LICENSE-2.0.txt).

[Apache Software License (ASL) FAQ](http://www.apache.org/foundation/license-faq.html#WhatDoesItMEAN)