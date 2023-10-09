
const axios = require('axios');
module.exports.sendMailer = (data1)=>{
  const data = JSON.stringify({
    sender: {
      name: 'Carbon',
      email: 'info@carbontrace.co',
    },
    to: [
      {
        email: data1.email,
        name: data1.name,
      },
    ],
    subject: data1.subject,
    htmlContent:data1.body,
  });

  const config = {
    method: 'post',
    url: 'https://api.brevo.com/v3/smtp/email',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.SENDINBLUE_API_KEY,
      'content-type': 'application/json',
    },
    data: data,
  };

  axios(config)
    .then(function (response) {
      console.log('Email sent successfully.');
    })
    .catch(function (error) {
      console.log('An error occurred while sending the email:', error.message);
    });
}
