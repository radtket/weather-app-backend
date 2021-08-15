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
        })),
      axios(
        `https://api.darksky.net/forecast/b51dd7257f9524793206bc4d5edca00e/${latitude},${longitude}`
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
