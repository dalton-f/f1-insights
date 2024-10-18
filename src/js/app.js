document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/f1data")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => console.error("Error fetching F1 data:", error));
});
