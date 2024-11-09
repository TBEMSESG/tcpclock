const { error } = require('console');
const net = require('net')

const targetIp = "10.10.10.78"
const targetPort = 4001

const startTimeMin = 6
const startTimeSec = 54 

let currentMin, currentSec, currentMin10HEX, currentMin1HEX, currentSec10HEX, currentSec1HEX

const updateIntervall = 1000 //in Milliseconds 

//Open Socket and Start Countdown

const client = new net.Socket();

try {
    
    client.connect(targetPort, targetIp, () => {
        console.log(`Connected to server at ${targetIp}:${targetPort}`);
       
        
        // Send a message every second
        setInterval(() => {



            const hexMessage = createHEX(); 

            const messageBuffer = Buffer.from(hexMessage, 'hex'); // Convert hex to buffer
            client.write(messageBuffer)
            console.log(`Sending message: ${hexMessage}`);

            

        }, updateIntervall);
    });

} catch (error) {
    console.log("could not connect" + error)
}

client.on('data', (data) => {
    console.log(`Received from server: ${data.toString()}`);
});

client.on('error', (data) => {
    console.log(`Received Error message ${error}`)
})

const createHEX = () => {

let SOH = '0120'
let STX = '0220'
let byte1 = '31'
let byte2 = '31'
let byte3 = '80' // Status Word, could be even more elaborated
let byte4 = '37' // 7 for IceHockey
let byte5 =  '20' // Minutes *10 (0)
let byte6 = currentMin1HEX || '36' // Minutes *1 (6)
let byte7 = currentSec10HEX || '35' // Seconds *10 (5)
let byte8 = currentSec1HEX || '34' // Seconds *1 (4)
let byte9 = '20' // Score Home *100 (0)
let byte10 = '31' // Score Home *10 (1)
let byte11 = '38' // Score Home *1 (8)
let byte12 = '20' // Score Guests *100 (0)
let byte13 = '20' // Score Guests *10 (0)
let byte14 = '33' // Score Guests *1 (3)
let byte15 = '31' // Period (1)
let ETX = '03'

let tempHEX = SOH + STX + byte1 + byte2 + byte3 + byte4 + byte5 + byte6 + byte7 + byte8 + byte9 + byte10 + byte11 + byte12 + byte13 + byte14 + byte15 + ETX 


const lrc = calculateLRC(tempHEX)

let finalHEX = tempHEX + lrc

console.log(finalHEX)

return finalHEX
}


const calculateLRC = (data) => {
    let lrc = 0;

    // Start XOR from the Address (2nd byte) up to and including ETX
    for (let i = 2; i < data.length; i += 2) {
        // Convert each 2-character hex byte to an integer
        const byteValue = parseInt(data.substr(i, 2), 16);
        lrc ^= byteValue; // XOR with accumulated LRC value
    }

    // Apply the mask to keep LRC in the 7-bit ASCII range
    lrc &= 0x7F;

    // Ensure LRC is a printable ASCII character by adding 0x20 if less than 0x20
    if (lrc < 0x20) {
        lrc += 0x20;
    }

    // Convert to a 2-character hex string for final LRC value
    return lrc.toString(16).padStart(2, '0').toUpperCase();
    
};

// function parseMessage(data) {
//     if (data[0] !== 0x01 || data[data.length - 2] !== 0x03) {
//         throw new Error('Invalid message format');
//     }

//     var message = data.slice(4, data.length - 2);
//     var calculatedLRC = calculateLRC(data);
//     var receivedLRC = data[data.length - 1];

//     if (calculatedLRC !== receivedLRC) {
//         throw new Error('LRC mismatch. Message may be corrupted');
//     }

//       return {
//           time: String.fromCharCode(message[4])+String.fromCharCode(message[5])+':'+ String.fromCharCode(message[6])+String.fromCharCode(message[7]),
//           scoreHome: parseInt(String.fromCharCode(message[8]) + String.fromCharCode(message[9]) + String.fromCharCode(message[10])),
//           scoreGuest: parseInt(String.fromCharCode(message[11]) + String.fromCharCode(message[12]) + String.fromCharCode(message[13])),
//           period: parseInt(String.fromCharCode(message[14]))
//       };
//   }

  const countDown = () => {

    console.log(`Countdown Starting from ${startTimeMin}:${startTimeSec} ...` )

        currentMin = startTimeMin
        currentSec = startTimeSec
    

            setInterval(() => {

                console.log(`Current time: ${currentMin}:${currentSec}`)
                
                
                currentMin10HEX = (Math.floor(currentMin / 10) + 0x30).toString(16); // Tens place of minutes in ASCII hex
                currentMin1HEX = ((currentMin % 10) + 0x30).toString(16); // Ones place of minutes in ASCII hex
                currentSec10HEX = (Math.floor(currentSec / 10) + 0x30).toString(16); // Tens place of seconds in ASCII hex
                currentSec1HEX = ((currentSec % 10) + 0x30).toString(16); // Ones place of seconds in ASCII hex
                                
                console.log( currentMin, currentMin10HEX, currentMin1HEX, currentSec10HEX, currentSec1HEX)
                    
                // DEBUGGING ONLY 
                    let testHEX= createHEX()
                    console.log(testHEX)
                //
               
                if (currentSec > 0) currentSec--
                if (currentSec == 0 && currentMin > 0) {
                    currentMin--
                    currentSec = 59
                }
                if (currentMin == 0 && currentSec == 0) {
                    currentMin = startTimeMin
                    currentSec = startTimeSec
                    console.log("Countdown reached 0. Resetting to start time.");

                
                }
            }, 1000)
  }

countDown()
