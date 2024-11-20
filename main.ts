//% color=#126180 icon="\uf0fb" block="Tello Drone Control"
//% groups="['ESP8266', 'Tello']"

namespace TelloControl {
    // Initialize the variables
    let telloIP = "192.168.10.1";
    let commandPort = 8889;


    // Function to read and display response on the micro:bit. Users can use this for debugging connection with the Tello drone
    //% block="Read Response" 
    //% group="Tello"
    export function readResponse(): void {
        let response = serial.readString();
        if (response.includes("OK")) {
            basic.showString("Connected");
        } else {
            basic.showString("Failed");
            basic.showString(response); // Display the actual error
        }
    }

    // Assuming you have already intialised the ESP8266, connected to Tello WiFi (2), 
    // have set up UDP connection (3), and initialisd the Tello into SDK mode (4)
    function sendCommandToTello(command: string): void {
        sendAT(`AT+CIPSEND=${command.length}`, 500);  // Send command length and command
        serial.writeString(command + "\r\n"); // Send the actual command
        basic.pause(500);
        readResponse();
    }

    function sendAT(command: string, wait: number = 0) {
        serial.writeString(`${command}\u000D\u000A`);
        basic.pause(wait);
    }


    // Function to initialize ESP8266 and redirect serial communication (1)
    //% block="Initialize ESP8266 with TX %tx| RX %rx"
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



    //% block="Flip"
    //% group="Tello"
    export function flip(): void {
        sendCommandToTello("flip b");
    }

    //% block="Emergency Stop"
    //% group="Tello"
    export function emergency(): void {
        sendCommandToTello("emergency");
    }

    //% block="Move right"
    //% group="Tello"
    export function right(): void {
        sendCommandToTello("right");
    }

    //% block="Move Left"
    //% group="Tello"
    export function left(): void {
        sendCommandToTello("left");
    }

    //% block="Move Back"
    //% group="Tello"
    export function back(): void {
        sendCommandToTello("back");
    }

    //% block="Move Forward"
    //% group="Tello"
    export function forward(): void {
        sendCommandToTello("forward");
    }

    //% block="Land"
    //% group="Tello"
    export function land(): void {
        sendCommandToTello("land");
    }

    //% block="Takeoff"
    //% group="Tello"
    export function takeOff(): void {
        sendCommandToTello("takeoff");
    }


    // Seting up UDP connection (3) and initialise the Tello into SDK mode (4)
    //% group="Tello"
    //% block="Initialise ESP and Tello connection"
    export function setupUDPConnection(): void {
        sendAT(`AT+CIPSTART="UDP","${telloIP}",${commandPort}`, 500);
        basic.pause(500); // Allow some time for connection setup
        sendCommandToTello("command");
        basic.pause(500); // Allow some time for connection setup
    }

    // Function to connect to Tello Wi-Fi (2)
    //% group="Tello"
    //% block="connect to Tello Wi-Fi SSID %ssid"
    export function connectToWiFi(ssid: string): void {
        sendAT(`AT+CWJAP="${ssid}",""`, 5000); // No password is required
        basic.pause(500); // Allow some time for connection setup
        readResponse();
    }
}