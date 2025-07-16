# Expertis Backend

## To Run this Project via NPM follow below:

```bash

npm i
npm run server

```

## Cloudinary Setup

1. Install dependencies:
   ```sh
   npm install cloudinary
   ```
2. Add the following to your `.env` file:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
3. Use the `config/cloudinary.js` utility to upload images or generate URLs.

**Example usage:**
```js
import cloudinary, { uploadImage } from './config/cloudinary';

(async () => {
  const result = await uploadImage('path/to/image.jpg', 'public_id');
  console.log(result.secure_url);
})();
```
