const axios = require("axios");
const NodeGeocoder = require("node-geocoder");

const geocoder = NodeGeocoder({
  provider: "google",
  apiKey: process.env.GEOCODE_API_KEY,
});

const weather = async (req, res) => {
  const { latitude, longitude } = req.query;
  if (latitude && longitude) {
    const [one, { data }] = await Promise.all([
      geocoder
        .reverse({ lat: latitude, lon: longitude })
        .then(([{ city, administrativeLevels, country, countryCode }]) => {
          const {
            level1short: county,
            level1long,
            level2long,
          } = administrativeLevels;

          return {
            city,
            country,
            countryCode,
            county,
            latitude,
            longitude,
            query: `${city}, ${level1long}, ${level2long}, cityscape, scenery, city`,
          };
        })
        .then(async ({ query, ...payload }) =>
          axios("https://api.pexels.com/v1/search", {
            headers: {
              Authorization: process.env.PEXELS_API_KEY,
            },
            params: {
              query,
              per_page: 1,
              local: "en-US",
            },
          }).then((item) => ({
            ...payload,
            image: item.data.photos[0].src.original,
          }))
        ),
      axios(
        `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${latitude},${longitude}`
      ),
    ]);

    res.json({
      ...one,
      ...data,
    });
  }

  res.end();
};

module.exports = weather;
