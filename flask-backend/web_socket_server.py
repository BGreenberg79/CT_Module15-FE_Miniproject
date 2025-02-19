from flask import Flask
from flask_socketio import SocketIO

socketio = SocketIO()
app = Flask(__name__)

class WebSocketServer:
    def __init__(self, debug=False):
        self.create_app(debug)

    def create_app(self, debug=False):
        """Creates web socket application"""
        
        app.debug = debug
        socketio.init_app(app, cors_allowed_origins="*")
        return app