from flask import request
from web_socket_server import WebSocketServer, socketio, app

app = WebSocketServer().create_app()
users = {}

@socketio.on('connect')
def handle_connect():
    try:
        print('Connected')
    except Exception as e:
        print(f'Error in connecting: {e}')

@socketio.on('disconnect')
def handle_disconnect():
    try:
        user_sid = request.sid
        username= users.get(user_sid)
        if username:
            del users[user_sid]
            print(f'{username} Disconnected')
            socketio.emit('user_list', list(users.values()))
    except Exception as e:
        print(f'Error in disconnecting: {e}')

@socketio.on('send_message')
def handle_message(data):
    try:
        username = data['username']
        message_body = data['messageBody']
        timestamp = data['timestamp']
        print(f'Receied message: {message_body} from {username} at {timestamp}')
        message = {'username': username,
                   'body': message_body,
                   'timestamp': timestamp}
        socketio.emit('message', message)
    except Exception as e:
        print(f'Error in messaging: {e}')

@socketio.on('join')
def handle_join(username):
    try:
        users[request.sid] = username
        print(f'{username} has joined the chat')
        socketio.emit('user_list', list(users.values()))
    except Exception as e:
        print(f'Error in joining: {e}')

@socketio.on('leave')
def handle_leave():
    try:
        user_sid = request.sid
        username= users.get(user_sid)
        if username:
            del users[user_sid]
            print(f'{username} has left the chat')
            socketio.emit('user_list', list(users.values()))
    except Exception as e:
        print(f'Error in leaving: {e}')

if __name__ == '__main__':
    socketio.run(app)