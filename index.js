const puppeteer = require('puppeteer');
const twilio = require('twilio');

const accountSid = '';
const authToken = '';
const twilioNumber = ''; // Your Twilio phone number
const yourPhoneNumber = ''; // Your phone number
const client = twilio(accountSid, authToken);

async function checkTicketAvailability(movieURL) {
  let ticketsAvailable = false;

  while (!ticketsAvailable) {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: false });
    const page = await browser.newPage();

    try {
      await page.goto(movieURL);

      const bookTicketsButton = await page.$('span[style="font-weight: 500; font-size: 16px; color: rgb(255, 255, 255);"]');

      if (bookTicketsButton) {
        console.log('Tickets are available! Sending notification...');
        await sendTwilioNotification('Tickets are available for the movie!');
        ticketsAvailable = true; // Stop the loop
      } else {
        console.log('Tickets are not available yet. Retrying in 1 minute...');
        await page.close();
        await new Promise(resolve => setTimeout(resolve, 10000)); // 1 minute delay
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      await browser.close();
    }
  }
}

async function sendTwilioNotification(message) {
  try {
    await client.messages.create({
      body: message,
      from: twilioNumber,
      to: yourPhoneNumber
    });
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification: ', error);
  }
}

// Example usage
const movieURL = ''; //Movie Link
checkTicketAvailability(movieURL);
