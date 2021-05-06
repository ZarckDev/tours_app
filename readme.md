# OnTours Application project

Built using: Node.JS, Express, MongoDB, Mongoose and others

## Deployed Version

Live demo 🤙 : https://zarck-ontours.herokuapp.com/

_Heroku app can take some time to load, please be patient at first load_ 😉

## Built with

<img src="https://user-images.githubusercontent.com/55784207/116291887-61572980-a795-11eb-83df-f7e2dea40dee.png">

along with:

- [Mongoose](https://mongoosejs.com/) - Object Modeling for NodeJS
- [Stripe](https://stripe.com/) - Online payment API
- [Postman](https://www.getpostman.com/) - API build helper
- [JSON Web Token](https://jwt.io/) - Security token
- [Argon 2](https://argon2.online/) - Cryptographic hashing algorithm
- [Mailtrap](https://mailtrap.io/) - Email dev testing
- [Sendgrid](https://sendgrid.com/) - Email delivery platform
- [Heroku](https://www.heroku.com/) - Cloud application platform

## Features

###### Tours

- List of tours and details pages with map, reviews and rating.

###### Authentication and Authorization

- Login, Signup and logout (using JWT token as cookie).
- Forgot password functionnality with email reset request.

###### User account

- Update infos.
- Change password.
- View user bookings.

###### Payment (credit card)

- Stripe checkout integration. (Test Mode)

Based on Jonas Schmedtmann course project

## Installation

Once cloned:

```
$ npm install
--> set up your environnement variables in config.env file (for dev mode) or in your cloud platform. Detailed on next section


--> now choose how your want to start the app
$ npm run dev (development with nodemon)
$ npm run start:prod (production test)
$ npm run debug (debug with ndb)
$ npm start (for prod heroku or start with node)
```

### Environnement variables to SET

For dev purposes, create a config.env file in root directory.

| Env variables         | Description                                              |
| --------------------- | -------------------------------------------------------- |
| NODE_ENV              | "development" for dev                                    |
| PORT                  | Server port - default `3000`                             |
| MONGODB_URL           | URL of Mongo cloud database                              |
| MONGODB_LOCAL (dev)   | Local database if no cloud used                          |
| MONGODB_PWD           | Password for Mongo cloud database                        |
| JWT_SECRET            | Secret for JWT Hash generation (See [JWT])               |
| JWT_EXPIRES_IN        | Choose how long JWT is valid (See [JWT])                 |
| JWT_COOKIE_EXPIRES_IN | Cookie expiration for JWT (See [JWT])                    |
| EMAIL_USERNAME (dev)  | Only for Mailtrap, mail testing (See [Mailtrap])         |
| EMAIL_PASSWORD (dev)  | Only for Mailtrap, mail testing (See [Mailtrap])         |
| EMAIL_HOST (dev)      | Mailtrap `smtp.mailtrap.io` (See [Mailtrap])             |
| EMAIL_PORT (dev)      | Mailtrap `2525` (See [Mailtrap])                         |
| EMAIL_FROM            | email sender nodemailer service                          |
| SENDGRID_USERNAME     | Sendgrid as real email delivery service (See [Sendgrid]) |
| SENDGRID_PASSWORD     | Sendgrid as real email delivery service (See [Sendgrid]) |
| STRIPE_APIKEY         | Your API key for Stripe (See [Stripe])                   |
| STRIPE_SECRETKEY      | Your Secret key for Stripe (See [Stripe])                |
| STRIPE_WEBHOOK_SECRET | for Stripe checkout webhook (See [Stripe])               |

[jwt]: https://jwt.io/
[mailtrap]: https://mailtrap.io/
[sendgrid]: https://sendgrid.com/
[stripe]: https://stripe.com/
