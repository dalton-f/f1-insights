from flask import Flask, render_template, jsonify, request
# Import all services
from services.f1_data_service import get_current_driver_standings, get_maximum_available_points, get_lap_times, get_points_change, get_next_event, get_event_schedule

app = Flask(__name__)

@app.route("/")
def index():
    return render_template('index.html')

@app.route('/telemetry-analysis')
def telemetry_analysis():
    return render_template('telemetry-analysis.html')

# API Endpoints

@app.route('/api/f1-data/driver-standings')
def get_driver_standings():
    standings = get_current_driver_standings()
    return jsonify(standings)

@app.route('/api/f1-data/event-schedule', methods=['POST'])
def event_schedule():
    data = request.get_json()

    year = int(data.get("year"))

    schedule = get_event_schedule(year)

    return jsonify(schedule)

@app.route('/api/f1-data/remaining-points')
def remaining_points():
    points = get_maximum_available_points()
    
    return jsonify(points)

@app.route('/api/f1-data/laps', methods=['POST']) 
def get_laps():
     # Parse incoming JSON data
    data = request.get_json() 

    year = data.get('year', None)
    round = data.get('round', None) 
    session = data.get('session', None)

    laps = get_lap_times(year, round, session)

    return jsonify(laps)

@app.route('/api/f1-data/next-event') 
def next_event():
    data = get_next_event()

    return data

@app.route('/api/f1-data/points-across-season', methods=['POST']) 
def get_points_across_season():
    data = request.get_json()

    year = data.get("year", None)

    pointsChange = get_points_change(year)

    return jsonify(pointsChange)
    
if __name__ == '__main__':
    app.run(debug=True)
