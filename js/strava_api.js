// http://localhost/exchange_token?state=&code=33e1b24614158d76f9e9be3335dddec19a49268f&scope=read,read_all

const secretID = "7a1eb612657bf210784d436768af70a8059e6fa5";
const clientID = 77288;
const refreshToken = "5a2c4a24cfe92d8637da700572af31d64d5728b7";
// access token must be flexible, as it gets refreshed every 6 hours
let exchange_token = "";
const callBackDomain = "http://localhost/";
// strava token function ///////////////////////////////////

newToken();
function newToken() {
  const tokenURL = `https://www.strava.com/api/v3/oauth/token`;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", tokenURL);

  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      console.log("status", xhr.status);
      console.log("responsetext", xhr.responseText);
      let arrayResponse = JSON.parse(xhr.responseText);
      let expiration = arrayResponse.expires_in;
      let NEW_token = arrayResponse.access_token;
      localStorage.setItem("new_token", NEW_token);

      console.log("Seconds to expiration: %c" + expiration, "color:green");
    } else {
      console.log("%c Refreshing access token", "color:red");
    }
  };

  let data = `client_id=${clientID}&client_secret=${secretID}&grant_type=refresh_token&refresh_token=${refreshToken}`;

  xhr.send(data);
}

////////////////////////////////////////////////////////

let current_token = localStorage.new_token;
console.log("Present token:", current_token);
const authLink = "https://www.strava.com/oauth/authorize";

function getSegments(response) {
  boundsArr = getLastBounds();
  const activityType = document.getElementById("activityType").value;
  const minClimb = document.getElementById("minClimb").value;
  const maxClimb = document.getElementById("maxClimb").value;
  const segmentsUrl = `https://www.strava.com/api/v3/segments/explore?bounds=${boundsArr}&activity_type=${activityType}&min_cat=${minClimb}&max_cat=${maxClimb}?access_token=${current_token}`;
  fetch(segmentsUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${current_token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      let segmentList = [];
      for (let i = 0; i < data.segments.length; i++) {
        let currentSegment = data.segments[i];
        // let start = currentSegment.start_latlng;
        // localStorage.setItem("start_latlng", start);
        // let end = currentSegment.end_latlng;
        // localStorage.setItem("end_latlng", end);
        let name = currentSegment.name;
        let avgGrade = currentSegment.avg_grade;
        let climbL = currentSegment.distance;
        let profileC = currentSegment.elevation_profile;
        let lats = currentSegment.start_latlng[0];
        let lons = currentSegment.start_latlng[1];
        let hillsCard = `
          <div class="col-sm this" >
          <div class="card">
          <div class="card-body">
          <p><strong>${name}</strong></p>
          <div><img src=${profileC} /></div>
          <p>Length of climb: ${climbL} feet.</p>
          <p>Average grade: ${avgGrade}%</p>
          <p><a href="https://www.google.com/maps/search/?api=1&query=${lats}%2C${lons}">Starting location</a></p></div>
          </div>
          </div>`;
        segmentList.push(hillsCard);
      }
      //
      $("#hillCards").html(segmentList.join(""));
      hideFunction();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// $("#submit").click(hideFunction()); // button with an id="submit" to run the getSegments function after variables have been selected and read by document.querySelector dom, or maybe a <form>? something like that

function hideFunction() {
  let x = document.getElementById("hillCards");
  if (x.style.display === "none") {
    x.style.display = "flex";
  } else {
    x.style.display = "none";
    getSegments();
  }
}

function showFunction() {
  let y = document.getElementById("hillCards");
  if (y.style.display === "flex") {
    y.style.display = "none";
  }
}
