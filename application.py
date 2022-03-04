from flask import Flask, render_template, request, json
import DBInteractions
import time
from datetime import datetime

application = Flask(__name__)

def getHour():
    # get current epoch hour
    t = int(time.time())
    tHour = t - t % 3600
    return tHour


@application.route('/')
@application.route('/home')
def home():
    """Renders the home page."""
    return render_template(
        'index.html',
        title='Home Page',
        year=datetime.now().year,
    )


@application.route('/contact')
def contact():
    """Renders the contact page."""
    return render_template(
        'contact.html',
        title='Contact',
        year=datetime.now().year,
        message='Your contact page.'
    )


@application.route('/about')
def about():
    """Renders the about page."""
    return render_template(
        'about.html',
        title='About',
        year=datetime.now().year,
        message='Your application description page.'
    )


@application.route('/howitworks')
def howitworks():
    """Renders the about page."""
    return render_template(
        'howitworks.html',
        title='How it Works',
        year=datetime.now().year,
        message='How it Works page.'
    )





@application.route('/getWaterData', methods=['GET'])
def getWaterData():
    # get water data from past 2 days
    numHours = 48
    currentHour = getHour()
    waterData = []
    for i in range(numHours + 1):
        nextEpoch = currentHour - 3600 * (numHours - i)
        # get the data in table from that hour
        tableItem = DBInteractions.getWaterData(epoch=nextEpoch)

        # check to see if there is a valid entry for the hour received
        # if no data, load default values
        try:
            tableItem['Item']['flow'] = float(tableItem['Item']['flow'])
            tableItem['Item']['t+1'] = int(tableItem['Item']['t+1'])
            tableItem['Item']['t+2'] = int(tableItem['Item']['t+2'])
            tableItem['Item']['t+3'] = int(tableItem['Item']['t+3'])
            tableItem['Item']['t+4'] = int(tableItem['Item']['t+4'])
            tableItem['Item']['t+5'] = int(tableItem['Item']['t+5'])
            newChunk = tableItem['Item']
        except KeyError:
            newChunk = {
                'Epoch': nextEpoch,
                'flow': 0,
                'twinRain1h': 0,
                'twinRain3h': 0,
                'bedRain1h': 0,
                'bedRain3h': 0,
                'streetsRain1h': 0,
                'streetsRain3h': 0,
                't+1': 0,
                't+2': 0,
                't+3': 0,
                't+4': 0,
                't+5': 0
            }

        # don't push most recent chunks if they don't have estimations yet
        if i >= numHours - 1:
            if float(newChunk['t+1']) > 0:
                waterData.append(newChunk)
        else:
            waterData.append(newChunk)

    if request.method == 'GET':
        return json.jsonify(waterData)


