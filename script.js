// ============================================
// PLAYLIST MANAGEMENT SYSTEM
// ============================================

const PLAYLISTS_KEY = "playlists";
const playlistInput = document.getElementById("playlistInput");
const createPlaylistBtn = document.getElementById("createPlaylistBtn");
const playlistsContainer = document.getElementById("playlistsContainer");

// Initialize playlists from localStorage
function initializePlaylists() {
  const stored = localStorage.getItem(PLAYLISTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save playlists to localStorage
function savePlaylists(playlists) {
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
}

// Get next available ID
function getNextId(playlists) {
  if (playlists.length === 0) return 1;
  return Math.max(...playlists.map((p) => p.id)) + 1;
}

// Show toast notification
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("remove");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Validate playlist name
function isValidPlaylistName(name) {
  return name.trim().length > 0;
}

// Check if playlist name already exists
function playlistNameExists(name, playlists) {
  return playlists.some((p) => p.name.toLowerCase() === name.toLowerCase());
}

// Create new playlist
function createPlaylist() {
  let playlists = initializePlaylists();
  const playlistName = playlistInput.value.trim();

  // Validation
  if (!isValidPlaylistName(playlistName)) {
    showToast("Please enter a playlist name", "error");
    playlistInput.focus();
    return;
  }

  if (playlistNameExists(playlistName, playlists)) {
    showToast("Playlist name already exists", "error");
    playlistInput.focus();
    return;
  }

  // Create new playlist object with songs array
  const newPlaylist = {
    id: getNextId(playlists),
    name: playlistName,
    songs: [],
    createdAt: new Date().toISOString(),
  };

  // Add to playlists array
  playlists.push(newPlaylist);
  savePlaylists(playlists);

  // Show success message
  showToast(`Playlist "${playlistName}" created successfully!`, "success");

  // Clear input
  playlistInput.value = "";
  playlistInput.focus();

  // Render playlists
  renderPlaylists();
}

// Delete playlist
function deletePlaylist(playlistId) {
  let playlists = initializePlaylists();
  const playlistToDelete = playlists.find((p) => p.id === playlistId);

  if (!playlistToDelete) return;

  playlists = playlists.filter((p) => p.id !== playlistId);
  savePlaylists(playlists);

  showToast(
    `Playlist "${playlistToDelete.name}" deleted successfully!`,
    "success",
  );
  renderPlaylists();
}

// Render playlists to UI
function renderPlaylists() {
  const playlists = initializePlaylists();
  playlistsContainer.innerHTML = "";

  if (playlists.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.style.cssText = `
      text-align: center;
      color: #888;
      font-size: 12px;
      padding: 20px 10px;
    `;
    emptyMessage.textContent = "No playlists yet";
    playlistsContainer.appendChild(emptyMessage);
    return;
  }

  playlists.forEach((playlist) => {
    const playlistItem = document.createElement("div");
    playlistItem.className = "playlist-item";
    playlistItem.innerHTML = `
      <span class="playlist-name" title="${playlist.name}">${playlist.name}</span>
      <button class="delete-btn" data-id="${playlist.id}">Delete</button>
    `;

    // Add delete button listener
    const deleteBtn = playlistItem.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => {
      deletePlaylist(playlist.id);
    });

    playlistsContainer.appendChild(playlistItem);
  });
}

// ============================================
// SONG MANAGEMENT IN PLAYLISTS
// ============================================

// Add song to playlist
function addSongToPlaylist(playlistId, songData) {
  let playlists = initializePlaylists();
  const playlist = playlists.find((p) => p.id === playlistId);

  if (!playlist) {
    showToast("Playlist not found", "error");
    return;
  }

  // Initialize songs array if it doesn't exist
  if (!playlist.songs) {
    playlist.songs = [];
  }

  // Check if song already exists in playlist
  const songExists = playlist.songs.some(
    (s) => s.title === songData.title && s.artist === songData.artist,
  );

  if (songExists) {
    showToast(`"${songData.title}" already in playlist`, "error");
    return;
  }

  // Generate unique song ID
  const songId =
    playlist.songs.length > 0
      ? Math.max(...playlist.songs.map((s) => s.id)) + 1
      : 1;

  // Create song object
  const newSong = {
    id: songId,
    title: songData.title,
    artist: songData.artist,
    url: songData.url,
    img: songData.img,
    addedAt: new Date().toISOString(),
  };

  // Add song to playlist
  playlist.songs.push(newSong);
  savePlaylists(playlists);

  showToast(`Added "${songData.title}" to "${playlist.name}"`, "success");
  closeModal();
}

// Delete song from playlist
function deleteSongFromPlaylist(playlistId, songId) {
  let playlists = initializePlaylists();
  const playlist = playlists.find((p) => p.id === playlistId);

  if (!playlist || !playlist.songs) return;

  const song = playlist.songs.find((s) => s.id === songId);
  playlist.songs = playlist.songs.filter((s) => s.id !== songId);
  savePlaylists(playlists);

  showToast(`Removed "${song.title}" from playlist`, "success");
  renderPlaylistSongs(playlistId);
}

// Render songs in a playlist
function renderPlaylistSongs(playlistId) {
  const playlists = initializePlaylists();
  const playlist = playlists.find((p) => p.id === playlistId);

  if (!playlist) return;

  // This function can be extended to show playlist details
  // For now, we'll just log the songs
  console.log(`Songs in ${playlist.name}:`, playlist.songs);
}

// ============================================
// MODAL MANAGEMENT
// ============================================

// Create and show modal for selecting playlist
function showPlaylistModal(songData) {
  const playlists = initializePlaylists();

  if (playlists.length === 0) {
    showToast("Create a playlist first!", "error");
    return;
  }

  // Remove existing modal if present
  const existingModal = document.getElementById("playlistModal");
  if (existingModal) existingModal.remove();

  // Create modal
  const modal = document.createElement("div");
  modal.id = "playlistModal";
  modal.className = "playlist-modal";
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  `;

  const modalContent = document.createElement("div");
  modalContent.style.cssText = `
    background: #282828;
    border-radius: 12px;
    padding: 30px;
    max-width: 400px;
    width: 90%;
    color: white;
    max-height: 500px;
    overflow-y: auto;
  `;

  let html = `
    <h2 style="margin-top: 0; color: #1db954;">Add to Playlist</h2>
    <p style="color: #b3b3b3; margin-bottom: 20px;">Selecting: <strong>${songData.title}</strong> by ${songData.artist}</p>
    <div style="display: flex; flex-direction: column; gap: 10px;">
  `;

  playlists.forEach((playlist) => {
    html += `
      <button 
        class="playlist-option" 
        data-playlist-id="${playlist.id}" 
        style="
          background: #181818;
          border: 1px solid #404040;
          color: white;
          padding: 12px 15px;
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
          transition: all 0.3s;
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
      >
        <span>${playlist.name}</span>
        <span style="font-size: 12px; color: #888;">${playlist.songs ? playlist.songs.length : 0} songs</span>
      </button>
    `;
  });

  html += `
    </div>
    <button 
      id="closeModalBtn" 
      style="
        margin-top: 20px;
        width: 100%;
        padding: 10px;
        background: #404040;
        border: none;
        color: white;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.3s;
      "
    >
      Cancel
    </button>
  `;

  modalContent.innerHTML = html;
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Add event listeners for playlist options
  document.querySelectorAll(".playlist-option").forEach((btn) => {
    btn.addEventListener("click", function () {
      const playlistId = parseInt(this.dataset.playlistId);
      addSongToPlaylist(playlistId, songData);
    });

    btn.addEventListener("mouseover", function () {
      this.style.background = "#333333";
      this.style.borderColor = "#1db954";
    });

    btn.addEventListener("mouseout", function () {
      this.style.background = "#181818";
      this.style.borderColor = "#404040";
    });
  });

  // Close modal on cancel
  document
    .getElementById("closeModalBtn")
    .addEventListener("click", closeModal);

  // Close modal on outside click
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeModal();
    }
  });
}

// Close modal
function closeModal() {
  const modal = document.getElementById("playlistModal");
  if (modal) {
    modal.remove();
  }
}

// Event Listeners for Playlist
createPlaylistBtn.addEventListener("click", createPlaylist);

playlistInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    createPlaylist();
  }
});

// ============================================
// SONG PLAYER FUNCTIONALITY
// ============================================

// Initialize song cards with "Add to Playlist" buttons
function initializeSongCards() {
  const songCards = document.querySelectorAll(".song-card");

  songCards.forEach((card) => {
    // Get song data from play button
    const playBtn = card.querySelector(".play-btn");
    if (!playBtn) return;

    const songData = {
      title: playBtn.dataset.title,
      artist: playBtn.dataset.artist,
      url: playBtn.dataset.song,
      img: playBtn.dataset.img,
    };

    // Add play button listener
    playBtn.addEventListener("click", () => {
      const data = {
        song: playBtn.dataset.song,
        title: playBtn.dataset.title,
        artist: playBtn.dataset.artist,
        img: playBtn.dataset.img,
      };
      localStorage.setItem("currentSong", JSON.stringify(data));
      window.location.href = "player.html";
    });

    // Check if "Add to Playlist" button already exists
    if (card.querySelector(".add-to-playlist-btn")) return;

    // Create "Add to Playlist" button
    const addToPlaylistBtn = document.createElement("button");
    addToPlaylistBtn.className = "add-to-playlist-btn";
    addToPlaylistBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
    addToPlaylistBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: #1db954;
      border: none;
      padding: 10px;
      border-radius: 50%;
      cursor: pointer;
      transition: background 0.3s;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      z-index: 10;
    `;

    addToPlaylistBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showPlaylistModal(songData);
    });

    addToPlaylistBtn.addEventListener("mouseover", function () {
      this.style.background = "#1ed760";
    });

    addToPlaylistBtn.addEventListener("mouseout", function () {
      this.style.background = "#1db954";
    });

    // Add button to song card album
    const album = card.querySelector(".album");
    if (album) {
      album.style.position = "relative";
      album.appendChild(addToPlaylistBtn);
    }
  });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  renderPlaylists();
  playlistInput.focus();

  // Initialize song cards
  initializeSongCards();

  // Re-initialize when songs might be added (if using dynamic loading)
  const observer = new MutationObserver(() => {
    initializeSongCards();
  });

  const songScroller = document.querySelector(".scroller");
  if (songScroller) {
    observer.observe(songScroller, {
      childList: true,
      subtree: true,
    });
  }
});
