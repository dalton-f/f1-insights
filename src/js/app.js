import { addClass, createElement, setInnerHTML } from "./helpers";

import Chart from "chart.js/auto";
import "chartjs-adapter-moment";

// import moment from "moment";

const tyreCompoundColors = {
  WET: "#050038",
  INTER: "#008714",
  HARD: "#FFFFFF",
  MEDIUM: "#ffc300",
  SOFT: "#ff5733",
};

const driverStandingsTable = document.getElementById("driverStandingsTable");

const ctx = document.getElementById("myChart");

const fetchData = async (url) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${response.statusText}`,
      );
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
  }
};

const createPaddedTableCell = (data) => {
  const cell = createElement("td");

  // Adds padding and brings back a basic border
  addClass(cell, ["styled-table-cell"]);
  setInnerHTML(cell, data);

  return cell;
};

const populateDriverStandings = async () => {
  // Fetch driver standings data from the API
  const data = await fetchData("/api/f1-data/driver-standings");
  // Extract the driver standings array from the fetched data
  const driverStandings = data[0].DriverStandings;

  // Use a calculation to determine the maximum total of points remaining
  const totalRemainingPoints = await fetchData("/api/f1-data/remaining-points");

  // Get the points of the championship leader
  const currentLeadingPoints = parseInt(driverStandings[0].points);

  const fragment = document.createDocumentFragment();

  driverStandings.forEach(
    // Destructure necessary properties from each position
    ({ position, Driver, Constructors, points }, index) => {
      const row = document.createElement("tr");

      // Add alternating grey accents to the table
      // eslint-disable-next-line no-magic-numbers
      if ((index + 1) % 2 === 0) {
        addClass(row, "bg-light-grey");
      }

      // Calculate the points deficit to the current championship leader
      const pointDeficit = currentLeadingPoints - points;

      // Determine if the point deficit can be overcome within the remaining rounds
      // TODO: add countback for number of wins if points are drawn
      const canWinChampionship = totalRemainingPoints > pointDeficit;

      // Create an array with the data to be displayed
      const cellData = [
        position,
        `${Driver.givenName} ${Driver.familyName}`,
        Constructors[0].name,
        points,
        canWinChampionship
          ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7l233.4-233.3c12.5-12.5 32.8-12.5 45.3 0z"/></svg>'
          : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3l105.4 105.3c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256l105.3-105.4z"/></svg>',
      ];

      // Loop through the cellsData array to create and append cells
      cellData.forEach((data) => {
        const cell = createPaddedTableCell(data);
        row.appendChild(cell);
      });

      fragment.appendChild(row);
    },
  );

  driverStandingsTable.appendChild(fragment);
};

const generateLapGraph = async () => {
  const lapsData = await fetchData("/api/f1-data/laps");

  let totalLaps = 0;

  const datasets = [];

  // From the driver data, generate the dataset objects
  for (const driver in lapsData) {
    const laps = lapsData[driver]["lap_times"];

    // Calculate the max total laps for the label generation
    if (laps.length > totalLaps) {
      totalLaps = laps.length;
    }

    // Loop through the laps and convert into seconds
    const times = laps.map((lap) => {
      // eslint-disable-next-line no-unused-vars
      const [_, minutes, seconds] = lap[0].split(":");

      const totalSeconds = parseFloat(minutes) * 60 + parseFloat(seconds);

      return totalSeconds;
    });

    // Build the object
    const dataset = {
      label: driver,
      data: times,
      laps: laps,

      // Sets the point to the same color as the tyre compound
      pointBackgroundColor: (context) => {
        const index = context.dataIndex;
        const value = laps[index][1];

        return tyreCompoundColors[value];
      },

      // Set the line colors and point borders to match the driver team
      pointBorderColor: () => {
        const value = lapsData[driver]["team_color"];
        return `#${value}`;
      },

      lineBackgroundColor: () => {
        const value = lapsData[driver]["team_color"];
        return `#${value}`;
      },

      lineBorderColor: () => {
        const value = lapsData[driver]["team_color"];
        return `#${value}`;
      },

      pointRadius: 3.5,
      pointHoverRadius: 8,
    };

    datasets.push(dataset);
  }

  // Use multiple datasets to graph the drivers times
  new Chart(ctx, {
    type: "line",
    data: {
      // Generates an array from 1 to total laps to label the axis
      labels: Array.from({ length: totalLaps }, (_, i) => i + 1),
      datasets: datasets,
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: "Lap number",
            padding: {
              top: 24,
            },
          },
        },
        y: {
          title: {
            display: true,
            text: "Lap time",
            padding: {
              bottom: 24,
            },
          },
        },
      },

      // Styles the tooltip hover

      plugins: {
        tooltip: {
          enabled: true,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          titleColor: "#ffffff",
          borderColor: "rgba(255, 255, 255, 0.5)",
          borderWidth: 1,
          padding: 16,

          titleFont: {
            size: 16,
          },
          bodyFont: {
            size: 16,
          },

          titleAlign: "center",
          titleMarginBottom: 8,
          cornerRadius: 8,
          displayColors: false,

          useHTML: true,

          callbacks: {
            title: (tooltipItems) => `Lap ${tooltipItems[0].label}`,
            label: (tooltipItem) => {
              const dataset = datasets[tooltipItem.datasetIndex];
              const value = tooltipItem.raw;

              const lapCompound = dataset.laps[tooltipItem.dataIndex][1];

              return `${dataset.label}: ${value} [${lapCompound}]`;
            },
          },
        },
      },
    },
  });
};

document.addEventListener("DOMContentLoaded", () => {
  populateDriverStandings();

  generateLapGraph();
});
