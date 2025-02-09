"use client";

export function DownloadImagesButton() {
  function downloadImages() {
    fetch(`/api/download`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to download images");
        }
        return response.json();
      })
      .then(() => {
        alert("Downloaded missing images");
      })
      .catch((error) => {
        console.error("Error fetching from API:", error);
        alert("Failed to download images");
      });
  }

  return (
    <button
      onClick={downloadImages}
      className="flex h-10 items-center rounded-lg bg-green-600 px-4 text-sm font-medium text-white transition-colors hover:bg-green-800"
    >
      <span className="">Download missing images</span>
    </button>
  );
}

export function UpdateHltbButton() {
  function updateHltbTimes() {
    fetch(`/api/hltb/all`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update HLTB data");
        }
        return response.json();
      })
      .then(() => {
        alert("Updated all HLTB times");
      })
      .catch((error) => {
        console.error("Error fetching from API:", error);
        alert("Failed to update HLTB data");
      });
  }

  return (
    <button
      onClick={updateHltbTimes}
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-800"
    >
      <span className="">Update all hltb times</span>
    </button>
  );
}
