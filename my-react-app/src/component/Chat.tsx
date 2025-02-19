import React, { useEffect, useState} from 'react';
import io from 'socket.io-client';
import { Container, Form, Button, Col, Card, Row, ListGroup } from 'react-bootstrap';


const socket = io('http://127.0.0.1:5000')

type ChatMessage = {
  username: string;
  body: string;
  timestamp: string;
}

const Chat: React.FC = () => {


  const [username, setUsername] = useState('');
  const [usersList, setUsersList] = useState<string[]>([]) // Logs new users as they join the chat app
  const [usernameFilter, setUsernameFilter] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messageHistory, setMessageHistory] = useState<ChatMessage[]>([])
  const [joinedChat, setJoinedChat] = useState(false)

  useEffect(()=> {
    const savedMessages =localStorage.getItem('chatMessages');
    if (savedMessages) {
        setMessageHistory(JSON.parse(savedMessages));
    }

    socket.on('message', message => {
        setMessageHistory((prevMessages) => {
            const updatedMessages = [...prevMessages, message];
            localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
            return updatedMessages;
        });
    });

    socket.on('user_list', (users:string[]) => {
      setUsersList(users)
    });
    
    return () => {
      socket.off('message')
      socket.off('user_list')
    }
  }, [])

  const sendMessage = () => {
    if (messageBody.trim() && username.trim() ) {
      const timestamp = new Date().toLocaleString();
      socket.emit('send_message', {username, messageBody, timestamp});
      setMessageBody('');

    }
  }
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && messageBody.trim()) {
        e.preventDefault()
        sendMessage()
    }
  } 

  const joinChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim() && !joinedChat) {
      socket.emit('join', username)
      setJoinedChat(true);
      setMessageHistory([]);
    }
  }

  const filteredMessages = messageHistory.filter(
    (message) => message.username.includes(usernameFilter))

  const leaveChat = (e:React.MouseEvent) => {
    e.preventDefault()
    if (joinedChat) {
      socket.emit('leave');
      setJoinedChat(false);
    }
  }
  
  return (
    <Container>
      <Row>
        <Col>
              <h3>Chat Room App</h3>
              {joinedChat ? <p>You are in the chat room</p> : <p>Click the join chat button to participate</p>}
        </Col>
      </Row>

      <Row>
        <Col>
          <h5>Users in Chat</h5>
          <ListGroup>
            {usersList.map((user, index) => (
              <ListGroup.Item key={index}>{user}<br/></ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>

      <Row>
        <Col>
        <Form.Label>Filter by Username</Form.Label>
        <Form.Control
        type='text'
        placeholder="Filter by username..."
        value={usernameFilter}
        onChange={(e) => setUsernameFilter(e.target.value)}
        />
        </Col>  
      </Row>  
      
      <Row>
            <ListGroup>
              {filteredMessages.map((message, index) => (
                <Card key={index}>
                  <Card.Title>{message.username} at {message.timestamp}</Card.Title>
                  <Card.Body>{message.body}</Card.Body>
                </Card>
              ))}
            </ListGroup>
        </Row>
        <Row>
          <Col>
              <Form>
                <Form.Control
                type='text'
                placeholder='Enter message here. Press enter key to send'
                value={messageBody}
                onChange= {(e) => setMessageBody(e.target.value)}
                disabled={!joinedChat || !username.trim()}
                onKeyDown={handleKeyPress}
                />
              </Form>
          </Col>
        </Row>
        {!joinedChat && (
          <Row>
            <Col>
              <Form>
                <Form.Control
                type="text"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                />
                <Button variant='success' onClick={joinChat} disabled={!username.trim()}>Join Chat</Button>
              </Form>
            </Col>
          </Row>
        )}
        {joinedChat && (
          <Row>
            <Col>
              <Button variant='danger' onClick={leaveChat}>Leave Chat</Button>
            </Col>
          </Row>
        )}
      
    </Container>
  )
}

export default Chat
