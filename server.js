const { error } = require('console');
const net = require('net')

const targetIp = "10.10.10.78"
const targetPort = 4001

const client = new net.Socket();

try {
    
    client.connect(targetPort, targetIp, () => {
        console.log(`Connected to server at ${targetIp}:${targetPort}`);
        
        // Send a message every second
        setInterval(() => {
            const hexMessage = '012002203131803720363534203138202033310329'; // "Hello server" in hex
            const messageBuffer = Buffer.from(hexMessage, 'hex'); // Convert hex to buffer
            client.write(messageBuffer)
            console.log(`Sending message: ${hexMessage}`);
        }, 5000);
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