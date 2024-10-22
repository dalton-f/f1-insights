from flask import Flask, render_template, jsonify, request
# Import all services
from services.f1_data_service import get_current_driver_standings, get_maximum_available_points, get_lap_times

app = Flask(__name__)

@app.route("/")
def index():
    return render_template('index.html')

@app.route('/api/f1-data/driver-standings')
def get_driver_standings():
    standings = get_current_driver_standings()
    return jsonify(standings)

@app.route('/api/f1-data/remaining-points')
def remaining_points():
    points = get_maximum_available_points()
    
    return jsonify(points)

@app.route('/api/f1-data/laps', methods=['POST']) 
def get_laps():
     # Parse incoming JSON data
    data = request.get_json() 

    drivers = data.get('drivers', [])
    year = data.get('year', None)
    round = data.get('round', None) 
    session = data.get('session', None)

    laps = get_lap_times(year, round, session, drivers)

    return jsonify(laps)

if __name__ == '__main__':
    app.run(debug=True)
