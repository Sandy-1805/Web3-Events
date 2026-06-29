// components/admin/components/AdminMenu.tsx
'use client';

import { Menu } from 'react-admin';
import { Box, Typography, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import SpeakerIcon from '@mui/icons-material/Person';
import SessionIcon from '@mui/icons-material/Schedule';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PeopleIcon from '@mui/icons-material/People';

export default function AdminMenu(props: any) {
    return (
        <Box sx={{ py: 2 }}>
            <Box sx={{ px: 2, mb: 2 }}>
                <Typography
                    variant="overline"
                    sx={{
                        color: 'text.secondary',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        fontSize: '0.65rem',
                    }}
                >
                    Navigation
                </Typography>
            </Box>

            <Menu {...props}>
                <Menu.DashboardItem
                    to="/admin"
                    primaryText="Dashboard"
                    leftIcon={<DashboardIcon />}
                />
                <Divider sx={{ my: 1, borderColor: 'divider' }} />
                <Menu.ResourceItem
                    name="events"
                    primaryText="Events"
                    leftIcon={<EventIcon />}
                />
                <Menu.ResourceItem
                    name="sessions"
                    primaryText="Sessions"
                    leftIcon={<SessionIcon />}
                />
                <Menu.ResourceItem
                    name="speakers"
                    primaryText="Speakers"
                    leftIcon={<SpeakerIcon />}
                />
                <Menu.ResourceItem
                    name="questions"
                    primaryText="Questions"
                    leftIcon={<QuestionAnswerIcon />}
                />
                <Menu.ResourceItem
                    name="users"
                    primaryText="Users"
                    leftIcon={<PeopleIcon />}
                />
            </Menu>
        </Box>
    );
}