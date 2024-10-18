from flask import Flask, render_template, jsonify

import fastf1

app = Flask(__name__)

@app.route("/")
def index():
    return render_template('index.html')

@app.route('/api/f1data')
def get_f1_data():
    session = fastf1.get_session(2019, 'Monza', 'Q')

    session.load(telemetry=False, laps=False, weather=False)
    
    vettel = session.get_driver('VET')
    
    f1_data = {
        "driver": vettel['FirstName'],
    }
    
    return jsonify(f1_data)

if __name__ == '__main__':
    app.run(debug=True)