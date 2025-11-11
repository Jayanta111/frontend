import * as React from "react";
import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";

import HistoryIcon from "@mui/icons-material/History";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import ArticleIcon from "@mui/icons-material/Article";
import HomeIcon from '@mui/icons-material/Home';
const pages = [
    { label: "Home", icon: <HomeIcon />, path: "/home" },

  { label: "History", icon: <HistoryIcon />, path: "/history" },
  { label: "Meeting", icon: <VideoCallIcon />, path: "/home" },
  { label: "Blog", icon: <ArticleIcon />, path: "/blog" },
];

const settings = ["Profile", "Account", "Logout"];

function NavBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const navigate = useNavigate();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: "#1976d2"  }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Left Logo for Desktop */}
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="#"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <img
              src="/vionex_favicon_64.png"
              alt="logo"
              className="rounded-xl"
              style={{ width: "50%" }}
            />
          </Typography>

          {/* Mobile Menu Button */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page.label}
                  onClick={() => {
                    navigate(page.path);
                    handleCloseNavMenu();
                  }}
                >
                  {page.icon}
                  <Typography sx={{ ml: 1 }}>{page.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Logo on Mobile */}
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <img
              src="/vionex_favicon_64.png"
              alt="logo"
              className="rounded-xl"
              style={{ width: "13%" }}
            />
          </Typography>

          {/* Desktop Menu (Icons Only) */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, gap: 2 }}>
            {pages.map((page) => (
              <Tooltip title={page.label} key={page.label}>
                <IconButton
                  color="inherit"
                  onClick={() => {
                    navigate(page.path);
                    handleCloseNavMenu();
                  }}
                >
                  {page.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Box>

          {/* User Avatar & Menu */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="User Avatar" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting}
                  onClick={
                    setting === "Logout" ? handleLogout : handleCloseUserMenu
                  }
                >
                  <Typography sx={{ textAlign: "center" }}>
                    {setting}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default NavBar;
