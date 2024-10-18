import fastf1
from fastf1.ergast import Ergast

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
        events = fastf1.get_events_remaining(include_testing=False)

        remainingRaceCount = len(events)
        remainingSprintCount = 0

        # remainingSprintCount = events[events['EventFormat'] == "sprint_qualifying"].shape[0]

        for event in events.iloc:
            if event['EventFormat'] == "sprint_qualifying":
                remainingSprintCount += 1

        # 25 points for a race win, 1 point for fastest lap, 8 points for a sprint race win
        maximumAvailablePoints = remainingRaceCount * RACE_WIN_POINTS + (remainingSprintCount * SPRINT_WIN_POINTS)

        return maximumAvailablePoints
    except Exception as e:
        return {'error': str(e)}

def get_lap_times():
    try:
        drivers = ["LEC", "PIA", "BOT"]

        times = {}

        session = fastf1.get_session(2024, 'Monza', 'R')
        session.load()

        # Pick laps for all requested drivers at once
        laps = session.laps.pick_drivers(drivers)

        # Iterate over each driver and collect their lap times
        for driver in drivers:
            driver_laps = laps.pick_drivers(driver)
            driver_times = []

            for lap in driver_laps.iloc:
                # Remove "0 days" from the time string
                formattedLapTime = str(lap["LapTime"]).split("days ")[1]
                driver_times.append([formattedLapTime, lap["Compound"]])

            times[driver] = driver_times

        # Times is an object returned with key values pairs of a driver name => a subarray of the lap times and compond used
        return times
    except Exception as e:
        return {'error': str(e)}
