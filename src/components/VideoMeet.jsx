import React, { useEffect, useState, useRef } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Container,
  Typography,
  IconButton,
  Stack,
  Badge,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { io } from "socket.io-client";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import ShareIcon from "@mui/icons-material/Share";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: "center",
  marginTop: "20px",
  color: (theme.vars ?? theme).palette.text.secondary,
  ...theme.applyStyles?.("dark", {
    backgroundColor: "#1A2027",
  }),
}));

const SERVER_URL = "https://backendweb-2.onrender.com";
const PEER_CONFIG = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
const handleShare = async () => {
  const shareData = {
    title: document.title,
    text: "Check out this meeting link:",
    url: window.location.href, // current page URL
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      console.log("Link shared successfully");
    } catch (err) {
      console.error("Error sharing:", err);
    }
  } else {
    // fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }
};

export default function VideoMeet() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef();
  const connections = useRef({});
  const chatEndRef = useRef(null); // ✅ for auto-scroll

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [videos, setVideos] = useState([]);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [newMessage, setNewMessage] = useState(0);
  const [cameraStream, setCameraStream] = useState(null);

  // Chatbox UI State
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // ✅ Get permissions and preview
  const getPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      window.localStream = stream;
      setCameraStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        await localVideoRef.current.play().catch(() => {});
      }
      detectVoice(stream, "local");
      setVideoAvailable(true);
      setAudioAvailable(true);
    } catch (err) {
      console.error("Permission error:", err);
      setVideoAvailable(false);
      setAudioAvailable(false);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  // 🎤 Detect active speaker
  const detectVoice = (stream, id) => {
    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const mic = audioContext.createMediaStreamSource(stream);
      const data = new Uint8Array(analyser.frequencyBinCount);
      mic.connect(analyser);

      const detect = () => {
        analyser.getByteFrequencyData(data);
        const volume = data.reduce((a, b) => a + b, 0) / data.length;
        if (volume > 20) setActiveSpeaker(id);
        requestAnimationFrame(detect);
      };
      detect();
    } catch (err) {
      console.log("Audio detection disabled:", err);
    }
  };

  // 📡 Socket setup
  const connectToSocketServer = () => {
    socketRef.current = io.connect(SERVER_URL, { secure: false });
    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;
      socketRef.current.emit("join-call", window.location.href);

      socketRef.current.on("user-left", (id) => {
        setVideos((prev) => prev.filter((v) => v.socketId !== id));
        delete connections.current[id];
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((clientId) => {
          if (connections.current[clientId]) return;
          const pc = new RTCPeerConnection(PEER_CONFIG);
          connections.current[clientId] = pc;

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socketRef.current.emit(
                "signal",
                clientId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          pc.ontrack = (event) => {
            const [stream] = event.streams;
            setVideos((prev) => {
              if (prev.find((v) => v.socketId === clientId)) return prev;
              detectVoice(stream, clientId);
              return [
                ...prev,
                {
                  socketId: clientId,
                  stream,
                  username: `User-${clientId.slice(0, 4)}`,
                },
              ];
            });
          };

          if (window.localStream) {
            window.localStream
              .getTracks()
              .forEach((t) => pc.addTrack(t, window.localStream));
          }
        });

        if (id === socketIdRef.current) {
          for (const otherId in connections.current) {
            if (otherId === socketIdRef.current) continue;
            const pc = connections.current[otherId];
            pc.createOffer().then((desc) => {
              pc.setLocalDescription(desc).then(() => {
                socketRef.current.emit(
                  "signal",
                  otherId,
                  JSON.stringify({ sdp: pc.localDescription })
                );
              });
            });
          }
        }
      });
    });
  };

  // ✅ Clean message listener (only once)
  useEffect(() => {
    if (!socketRef.current) return;

    const handleChatMessage = (msg) => {
      setMessages((prev) => {
        const exists = prev.some(
          (m) =>
            m.text === msg.text &&
            m.time === msg.time &&
            m.sender === msg.sender
        );
        if (exists) return prev;
        return [...prev, msg];
      });
      if (!chatOpen) setNewMessage((prev) => prev + 1);
    };

    socketRef.current.on("chat-message", handleChatMessage);
    return () => socketRef.current.off("chat-message", handleChatMessage);
  }, [chatOpen]);

  const gotMessageFromServer = (fromId, message) => {
    const signal = JSON.parse(message);
    if (fromId === socketIdRef.current) return;

    const pc = connections.current[fromId];
    if (!pc) return;

    if (signal.sdp) {
      pc.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(
        () => {
          if (signal.sdp.type === "offer") {
            pc.createAnswer().then((desc) => {
              pc.setLocalDescription(desc).then(() => {
                socketRef.current.emit(
                  "signal",
                  fromId,
                  JSON.stringify({ sdp: pc.localDescription })
                );
              });
            });
          }
        }
      );
    }

    if (signal.ice) pc.addIceCandidate(new RTCIceCandidate(signal.ice));
  };

  const connect = async () => {
    setAskForUsername(false);
    await getPermissions();
    connectToSocketServer();
  };

  const leaveCall = () => {
    Object.values(connections.current).forEach((pc) => pc.close());
    socketRef.current?.disconnect();
    window.localStream?.getTracks().forEach((t) => t.stop());
    setVideos([]);
    setAskForUsername(true);
    setUsername("");
  };

  const toggleVideo = () => {
    window.localStream
      ?.getVideoTracks()
      .forEach((t) => (t.enabled = !t.enabled));
    setVideoAvailable((prev) => !prev);
  };

  const toggleAudio = () => {
    window.localStream
      ?.getAudioTracks()
      .forEach((t) => (t.enabled = !t.enabled));
    setAudioAvailable((prev) => !prev);
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const screenTrack = screenStream.getVideoTracks()[0];
        Object.values(connections.current).forEach((pc) => {
          const sender = pc
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");
          if (sender) sender.replaceTrack(screenTrack);
        });
        localVideoRef.current.srcObject = screenStream;
        setScreenSharing(true);
        screenTrack.onended = () => toggleScreenShare();
      } catch (err) {
        console.error("Screen share error:", err);
      }
    } else {
      try {
        const camTrack = cameraStream?.getVideoTracks()[0];
        if (!camTrack) return;
        Object.values(connections.current).forEach((pc) => {
          const sender = pc
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");
          if (sender) sender.replaceTrack(camTrack);
        });
        localVideoRef.current.srcObject = window.localStream;
        setScreenSharing(false);
      } catch (err) {
        console.error("Error restoring camera:", err);
      }
    }
  };

  const toggleChat = () => {
    setChatOpen((prev) => !prev);
    if (!chatOpen) setNewMessage(0);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const msgData = {
      sender: username || "You",
      text: chatInput,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, msgData]);
    setChatInput("");
    socketRef.current?.emit("chat-message", msgData);
  };

  // ✅ Auto-scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => () => leaveCall(), []);

  const allVideos = [
    {
      socketId: "local",
      username: username || "You",
      stream: window.localStream,
    },
    ...videos,
  ];

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 5, mb: 4 }}>
        {askForUsername ? (
          <>
            <Typography
              variant="h5"
              sx={{ mb: 1, fontWeight: "bold", textAlign: "center" }}
            >
              Enter into Room
            </Typography>
            <Grid
              container
              spacing={3}
              alignItems="center"
              justifyContent="center"
            >
              <Grid item xs={12} sm={10} md={6}>
                <Item>
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                      backgroundColor: "#000",
                      objectFit: "cover",
                    }}
                  />
                </Item>
              </Grid>
              <Grid item xs={12} sm={10} md={4}>
                <Item>Connect With people and Call unlimited free of cost</Item>
                <Item>
                  <TextField
                    fullWidth
                    label="Username"
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Item>
                <Item>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ py: 1.3, fontWeight: 600 }}
                    onClick={connect}
                    disabled={!username.trim()}
                  >
                    Connect
                  </Button>
                </Item>
              </Grid>
            </Grid>
          </>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: activeSpeaker
                  ? "2fr 1fr"
                  : "repeat(auto-fit, minmax(300px, 1fr))",
              },
              gap: 2,
              backgroundColor: "#202124",
              borderRadius: "16px",
              p: 2,
              minHeight: "70vh",
              transition: "all 0.3s ease",
            }}
          >
            {/* Active Speaker */}
            {activeSpeaker && (
              <Box
                sx={{
                  position: "relative",
                  borderRadius: "12px",
                  overflow: "hidden",
                  backgroundColor: "#000",
                  aspectRatio: "16/9",
                }}
              >
                <video
                  ref={(ref) => {
                    if (!ref) return;
                    const stream =
                      activeSpeaker === "local"
                        ? window.localStream
                        : videos.find((v) => v.socketId === activeSpeaker)
                            ?.stream;
                    if (stream) ref.srcObject = stream;
                  }}
                  autoPlay
                  muted={activeSpeaker === "local"}
                  playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <Typography
                  variant="subtitle2"
                  sx={{
                    position: "absolute",
                    bottom: 10,
                    left: 12,
                    color: "#fff",
                    backgroundColor: "rgba(32,33,36,0.7)",
                    px: 1.6,
                    py: 0.3,
                    borderRadius: "20px",
                  }}
                >
                  {activeSpeaker === "local"
                    ? username || "You"
                    : videos.find((v) => v.socketId === activeSpeaker)
                        ?.username || "Speaker"}
                </Typography>
              </Box>
            )}

            {/* Thumbnails */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 1,
              }}
            >
              {allVideos
                .filter((v) => v.socketId !== activeSpeaker)
                .map((v) => (
                  <Box
                    key={v.socketId}
                    sx={{
                      position: "relative",
                      borderRadius: "12px",
                      overflow: "hidden",
                      aspectRatio: "16/9",
                    }}
                  >
                    <video
                      ref={(ref) => ref && (ref.srcObject = v.stream)}
                      autoPlay
                      muted={v.socketId === "local"}
                      playsInline
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{
                        position: "absolute",
                        bottom: 10,
                        left: 12,
                        color: "#fff",
                        backgroundColor: "rgba(32,33,36,0.7)",
                        px: 1.6,
                        py: 0.3,
                        borderRadius: "20px",
                      }}
                    >
                      {v.username}
                    </Typography>
                  </Box>
                ))}
            </Box>

            {/* Control Bar */}
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              sx={{ mt: 2, alignItems: "center" }}
            >
              <IconButton onClick={toggleAudio} color="inherit">
                {audioAvailable ? (
                  <MicIcon sx={{ color: "#fff" }} />
                ) : (
                  <MicOffIcon sx={{ color: "red" }} />
                )}
              </IconButton>
              <IconButton onClick={toggleVideo} color="inherit">
                {videoAvailable ? (
                  <VideocamIcon sx={{ color: "#fff" }} />
                ) : (
                  <VideocamOffIcon sx={{ color: "red" }} />
                )}
              </IconButton>
              <IconButton onClick={handleShare} color="primary">
                <ShareIcon sx={{ color: "red" }} />
              </IconButton>

              <IconButton onClick={toggleScreenShare} color="inherit">
                {screenSharing ? (
                  <StopScreenShareIcon sx={{ color: "orange" }} />
                ) : (
                  <ScreenShareIcon sx={{ color: "#fff" }} />
                )}
              </IconButton>
              <IconButton onClick={leaveCall} color="error">
                <CallEndIcon sx={{ color: "red" }} />
              </IconButton>

              <Badge badgeContent={newMessage} max={999} color="secondary">
                <IconButton style={{ color: "white" }} onClick={toggleChat}>
                  <ChatIcon />
                </IconButton>
              </Badge>
            </Stack>

            {/* Chat Drawer (Slide from Right) */}
            <Drawer
              anchor="right"
              open={chatOpen}
              onClose={toggleChat}
              PaperProps={{
                sx: {
                  width: { xs: "100%", sm: "350px" },
                  backgroundColor: "#F9F8F6",
                  color: "black",
                  p: 2,
                  height: "75vh",
                  display: "flex",
                  mt: "40px",
                  mr: "25px",
                  borderRadius: "20px",
                  flexDirection: "column",
                },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="h6">Chat</Typography>
                <IconButton onClick={toggleChat} sx={{ color: "black" }}>
                  <CloseIcon />
                </IconButton>
              </Stack>

              <Divider sx={{ my: 1, backgroundColor: "#333" }} />

              {/* Message List fills remaining space */}
              <List sx={{ flexGrow: 1, overflowY: "auto", mb: 2 }}>
                {messages.length === 0 ? (
                  <Typography
                    sx={{ textAlign: "center", mt: 2, color: "gray" }}
                  >
                    No messages yet
                  </Typography>
                ) : (
                  messages.map((msg, i) => {
                    const isOwn =
                      msg.sender === username || msg.sender === "You";
                    return (
                      <ListItem
                        key={i}
                        sx={{
                          display: "flex",
                          justifyContent: isOwn ? "flex-end" : "flex-start",
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: "70%",
                            p: 1.2,
                            borderRadius: "12px",
                            backgroundColor: isOwn ? "#1976d2" : "#e0e0e0",
                            color: isOwn ? "#fff" : "#000",
                            wordBreak: "break-word",
                          }}
                        >
                          {!isOwn && (
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600, color: "#0077cc" }}
                            >
                              {msg.sender}
                            </Typography>
                          )}
                          <Typography variant="body2">{msg.text}</Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              textAlign: "right",
                              opacity: 0.7,
                              fontSize: "0.7rem",
                            }}
                          >
                            {msg.time}
                          </Typography>
                        </Box>
                      </ListItem>
                    );
                  })
                )}
              </List>

              {/* Chat input stays fixed at bottom */}
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  InputProps={{
                    sx: { color: "blue" },
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSendMessage}
                  sx={{ fontWeight: 600 }}
                >
                  Send
                </Button>
              </Box>
            </Drawer>
          </Box>
        )}
      </Container>
    </>
  );
}
