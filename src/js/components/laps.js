import Chart from "chart.js/auto";

Chart.defaults.font.size = 14;
Chart.defaults.color = "#f9f1f1";

// FastF1 has data from 2018 to the latest season
const EARLIEST_SEASON = 2018;
const CURRENT_YEAR = new Date().getFullYear();

const TYRE_COMPOUND_COLORS = {
  WET: "#4491D2",
  INTERMEDIATE: "#3AC82C",
  HARD: "#FFFFFF",
  MEDIUM: "#FFC400",
  SOFT: "#ff5733",
};

const EVENT_FORMATS = {
  conventional: [
    "Practice 1",
    "Practice 2",
    "Practice 3",
    "Qualifying",
    "Race",
  ],
  sprint: ["Practice 1", "Qualifying", "Practice 2", "Sprint", "Race"],
  sprint_shootout: [
    "Practice 1",
    "Qualifying",
    "Sprint Shootout",
    "Sprint",
    "Race",
  ],
  sprint_qualifying: [
    "Practice 1",
    "Sprint Qualifying",
    "Sprint",
    "Qualifying",
    "Race",
  ],
};

const yearSelector = document.getElementById("yearSelector");
const trackSelector = document.getElementById("trackSelector");
const sessionSelector = document.getElementById("sessionSelector");

const ctx = document.getElementById("lapsGraph");

const fetchData = async (url, method = "GET", data = null) => {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (method === "POST" && data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${response.statusText}`,
      );
    }

    const responseData = await response.json();

    return responseData;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const populateSeasons = () => {
  if (!yearSelector || !(yearSelector instanceof HTMLSelectElement)) {
    console.error("Invalid year selector provided.");
    return;
  }

  const fragment = document.createDocumentFragment();

  // Create options for each year from earliest to current
  for (let year = EARLIEST_SEASON; year <= CURRENT_YEAR; year++) {
    const option = document.createElement("option");

    option.value = year;
    option.innerText = year;

    fragment.appendChild(option);
  }

  // Append all options to the select element in one go
  yearSelector.appendChild(fragment);
};

const populateTracks = async () => {
  const schedule = await fetchData("/api/f1-data/event-schedule", "POST", {
    year: yearSelector.value,
  });

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < schedule.length; i++) {
    const [round, format] = schedule[i];

    const option = document.createElement("option");

    option.innerText = round;
    option.value = i + 1;

    fragment.appendChild(option);
  }

  trackSelector.appendChild(fragment);
};

const populateSessions = async () => {
  const schedule = await fetchData("/api/f1-data/event-schedule", "POST", {
    year: yearSelector.value,
  });

  const selectedRound = schedule[trackSelector.value - 1];
  const selectedRoundFormat = selectedRound[1];

  const selectedRoundSessions = EVENT_FORMATS[selectedRoundFormat];

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < selectedRoundSessions.length; i++) {
    const option = document.createElement("option");

    option.value = selectedRoundSessions[i];
    option.innerText = selectedRoundSessions[i];

    fragment.appendChild(option);
  }

  sessionSelector.appendChild(fragment);
};

const generateLapGraph = async (year, round, session) => {
  const lapsData = await fetchData("/api/f1-data/laps", "POST", {
    year: parseInt(year),
    round: parseInt(round),
    session: session,
  });

  const datasets = [];

  let totalLaps = 0;

  // From the driver data, generate the dataset objects
  for (const driver in lapsData) {
    const laps = lapsData[driver]["lap_times"];

    if (laps.length > totalLaps) {
      totalLaps = laps.length;
    }

    // Loop through the laps and convert into seconds
    const times = laps.map((lap) => {
      // Remove hours from the lap time string
      // eslint-disable-next-line no-unused-vars
      const [time, compound, lapNumber] = lap;
      // eslint-disable-next-line no-unused-vars
      const [hours, minutes, seconds] = time.split(":");

      const totalSeconds = (
        parseFloat(minutes) * 60 +
        parseFloat(seconds)
      ).toFixed(3);

      // Return as an object to specify correct lap number for the axis (accounts for the missing lap times)
      return {
        x: lapNumber,
        y: totalSeconds,
      };
    });

    // Build the object
    const dataset = {
      label: driver,
      data: times,
      laps: laps,

      hidden: true,

      // Sets the point to the same color as the tyre compound
      pointBackgroundColor: (context) => {
        const index = context.dataIndex;

        // Ensures the code doesn't break if a driver sets no lap times
        if (laps[index]) {
          const value = laps[index][1];
          return TYRE_COMPOUND_COLORS[value];
        }
      },

      // Set the line colors and point borders to match the driver team
      pointBorderColor: () => `#${lapsData[driver]["team_color"]}`,
      lineBackgroundColor: () => `#${lapsData[driver]["team_color"]}`,
      lineBorderColor: () => `#${lapsData[driver]["team_color"]}`,

      pointRadius: 4,
      pointHoverRadius: 8,
    };

    datasets.push(dataset);
  }

  // Use multiple datasets to graph the drivers times
  new Chart(ctx, {
    type: "line",
    data: {
      datasets: datasets,
    },
    options: {
      animation: false,

      scales: {
        x: {
          type: "linear",

          border: {
            display: true,
            color: "#a6a5a4",
          },

          // Ensure the axis bounds are set correctly
          max: totalLaps + 1,
          min: 1,
          stepSize: 5,

          title: {
            display: true,
            text: "Lap number",
            padding: {
              top: 32,
            },
          },
        },
        y: {
          title: {
            display: true,
            text: "Lap time",
            padding: {
              bottom: 32,
            },
          },

          border: {
            display: true,
            color: "#a6a5a4",
          },

          grid: {
            display: true,
            drawOnChartArea: true,
            drawTicks: true,
            color: "#a6a5a4",
          },

          ticks: {
            callback: (value) => {
              // Calculate minutes
              const minutes = Math.floor(value / 60);

              // Calculate remaining seconds
              const seconds = (value % 60).toFixed(3).toString().padStart(6, 0);

              return `${minutes}:${seconds}`;
            },
          },
        },
      },

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

          callbacks: {
            title: (tooltipItems) => `Lap ${tooltipItems[0].label}`,
            label: (tooltipItem) => {
              const dataset = datasets[tooltipItem.datasetIndex];
              const value = tooltipItem.raw.y;

              const lapCompound = dataset.laps[tooltipItem.dataIndex][1];

              // Calculate minutes
              const minutes = Math.floor(value / 60);

              // Calculate remaining seconds and ensure it is padded at the start with a 0
              const seconds = (value % 60).toFixed(3).toString().padStart(6, 0);

              return `${dataset.label}: ${minutes}:${seconds} [${lapCompound}]`;
            },
          },
        },

        legend: {
          position: "bottom",

          labels: {
            padding: 32,
          },
        },
      },
    },
  });
};

// Once the page has loaded, generate a lap graph

document.addEventListener("DOMContentLoaded", () => {
  if (!ctx) return;

  populateSeasons();

  yearSelector.addEventListener("change", () => populateTracks());

  trackSelector.addEventListener("change", () => populateSessions());

  sessionSelector.addEventListener("change", () =>
    generateLapGraph(
      yearSelector.value,
      trackSelector.value,
      sessionSelector.value,
    ),
  );
});
