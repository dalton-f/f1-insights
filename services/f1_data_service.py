import fastf1
import pandas as pd

from fastf1.ergast import Ergast
from datetime import datetime, timezone


# Note: fastest lap point is being removed for the 25 and 26 season, so this will need to be updated
RACE_WIN_POINTS = 26
SPRINT_WIN_POINTS = 8

ergast = Ergast()

def get_current_driver_standings():
    try:
        standings = ergast.get_driver_standings(season="current", result_type='raw')

        return standings
    except Exception as e:
        return {'error': str(e)}
    
def get_maximum_available_points():
    try:
        currentYear = datetime.now().year
        currentDate = datetime.now(timezone.utc)

        remainingEvents = fastf1.get_events_remaining(include_testing=False)

        remainingRaceCount = len(remainingEvents)
        remainingSprintCount = 0

        # Get the most recent previous round's data
        previousRoundNumber = remainingEvents.iloc[0]["RoundNumber"] - 1
        previousEvent = fastf1.get_event(currentYear, previousRoundNumber)

        # Session5 will always be the race for sprint_qualifying and conventional events
        previousEventRaceDate = previousEvent["Session5DateUtc"]

        # Ensures both dates are offset-aware for comparsions
        if previousEventRaceDate.tzinfo is None:
                previousEventRaceDate = previousEventRaceDate.replace(tzinfo=timezone.utc)

        # If the previous event is ongoing, include an extra race - this ensures the point count updates during an ongoing event and stays accurate
        if(previousEventRaceDate > currentDate):
            remainingRaceCount += 1

            # Check if the ongoing event has a sprint
            if(previousEvent["EventFormat"] == "sprint_qualifying"):
                previousEventSprintDate = previousEvent["Session3DateUtc"]

                # Ensures both dates are offset-aware for comparsions
                if previousEventSprintDate.tzinfo is None:
                    previousEventSprintDate = previousEventSprintDate.replace(tzinfo=timezone.utc)

                # If the sprint event hasn't occured, add an extra remaining sprint
                if previousEventSprintDate > currentDate:
                    remainingSprintCount += 1

        # Loop over the remaining events and check for sprint weekends
        for event in remainingEvents.iloc:
            if(event["EventFormat"] == "sprint_qualifying"):
                remainingSprintCount += 1

        # Calculate maximum available points (25 points for race win, 1 for fastest lap, 8 for sprint win)
        maximumAvailablePoints = remainingRaceCount * RACE_WIN_POINTS + remainingSprintCount * SPRINT_WIN_POINTS

        return maximumAvailablePoints

    except Exception as e:
        return {'error': str(e)}

def get_lap_times():
    try:
        drivers = ["VER", "ZHO"]

        data = {}

        session = fastf1.get_session(2024, 18, 'R')
        session.load()

        results = session.results

        # Pick laps for all requested drivers at once
        laps = session.laps.pick_drivers(drivers)

        # Iterate over each driver and collect their lap times
        for driver in drivers:
            driver_laps = laps.pick_drivers(driver)
            driver_times = []

            # Get the team colour of the driver
            driver_info = results[results['Abbreviation'] == driver]
            team_colour = driver_info['TeamColor'].values[0]

            for lap in driver_laps.iloc:
                # If no time is set, ignore it
                if lap["LapTime"] is pd.NaT:
                    continue
        
                # Remove "0 days" from the time string
                formattedLapTime = str(lap["LapTime"]).split("days ")[1]
                driver_times.append([formattedLapTime, lap["Compound"]])

            # Add a new subobject to the data object assigned to the drivers abbrevation containing an array of their lap times and a hexcode of their team colour
            data[driver] = {
                "team_color": team_colour,
                "lap_times": driver_times
            }

        return data
    except Exception as e:
        return {'error': str(e)}
