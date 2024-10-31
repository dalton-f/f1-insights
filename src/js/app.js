// import { addClass, createElement, setInnerHTML } from "./helpers";

import "./components/laps";

// const driverStandingsTable = document.getElementById("driverStandingsTable");

// const pointsGraph = document.getElementById("pointsGraph");

// const fetchData = async (url, method = "GET", data = null) => {
//   try {
//     const options = {
//       method,
//       headers: {
//         "Content-Type": "application/json",
//       },
//     };

//     if (method === "POST" && data) {
//       options.body = JSON.stringify(data);
//     }

//     const response = await fetch(url, options);

//     if (!response.ok) {
//       throw new Error(
//         `HTTP error! status: ${response.status}, message: ${response.statusText}`,
//       );
//     }

//     const responseData = await response.json();

//     return responseData;
//   } catch (error) {
//     console.error("Error fetching data:", error);
//   }
// };

// const createPaddedTableCell = (data) => {
//   const cell = createElement("td");

//   addClass(cell, ["styled-table-cell"]);
//   setInnerHTML(cell, data);

//   return cell;
// };

// const populateDriverStandings = async () => {
//   // Fetch driver standings data from the API
//   const data = await fetchData("/api/f1-data/driver-standings");
//   // Extract the driver standings array from the fetched data
//   const driverStandings = data[0].DriverStandings;

//   // Use a calculation to determine the maximum total of points remaining
//   const totalRemainingPoints = await fetchData("/api/f1-data/remaining-points");

//   // Get the points of the championship leader
//   const currentLeadingPoints = parseInt(driverStandings[0].points);

//   const fragment = document.createDocumentFragment();

//   driverStandings.forEach(
//     // Destructure necessary properties from each position
//     ({ position, Driver, Constructors, points }, index) => {
//       // temp truncation
//       if (index >= 8) return;

//       const row = document.createElement("tr");

//       // Add alternating grey accents to the table
//       // eslint-disable-next-line no-magic-numbers
//       if ((index + 1) % 2 === 0) {
//         addClass(row, "bg-light-grey");
//       }

//       // Calculate the points deficit to the current championship leader
//       const pointDeficit = currentLeadingPoints - points;

//       // Determine if the point deficit can be overcome within the remaining rounds
//       // TODO: add countback for number of wins if points are drawn
//       const canWinChampionship = totalRemainingPoints > pointDeficit;

//       // Create an array with the data to be displayed
//       const cellData = [
//         position,
//         `${Driver.givenName} ${Driver.familyName}`,
//         // Constructors[0].name,
//         points,
//         // canWinChampionship
//         //   ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7l233.4-233.3c12.5-12.5 32.8-12.5 45.3 0z"/></svg>'
//         //   : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3l105.4 105.3c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256l105.3-105.4z"/></svg>',
//       ];

//       // Loop through the cellsData array to create and append cells
//       cellData.forEach((data) => {
//         const cell = createPaddedTableCell(data);
//         row.appendChild(cell);
//       });

//       fragment.appendChild(row);
//     },
//   );

//   driverStandingsTable.appendChild(fragment);
// };

// const generatePointsGraph = async () => {
//   const progress = await fetchData(
//     "/api/f1-data/points-across-season",
//     "POST",
//     {
//       year: 2024,
//     },
//   );

//   const datasets = [];

//   for (const driver in progress) {
//     const dataset = {
//       label: driver,
//       data: progress[driver],
//     };

//     datasets.push(dataset);
//   }

//   new Chart(pointsGraph, {
//     type: "line",

//     data: {
//       datasets: datasets,
//     },

//     options: {
//       scales: {
//         x: {
//           type: "linear",
//         },
//       },
//     },
//   });
// };

// const populateNextEvent = async () => {
//   const data = await fetchData("/api/f1-data/next-event");

//   console.log(data);
// };

// document.addEventListener("DOMContentLoaded", () => {
//   populateDriverStandings();
//   populateNextEvent();
//   // generatePointsGraph();
//   // generateLapGraph();
// });
