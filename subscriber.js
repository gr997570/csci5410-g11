/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
// const subscriptionName = 'YOUR_SUBSCRIPTION_NAME';
const timeout = 60;

// Imports the Google Cloud client library
const {PubSub} = require('@google-cloud/pubsub');

// Creates a client; cache this for further use
const pubSubClient = new PubSub('csci5410-334019');

const subscriptionName = 'projects/csci5410-334019/subscriptions/firstsubscription';

process.env.GOOGLE_APPLICATION_CREDENTIALS="./csci5410-334019-328d5ac58837_pubsub.json"

function listenForMessages(user) {
  // References an existing subscription
  const subscription = pubSubClient.subscription(subscriptionName);

  // Create an event handler to handle messages
  let messageCount = 0;

  let fetchedData = null;

  let fetchedMessages = []
  const messageHandler = message => {
    fetchedData = JSON.parse(message.data)
    if(fetchedData["sender"] == user || fetchedData["receiver"] == user){
      console.log(`Received message ${message.id}:`);
      console.log(`\tData: ${message.data}`);
      console.log(`\tAttributes: ${message.attributes}`);
      messageCount += 1;

      // "Ack" (acknowledge receipt of) the message
      message.ack();

      fetchedMessages.push(fetchedData)
    }
  };

  // Listen for new messages until timeout is hit
  subscription.on('message', messageHandler);

  console.log(messageCount)

  return new Promise(function(resolve){
    setTimeout(() => {
      subscription.removeListener('message', messageHandler);
      console.log(`${messageCount} message(s) received.`);
      resolve(fetchedMessages)
      console.log(fetchedMessages)
    }, timeout * 50);
  });
}

module.exports = {listenForMessages}
