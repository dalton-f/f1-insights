import fastf1
import pandas as pd

from flask import jsonify

from fastf1.ergast import Ergast
from datetime import datetime, timezone

fastf1.Cache.enable_cache('cache') 

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

def get_lap_times(year, round, session_name):
    try:
        data = {}

        # Load the session data
        session = fastf1.get_session(year, round, session_name)
        session.load()

        # Get the results and list of all drivers in the session
        results = session.results
        all_drivers = results['Abbreviation'].unique()

        # Iterate over each driver and collect their lap times
        for driver in all_drivers:
            driverLaps = session.laps.pick_drivers(driver)
            driverTimes = []

            # Get the team color of the driver
            driverInfo = results[results['Abbreviation'] == driver]
            teamColor = driverInfo['TeamColor'].values[0]

            for lap in driverLaps.itertuples():
                # If no time is set, ignore it (laps under safety car do not count)
                if lap.LapTime is pd.NaT:
                    continue

                # Format lap time and collect other lap details
                formattedLapTime = str(lap.LapTime).split("days ")[1]
                driverTimes.append([formattedLapTime, lap.Compound, lap.LapNumber])

            # Store driver lap times and team color in an object
            data[driver] = {
                "team_color": teamColor,
                "lap_times": driverTimes
            }

        return data
    except Exception as e:
        return {'error': str(e)}

def get_next_event():
    currentYear = datetime.now().year
    currentDate = datetime.now(timezone.utc)

    remainingEvents = fastf1.get_events_remaining(include_testing=False)

    previousRoundNumber = remainingEvents.iloc[0]["RoundNumber"] - 1
    previousEvent = fastf1.get_event(currentYear, previousRoundNumber)

    # Session5 will always be the race for sprint_qualifying and conventional events
    previousEventRaceDate = previousEvent["Session5DateUtc"]

    # Ensures both dates are offset-aware for comparsions
    if previousEventRaceDate.tzinfo is None:
        previousEventRaceDate = previousEventRaceDate.replace(tzinfo=timezone.utc)

    event = previousEvent if previousEventRaceDate > currentDate else remainingEvents.iloc[0]


    if isinstance(event, fastf1.events.Event):
        event = {
            'RoundNumber': int(event['RoundNumber']),
            'OfficialEventName': str(event['OfficialEventName']),
            "Country": str(event["Country"]),
            "EventName": str(event["EventName"]),
            'Session1DateUtc': event['Session1DateUtc'].isoformat(),
            'Session5DateUtc': event['Session5DateUtc'].isoformat(),
        }

    return event

# Adapted from https://docs.fastf1.dev/gen_modules/examples_gallery/plot_results_tracker.html

def get_points_change(year):
    drivers = ["VER", "NOR", "PIA"]

    output = {}

    currentDate = datetime.now()

    try:
        schedule = ergast.get_race_schedule(year) 

        for driverCode in drivers:
            driverOutput = []

            totalPoints = 0

            for rnd in schedule.iloc:
                # Will only update after a full weekend event is completed
                if(rnd["raceDate"] < currentDate):
                    raceResults = ergast.get_race_results(season=year, round = rnd["round"]).content[0]

                    sprintResults = ergast.get_sprint_results(season=year, round = rnd["round"])

                    raceResults = raceResults[raceResults["driverCode"] == driverCode]

                    # Prevents an error incase a driver hasn't driven every race in the season
                    if not raceResults.empty:
                        totalPoints += raceResults["points"].iloc[0]

                    # Incude sprint points if needed

                    if(sprintResults.content and not raceResults.empty):
                        sprintResults = sprintResults.content[0]

                        sprintResults = sprintResults[sprintResults["driverCode"] == driverCode]

                        totalPoints += sprintResults["points"].iloc[0]

                    driverOutput.append({
                        "x": int(rnd["round"]),
                        "y": totalPoints
                    })

            output[driverCode] = driverOutput          

        return output
    except Exception as e:
        return {'error': str(e)}
    
def get_event_schedule(year):
    try:
        schedule = fastf1.get_event_schedule(year, include_testing=False)

        rounds = []

        for round in schedule.iloc:
            data = [
                round["EventName"],
                round["EventFormat"]
            ]

            rounds.append(data)

        return rounds
    except Exception as e:
        return {'error': str(e)}