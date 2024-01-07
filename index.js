const puppeteer = require('puppeteer');
const twilio = require('twilio');

const accountSid = 'AC06e2fdbbdf72047a45cabfdf8b1c5082';
const authToken = 'd86e271ae31ecdfbec5a7aa237bdba79';
const twilioNumber = '+19252302436'; // Your Twilio phone number
const yourPhoneNumber = '+919700023546'; // Your phone number
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
const movieURL = 'https://in.bookmyshow.com/hyderabad/movies/salaar-cease-fire-part-1/ET00301886';
checkTicketAvailability(movieURL);
