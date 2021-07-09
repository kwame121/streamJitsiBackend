const { google } = require("googleapis");
const { youtubeObject } = require("./constants.js");
const { connection } = require("./db.js");

function create_auth_client() {
  const oauth2Client = new google.auth.OAuth2(
    youtubeObject.clientId,
    youtubeObject.clientSecret,
    "http://localhost:3000/destinations/auth/youtube"
  );
  return oauth2Client;
}

function retrieve_refresh_token() {
  connection.connect();
  return new Promise((resolve, reject) => {
    connection.query(
      "Select * from youtube_refresh_token limit 1",
      function (err, results, fields) {
        if (err) {
          reject(err);
        }
        resolve(results);
      }
    );
  });
}

function get_new_access_token(refresh_token) {
  let oauth2Client = create_auth_client();
  oauth2Client.credentials.refresh_token = refresh_token;
  return new Promise((resolve, reject) => {
    oauth2Client.refreshAccessToken((error, tokens) => {
      if (!error) {
        resolve(token);
      } else {
        reject(error);
      }
    });
  });
}

function listConnectionNames(auth) {
  const service = google.people({ version: "v1", auth });
  //promisify this....

  return new Promise((resolve, reject) => {
    service.people.connections.list(
      {
        resourceName: "people/me",
        pageSize: 10,
        personFields: "names,emailAddresses",
      },
      (err, res) => {
        if (err) reject("Error has occured when retrieving connections " + err);
        const connections = res.data.connections;
        if (connections) {
          resolve(connections);
        } else {
          resolve(connections);
        }
      }
    );
  });
}


module.exports = {
  create_auth_client,
  retrieve_refresh_token,
  get_new_access_token,
};
