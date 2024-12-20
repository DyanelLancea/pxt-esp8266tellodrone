namespace TelloControl {
    // Initialize the variables
    let telloIP = "192.168.10.1";
    let commandPort = 8889;

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
        //basic.pause(100);
        sendAT("AT+CIPSTO:<20000>", 2000); // Reset the ESP8266
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

        let response2 = serial.readString(); // Reads response from ESP8266

        if (response2.includes("No AP")) {
            return false; // Not connected
        } else if (response2.includes("OK") || response2.includes("Connected")) {
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
