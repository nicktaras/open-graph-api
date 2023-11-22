import express from 'express';
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());

async function fetchOpenGraphMetadata(url) {
  try {

    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    const ogMetadata = {};

    $('meta[property^="og:"]').each((index, element) => {
      const property = $(element).attr('property');
      const content = $(element).attr('content');
      ogMetadata[property.replace('og:', '').trim()] = content;
    });

    return ogMetadata;

  } catch (error) {
    console.error('Error fetching Open Graph metadata:', error.message);
    throw error;
  }
}

// Example usage:
const urlToFetch = 'https://example.com';
fetchOpenGraphMetadata(urlToFetch)
  .then((metadata) => {
    console.log('Open Graph Metadata:', metadata);
  })
  .catch((error) => {
    console.error('Error:', error.message);
  });

app.get('/og-metadata', async (req, res) => {
  const urlToFetch = req.query.url;

  if (!urlToFetch) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  try {
    const metadata = await fetchOpenGraphMetadata(urlToFetch);
    res.json(metadata);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching Open Graph metadata' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

