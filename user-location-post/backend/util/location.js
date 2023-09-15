const axios = require("axios");
const HttpError = require("../models/http-error");
 
async function getCoordsForAddress(address) {
  const response = await axios.get(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/' + ${address} + '.json?access_token=pk.eyJ1IjoibWRhcmlmMDgxOTk4IiwiYSI6ImNsMW5pM2syaTAxMWMzanQ2cTViNHF0OGkifQ.7cOJa2IqlHZDk-cPvn98mw&limit=1'
    `
  );
 
  if (response.data.features.length === 0) {
    const error = new HttpError("Could not find location for the specified address. Please Try with different match...", 422);
    throw error;
  }
  const coordinates = {
    lat: response.data.features[0].center[1],
    lng: response.data.features[0].center[0]
  };
 
  return coordinates;
}
 
module.exports = getCoordsForAddress;