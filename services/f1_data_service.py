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
        
        all_events = fastf1.get_event_schedule(currentYear, include_testing=False)

        remainingSprintCount = 0
        remainingRaceCount = 0

        # Loop through all events to find future and ongoing ones
        for event in all_events.iloc:
            eventRaceDate = event['Session5DateUtc']

            # Ensure that both dates are timezone aware using UTC
            if eventRaceDate.tzinfo is None:
                eventRaceDate = eventRaceDate.replace(tzinfo=timezone.utc)

            # Check if the event is either future or currently ongoing (today)
            if eventRaceDate >= currentDate:
                # Count the event as a race
                remainingRaceCount += 1

                # If it's a sprint weekend, increment the sprint count and the sprint hasn't happened yet
                if event['EventFormat'] == "sprint_qualifying":
                    sprintSessionDate = event["Session3DateUtc"]

                    if sprintSessionDate.tzinfo is None:
                        sprintSessionDate = sprintSessionDate.replace(tzinfo=timezone.utc)

                    if sprintSessionDate >= currentDate:
                        remainingSprintCount += 1

        # Calculate maximum available points (25 points for race win, 1 for fastest lap, 8 for sprint win)
        maximumAvailablePoints = remainingRaceCount * RACE_WIN_POINTS + remainingSprintCount * SPRINT_WIN_POINTS

        return maximumAvailablePoints

    except Exception as e:
        return {'error': str(e)}

def get_lap_times():
    try:
        drivers = ["VER", "NOR", "ZHO"]

        times = {}

        session = fastf1.get_session(2024, 19, 'Sprint')
        session.load()


        # Pick laps for all requested drivers at once
        laps = session.laps.pick_drivers(drivers)

        # Iterate over each driver and collect their lap times
        for driver in drivers:
            driver_laps = laps.pick_drivers(driver)
            driver_times = []

            for lap in driver_laps.iloc:
                # If no time is set, ignore it
                if lap["LapTime"] is pd.NaT:
                    continue
        
                # Remove "0 days" from the time string
                formattedLapTime = str(lap["LapTime"]).split("days ")[1]
                driver_times.append([formattedLapTime, lap["Compound"]])

            times[driver] = driver_times

        # Times is an object returned with key values pairs of a driver name => a subarray of the lap times and compond used
        return times
    except Exception as e:
        return {'error': str(e)}
