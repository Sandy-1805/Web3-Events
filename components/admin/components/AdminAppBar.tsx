// components/admin/components/AdminAppBar.tsx
'use client';

import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { useTheme } from '@/contexts/ThemeContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '@/hooks/useAuth';

export default function AdminAppBar() {
    const { theme, toggleTheme } = useTheme();
    const { logout } = useAuth();

    return (
        <AppBar position="sticky" color="default" elevation={0}>
            <Toolbar>
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 2 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        🎯 EventSync Admin
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    {/* ✅ Bouton de changement de thème synchronisé */}
                    <IconButton onClick={toggleTheme} color="inherit" size="small" title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
                        {theme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                    <IconButton onClick={logout} color="inherit" size="small">
                        <LogoutIcon />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
}