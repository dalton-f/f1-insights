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
