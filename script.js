// Play song and store info in localStorage
const buttons = document.querySelectorAll(".play-btn");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const songData = {
      song: button.dataset.song,
      title: button.dataset.title,
      artist: button.dataset.artist,
      img: button.dataset.img,
    };

    localStorage.setItem("currentSong", JSON.stringify(songData));

    window.location.href = "player.html";
  });
});
