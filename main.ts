//% color=#126180 icon="\uf0fb" block="Tello Drone Control"
//% groups="['ESP8266', 'Tello']"

namespace TelloControl {
    // Initialize the variables
    let telloIP = "192.168.10.1";
    let commandPort = 8889;
    const threshold = 20; // Threshold to control sensitivity
    let wifi_connected: boolean = false

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

    // Assuming you have already intialised the ESP8266, connected to Tello WiFi (2), 
    // have set up UDP connection (3), and initialisd the Tello into SDK mode (4)
    function sendCommandToTello(command: string): void {

        sendAT(`AT+CIPSEND=${command.length}`, 500);  // Send command length and command
        serial.writeString(command + "\r\n"); // Send the actual command
        basic.pause(500);
        readResponse(); // Display Tello's response
    }

    function sendAT(command: string, wait: number = 0) {
        serial.writeString(`${command}\u000D\u000A`);
        basic.pause(wait);
    }


    //Booleon for users to check if the ESP8266 is connect to a WiFi
    //% block="Wifi connected %State" weight=70
    //% group="ESP8266"
    export function wifiState(state: boolean) {
        return wifi_connected === state
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


    // Function to connect to Tello Wi-Fi (2)
    //% group="Tello"
    //% block="connect to Tello Wi-Fi SSID %ssid"
    export function connectToWiFi(ssid: string): void {
        sendAT(`AT+CWJAP="${ssid}",""`, 5000); // No password is required
        readResponse(); // Display response on micro:bit
    }

    //% block="FLip"
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
        sendCommandToTello("right 20");
    }

    //% block="Move Left"
    //% group="Tello"
    export function left(): void {
        sendCommandToTello("left 20");
    }

    //% block="Move Back"
    //% group="Tello"
    export function back(): void {
        sendCommandToTello("back 20");
    }

    //% block="Move Forward"
    //% group="Tello"
    export function forward(): void {
        sendCommandToTello("forward 20");
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

}