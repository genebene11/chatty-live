// Using Node.js `require()`
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const port = 5000;
const hostname = 'localhost';

// Define the MongoDB connection string
const mongoDBURL = "mongodb+srv://genesis:sKoNMtSq9dh9GH6M@chatty.6vtgxge.mongodb.net/chatty?retryWrites=true&w=majority";

mongoose.connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log("Connected to MongoDB");
});

// Create a schema for chat messages
const chatMessageSchema = new mongoose.Schema({
    time: Number,
    alias: String,
    message: String
});

// Create a model based on the schema
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

app.use(express.static('public_html'));
app.use(express.json());

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public_html/index.html');
});

// Serve the CSS file
app.get('/public_html/style.css', (req, res) => {
    res.sendFile(__dirname + '/public_html/style.css');
});

// Serve the Client JS file
app.get('/public_html/client.js', (req, res) => {
    res.sendFile(__dirname + '/public_html/client.js');
});

// POST route for submitting a new chat message
app.post('/chats/post', (req, res) => {
    const { alias, message } = req.body;

    if (alias && message) {
        const newChatMessage = new ChatMessage({
            time: Date.now(),
            alias: alias,
            message: message
        });

        newChatMessage.save()
            .then(() => {
                res.status(200).send("Message saved successfully");
            })
            .catch((err) => {
                res.status(500).send("Error saving the message");
            });
    } else {
        res.status(400).send("Unsuccessful request");
    }
});

// GET route to retrieve chat messages
app.get('/chats', (req, res) => {
    ChatMessage.find({})
        .exec()  // Add .exec() to return a Promise
        .then((messages) => {
            const sortedMessages = messages.sort((a, b) => a.time - b.time);
            res.json(sortedMessages);
        })
        .catch((err) => {
            res.status(500).send("Error retrieving messages");
        });
});

// Delete previous messages from last server run
async function clearChatMessages() {
    try {
        await ChatMessage.deleteMany({});
        console.log("Chat messages cleared on server startup.");
    } catch (err) {
        console.error("Error clearing chat messages:", err);
    }
}

app.listen(port, async () => {
    console.log(`Server is running at http://${hostname}:${port}`);
    
    // Clear chat messages on server startup
    await clearChatMessages();
});

