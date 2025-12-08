<p align="center">
    <!--<img src="./.github/assets/" width="200px" /><br />-->
    <h1 align="center">Examduler</h1>
    <p align="center">A <b>free</b>, <b>open-source</b> exam scheduler and management system.</p>
    <p align="center">
        <a href="#about">About</a> •
        <a href="#features">Features</a> •
        <a href="#development">Development</a> •
        <a href="#contributing">Contributing</a> •
        <a href="#license">License</a>
    </p>
    <hr />
</p>

## About
Examduler is a free, open-source exam scheduler and management system. Exam, seating, and invigilation management all in one.

## Features
* **AI exam summaries**
Students get AI assisted overviews powered by local models<sup>1</sup>
* **Clean and minimalist homepage for viewing exams**
Take a quick glance at all your exams in a Material You themed homepage
* **Invigilation management**.
Assign teachers to exams instantly<sup>^</sup>

<sup><sup>^</sup> Coming soon</sup>
<sup><sup>1</sup> Only works on certain browsers</sup>

## Development
### Prerequisites
Before development, please ensure you have the following installed:
* [Node.js](https://nodejs.org/en/download) (Running the website and server)

### Setup
1. **Clone the repository**

```
git clone https://github.com/ingStudiosOfficial/examduler.git
cd examduler
```

2. **Clone the .env.example file for the website and server**

```
cd website
copy .env.example .env a/
cd ../server
copy .env.example .env a/
```

3. **Setup MongoDB Atlas**

Create a [MongoDB Atlas](https://cloud.mongodb.com) database and cluster called ```examduler```. Get the Node.js driver connection string. Paste the MongoDB connection string (```MONGODB_URI```) in your ```server/.env``` file.

4. **Install Node.js packages**

```
cd website
npm install
```

5. **Setup Google OAuth**

Create a new project in [Google Cloud Console](https://console.cloud.google.com). Go to APIs & Services > OAuth Consent Screen > Clients and create a new Web Client. Add your app details. Set your callback and JavaScript origin URLs. Get your Google client ID and secret (```GOOGLE_CLIENT_ID``` AND ```GOOGLE_CLIENT_SECRET```) and add them to ```server/.env```. Set your callback URL (```GOOGLE_CALLBACK_URL```) in ```server/.env``` too.

6. **Add secrets in .env**

Go to ```website/.env``` and set your ```VITE_API_BASE_URL``` (where your server is located).

Go to ```server/.env``` and set your ```CLIENT_URL``` (where your website is located). Set your ```PORT``` (your development port, e.g. 3000), ```NODE_ENV``` to ```development```, set your ```JWT_SECRET_KEY``` and ```SESSION_SECRET``` to a secure randomly generated key.

### Running
1. **Run the development build of the website**

```
cd website
npm run dev
```

2. **Run the development build of the server**

```
cd server
npm run dev
```

### Packaging
1. **Build the website**

```
cd website
npm run build
```

2. **Build the server**

```
cd server
npm run build
```

## Contributing
We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for more details.

## License
Examduler is licensed under the **Apache 2.0 License**. See [LICENSE](./LICENSE) for more deatils.

<hr />

© 2025 (ing) Studios and Ethan Lee