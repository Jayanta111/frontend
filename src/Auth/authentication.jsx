import * as React from "react";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Box,
  Paper,
  Typography,
  Snackbar,
  ThemeProvider,
  createTheme,
  Container,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { AuthContext } from "../constants/AuthContext";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    background: {
      default: "#f4f6f8",
    },
  },
  shape: { borderRadius: 12 },
});

export default function Authentication() {
  const [formState, setFormState] = React.useState(0); // 0 = Sign In, 1 = Sign Up
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const handleAuth = async () => {
    try {
      if (formState === 0) {
        await handleLogin(username, password);
        setMessage("Login successful!");
        setOpen(true);
        setError("");
      } else {
        const result = await handleRegister(name, username, password);
        setMessage(result || "Registration successful!");
        setOpen(true);
        setError("");
        setFormState(0);
        setUsername("");
        setPassword("");
        setName("");
      }
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Something went wrong!";
      setError(msg);
      setMessage(msg);
      setOpen(true);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",

        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            width: "100%",
            borderRadius: 3,
            backgroundColor: "#F9F5F0",
            
           
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              {formState === 0 ? "Sign In" : "Sign Up"}
            </Typography>
          </Box>

          {/* Toggle Buttons */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}>
            <Button
              variant={formState === 0 ? "contained" : "outlined"}
              onClick={() => setFormState(0)}
            >
              Sign In
            </Button>
            <Button
              variant={formState === 1 ? "contained" : "outlined"}
              onClick={() => setFormState(1)}
            >
              Sign Up
            </Button>
          </Box>

          {/* Form */}
          <Box component="form" noValidate sx={{ mt: 1 }}>
            {formState === 1 && (
              <TextField
                margin="normal"
                required
                fullWidth
                label="Full Name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleAuth}
            >
              {formState === 0 ? "Login" : "Register"}
            </Button>
          </Box>
        </Paper>
      </Container>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        message={message}
        onClose={() => setOpen(false)}
      />
    </ThemeProvider>
  );
}
