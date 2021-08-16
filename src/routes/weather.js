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
        .then(([{ city, administrativeLevels, country, countryCode }]) => ({
          city,
          country,
          countryCode,
          county: administrativeLevels.level1short,
          latitude,
          longitude,
          query: `${city}, ${administrativeLevels.level1long}, ${administrativeLevels.level2long}, cityscape, scenery, city`,
        }))
        .then(async ({ query, ...payload }) =>
          axios("https://api.pexels.com/v1/search", {
            headers: {
              Authorization: process.env.PEXELS_API_KEY,
            },
            params: {
              query,
              per_page: 1,
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
