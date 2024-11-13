//% color=#126180 icon="\uf0fb" block="Tello Drone Control"
//% groups="['ESP8266', 'Tello']"

namespace TelloControl {
    // Initialize the variables
    let telloIP = "192.168.10.1";
    let commandPort = 8889;
    const threshold = 20; // Threshold to control sensitivity

    // Function to read and display response on the micro:bit
    function readResponse(): void {
        let response = serial.readString();
        if (response.includes("OK")) {
            basic.showString("Connected");
        } else {
            basic.showString("Failed");
            basic.showString(response); // Display the actual error
        }
    }

    function sendCommandToTello(command: string): void {
        // Assuming you're already connected to Tello WiFi, have set up UDP connection and initialisd the Tello into SDK mode
        sendAT(`AT+CIPSEND=${command.length}`, 500);  // Send command length and command
        serial.writeString(command + "\r\n"); // Send the actual command
        basic.pause(500);
        readResponse(); // Display Tello's response
    }

    function sendAT(command: string, wait: number = 0) {
        serial.writeString(`${command}\u000D\u000A`);
        basic.pause(wait);
    }

    // Function to initialize ESP8266 and redirect serial communication
    //% block="initialize ESP8266 with TX %tx| RX %rx"
    //% group="ESP8266"
    //% tx.defl=SerialPin.P8
    //% rx.defl=SerialPin.P12
    export function initESP8266(tx: SerialPin, rx: SerialPin): void {
        serial.redirect(tx, rx, BaudRate.BaudRate115200); // Redirect TX and RX
        basic.pause(100);
        serial.setTxBufferSize(128);
        serial.setRxBufferSize(128);

        sendAT("AT+RST", 2000); // Reset the ESP8266
        sendAT("AT+CWMODE=1", 500); // Set ESP8266 to Station Mode (STA mode)
    }

    
    // Function to interpret accelerometer readings and control Tello
    //% block="Use Microbit as a controller"
    //% group="Tello"
    export function controlTelloWithAccelerometer(): void {
        let x = input.acceleration(Dimension.X);
        let y = input.acceleration(Dimension.Y);
        let z = input.acceleration(Dimension.Z);
// Determine the absolute strongest tilt axis first 
// so that it is only focusig on one movement at a time

        // Forward and backward control (Y-axis tilt strongest, pitch)
        if (Math.abs(y) > Math.abs(x) && Math.abs(y) > Math.abs(z)) {   
            if (y > threshold) {
                while (y > threshold) { // Continuously move forward while tilted forward
                    sendCommandToTello("forward 20"); // Move forward
                    basic.pause(500); // Delay to prevent flooding commands
                    y = input.acceleration(Dimension.Y); // Update Y-axis to check strongest tilt again
                }
            } else if (y < -threshold) { // Continuously move backward while tilted backward
                while (y < -threshold) {
                    sendCommandToTello("back 20"); // Move backward
                    basic.pause(500); 
                    y = input.acceleration(Dimension.Y); 
                }
            }
        } 
        // Left and right control (X-axis tilt strongest, roll)
        else if (Math.abs(x) > Math.abs(y) && Math.abs(x) > Math.abs(z)) {
            while (x > threshold) { 
                sendCommandToTello("right 20"); // Move right
                basic.pause(500);
                x = input.acceleration(Dimension.X); // Update X-axis 
            }
        } else if (x < -threshold) {
            while (x < -threshold) { 
                sendCommandToTello("left 20"); // Move left
                basic.pause(500);
                x = input.acceleration(Dimension.X); // Update X-axis
            }
        }
        // Up and down control (Z-axis tilt strongest, yaw)
        else if (Math.abs(z) > Math.abs(x) && Math.abs(z) > Math.abs(y)) { 
            while (z < 800) { 
                sendCommandToTello("up 20");    // Move up
                basic.pause(500);
                z = input.acceleration(Dimension.Z); // Update Z-axis
            }
        } else if (z > 1200) {
            while (z > 1200) { 
                sendCommandToTello("down 20");  // Move down
                basic.pause(500);
                z = input.acceleration(Dimension.Z); // Update Z-axis 
            }
        }
    }

    //% block="land"
    //% group="Tello"
    export function land(): void {
        sendCommandToTello("land");
    }

    //% block="takeoff"
    //% group="Tello"
    export function takeOff(): void {
        sendCommandToTello("takeoff");
    }

    //% block="Wi-Fi connected"
    //% group="ESP8266"
    export function isWiFiConnected(): boolean {
        sendAT("AT+CWJAP?"); // Checks the current Wi-Fi status
        basic.pause(500); // Give time to get the response

        let response = serial.readString(); // Reads response from ESP8266

        if (response.includes("No AP")) {
            return false; // Not connected
        } else if (response.includes("OK") || response.includes("Connected")) {
            return true; // Connected
        } else {
            return false; // In case of other unexpected responses
        }
    }

    // Seting up UDP connection (2) and initialise the Tello into SDK mode (3)
    //% group="Tello"
    //% block="Initialise ESP and Tello connection"
    export function setupUDPConnection(): void {
        sendAT(`AT+CIPSTART="UDP","${telloIP}",${commandPort}`, 500);
        basic.pause(500); // Allow some time for connection setup
        sendCommandToTello("command");
        basic.pause(500); // Allow some time for connection setup
    }

    // Function to connect to Tello Wi-Fi (1)
    //% group="Tello"
    //% block="connect to Tello Wi-Fi SSID %ssid"
    export function connectToWiFi(ssid: string): void {
        sendAT(`AT+CWJAP="${ssid}",""`, 5000); // No password is required
        readResponse(); // Display response on micro:bit
    }
}