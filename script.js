console.log("hello from JavaScript");

let CurrentSong = new Audio();
console.log("time is", CurrentSong.duration)
// let card;
let songs;
let CurrFolder;
let startVar;
let start = document.getElementById("start");
let next = document.getElementById("next");
let prev = document.getElementById("prev");
let cardList = document.querySelector(".cardList");
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}
async function GetSongs(folder) {
  CurrFolder = folder;
  const response = await fetch(`http://127.0.0.1:5500/${folder}/`);
  const htmlText = await response.text();
  // console.log(htmlText);
  let div = document.createElement("div");
  div.innerHTML = htmlText;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  let songURL = document
    .querySelector(".song-list")
    .getElementsByTagName("ul")[0];
  songURL.innerHTML = "";
  for (const song of songs) {
    songURL.innerHTML += `<li>
      <div class="pics"><i class="fa-solid fa-music"></i></div>
      <div class="info">
        <p>${song.replaceAll("%20", " ")}</p>
        <p>artist</p>
      </div>
      <div class="click">
        <i class="fa-solid fa-play"></i>
        <p>Play Now</p>
      </div>
    </li>`;
  }
  Array.from(
    document.querySelector(".song-list").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      const songName = e
        .querySelector(".info")
        .firstElementChild.innerHTML.trim();
      console.log(songName);
      playMusic(songName);
    });
  });

  return songs;
}
// GetSongs();
//function to laod album or each category folder
async function getFolder() {
  const response = await fetch("http://127.0.0.1:5500/song/");
  const htmlText = await response.text();
  // console.log(htmlText);
  let div = document.createElement("div");
  div.innerHTML = htmlText;
  let anchor = div.getElementsByTagName("a");
  const array = Array.from(anchor);
  for (let i = 0; i < array.length; i++) {
    const e = array[i];
    if (e.href.includes("/song/")) {
      // console.log(e.href); // This will give the URL with '/song/'
      const folderName = e.href.split("/").slice(-1)[0];
      console.log("The Folder Nmae is ", folderName); // This will give the name of the folder
      //get metadata of folder of json data
      const response = await fetch(
        `http://127.0.0.1:5500/song/${folderName}/info.json`
      );
      let jsonData = await response.json();
      console.log(jsonData);
      cardList.innerHTML =
        cardList.innerHTML +
        `<div data-folder="${folderName}" class="item1 card">
    <div class="play">
      <i class="fa-solid fa-play iconPlay"></i>
    </div>
    <img src="/song/${folderName}/cover/images.jpg" alt="">
    <h3>${folderName}</h3>
    <p>${jsonData.description}</p>
  </div>`;
    }
  }
  //add eventlistner to each card to display song
  let card = document.getElementsByClassName("card");
  Array.from(card).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log(item.currentTarget.dataset);
      // const folder = item.currentTarget.dataset.folder;
      // songs = await GetSongs(`song/${folder}`);
      songs = await GetSongs(`song/${item.currentTarget.dataset.folder}`);
      console.log("song from card is ", songs);
      // playMusic(songs[0], true, folder);
      playMusic(songs[0]);
    });
  });
  //add eventlistner to next and prev song
  prev.addEventListener("click", () => {
    console.log("prev clicked");
    let index = songs.indexOf(CurrentSong.src.split("/").slice(-1)[0]);
    console.log(index);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  next.addEventListener("click", () => {
    console.log("next clicked");
    let index = songs.indexOf(CurrentSong.src.split("/").slice(-1)[0]);
    console.log(index);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });
}
// getFolder()
const playMusic = (track, pause = false) => {
  CurrentSong.src = `/${CurrFolder}/` + track;
  if (!pause) {
    CurrentSong.play();
    start.src = "image/pause.svg";
  }

  console.log("updated src to pause.svg");
  document.querySelector(".song-info").innerHTML = decodeURI(track);
  document.querySelector(".time").innerHTML = "00:00/00:00";
};

async function main() {
  //
  let songs = await GetSongs("song/category1");
  console.log(songs);
  playMusic(songs[0], true);
  await getFolder();
  start.addEventListener("click", (e) => {
    if (CurrentSong.paused) {
      CurrentSong.play();
      // start.src = "image/pause.svg";
      e.target.src = e.target.src.replace("image/play.svg", "image/pause.svg");
      console.log("Playing, updated src to pause.svg");
    } else {
      CurrentSong.pause();
      e.target.src = e.target.src.replace("image/pause.svg", "image/play.svg");
      // start.src = "image/play.svg";
    }
  });
  //add eventlistner to time update
  CurrentSong.addEventListener("timeupdate", () => {
    console.log( CurrentSong.duration);
    document.querySelector(".time").innerHTML = `${secondsToMinutesSeconds(
      CurrentSong.currentTime
    )}/${secondsToMinutesSeconds(CurrentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (CurrentSong.currentTime / CurrentSong.duration) * 100 + "%";
  });
  //add eventlistner to seekbar or song progress bar
  let seekbar = document.querySelector(".seekbar");
  seekbar.addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    console.log(percent);
    document.querySelector(".circle").style.left = percent + "%";
    CurrentSong.currentTime = (CurrentSong.duration * percent) / 100;
  });
  //add eventlistner to humberger icon
  document.querySelector(".humberger").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0;
  });
  //add eventlistner to close icons
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-130%";
  });
  ////add eventlistner to volume update
  let volumeVar = document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting volume to", e.target.value, "/ 100");
      CurrentSong.volume = parseInt(e.target.value) / 100;
    });
  // Add event listener to mute the track
  let volume = document.querySelector(".volume");
  console.log("the vloume is");
  volume.addEventListener("click", (e) => {
    console.log("volume.svg clicked");
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      CurrentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      CurrentSong.volume = volumeVar;
      // CurrentSong.volume = .10
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
  //playback speed controll
  const speedSelector = document.getElementById("speed");
speedSelector.addEventListener("change", (e) => {
  const selectedSpeed = parseFloat(e.target.value);
  CurrentSong.playbackRate = selectedSpeed;
  CurrentSong.playbackRate = parseFloat(speedSelector.value);
});
}
main();
