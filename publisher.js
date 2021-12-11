/**
 * TODO(developer): Uncomment these variables before running the sample.
 */

// Imports the Google Cloud client library
const {PubSub} = require('@google-cloud/pubsub');

const topicName = 'projects/csci5410-334019/topics/SafeDeposit';

process.env.GOOGLE_APPLICATION_CREDENTIALS="./csci5410-334019-328d5ac58837_pubsub.json"

//const data = JSON.stringify({foo: 'bar'});

async function publishMessageWithCustomAttributes(data, subscriptionName) {

  //const data = JSON.stringify({foo: 'bar'});
  console.log("Received data: "+data);

  // Creates a client; cache this for further use
  const pubSubClient = new PubSub('csci5410-334019');

  // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
  const dataBuffer = Buffer.from(data);

  // Add two custom attributes, origin and username, to the message
  const customAttributes = {
    origin: 'nodejs-sample',
    username: 'gcp',
  };

  const messageId = await pubSubClient
    .topic(topicName)
    .publish(dataBuffer, customAttributes);
  console.log(`Message ${messageId} published.`);

  const [subscriptions] = await pubSubClient.topic(topicName).getSubscriptions();

  if (subscriptions.includes(subscriptionName)){
    const [subscription] = await pubSubClient.topic(topicName).subscription(subscriptionName);
  }
  else {
    const [subscription] = await pubSubClient.topic(topicName).createSubscription(subscriptionName);
  }

  // Receive callbacks for new messages on the subscription
  subscription.on('message', message => {
    console.log('Received message:', message.data.toString());
    process.exit(0);
  });

  // Receive callbacks for errors on the subscription
  subscription.on('error', error => {
    console.error('Received error:', error);
    process.exit(1);
  });
}

module.exports = {publishMessageWithCustomAttributes}