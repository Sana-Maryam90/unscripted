# 🎮 Multiplayer Game Test Guide

## 🚀 Complete Multiplayer Flow Test

### **Step 1: Start the Server**
```bash
npm run dev
```
Look for these logs:
- `> Ready on http://localhost:3000`
- `> Socket.io server running for real-time multiplayer`

### **Step 2: Create a Multiplayer Room**
1. Go to `http://localhost:3000/multiplayer`
2. **Select a movie** (click on any movie card)
3. **Enter your name** (e.g., "Alice")
4. **Click "Create Multiplayer Room"**
5. You should be redirected to `/room/XXXX` (4-letter code)

**Expected Server Logs:**
```
🎮 Create room request: { playerName: 'Alice', playerId: 'player_xxx', movieId: 'harry-potter-1', mode: 'multiplayer-game' }
🎮 Game room XXXX created by Alice
```

### **Step 3: Join from Another Browser**
1. **Open a new browser window/incognito tab**
2. Go to `http://localhost:3000/join` OR `http://localhost:3000/multiplayer`
3. **Enter a different name** (e.g., "Bob")
4. **Enter the room code** from Step 2
5. **Join the room**

**Expected Server Logs:**
```
🚪 Join room request: { roomCode: 'XXXX', playerId: 'player_yyy', playerName: 'Bob' }
✅ Bob joined room XXXX
```

### **Step 4: Test Real-time Features**

#### **Chat System** ✅
- Send messages from both browsers
- Messages should appear instantly on both screens
- System messages should show when players join/leave

#### **Player Management** ✅
- Both players should see each other in the players list
- Host should have "HOST" badge
- Online status indicators should be green

#### **Ready System** ✅
- Both players click "Ready" button
- Ready status should sync in real-time
- Host should see "Start Game" button when all ready

#### **Movie Selection** ✅
- Host clicks "Start Game" to enter movie selection
- Any player can select a movie
- Selection should sync to all players instantly
- System message should announce the selection

#### **Game Progression** ✅
- Host can start the story after movie selection
- Game state should advance to character selection
- All players should see the state change

### **Step 5: Test Edge Cases**

#### **Player Disconnection**
- Close one browser tab
- Other player should see "Player left" message
- Player list should update

#### **Reconnection**
- Reopen the browser and rejoin with same name
- Should reconnect to existing session
- Chat history should be preserved

#### **Room Persistence**
- Rooms should persist until all players leave
- Server should clean up empty rooms

## 🔧 Debugging

### **Client-Side Console Logs**
Look for these in browser console:
- `🔌 Connected to game server`
- `✅ Joined game room:`
- `👤 Player joined:`
- `🎬 Movie selected:`
- `🚀 Game started!`

### **Server-Side Console Logs**
Look for these in terminal:
- `🔌 Client connected:`
- `🎮 Create room request:`
- `🚪 Join room request:`
- `🎯 Player is ready/not ready`
- `🎬 Player selected movie`
- `🚀 Game started in room`

### **Common Issues**
1. **"Connection not ready"** - Server not running with Socket.io
2. **"Room not found"** - Room code typo or expired
3. **Messages not syncing** - Socket connection issues
4. **Players not showing** - Join room event not firing

## ✅ Success Criteria

The multiplayer system is working correctly if:
- [x] Real-time room creation via Socket.io
- [x] Cross-browser player joining
- [x] Instant chat message synchronization
- [x] Player status and ready state sync
- [x] Movie selection with real-time updates
- [x] Game state progression (waiting → movie-selection → character-selection)
- [x] Proper cleanup on player disconnect
- [x] Host privileges and controls

## 🎯 Next Steps

Once basic multiplayer is confirmed working:
1. **Character Selection** - Let players choose characters from selected movie
2. **Turn-based Gameplay** - Implement story progression with voting
3. **AI Story Generation** - Integrate OpenAI for dynamic story creation
4. **Game Completion** - Show final story and statistics