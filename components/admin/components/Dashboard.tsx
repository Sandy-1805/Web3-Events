// components/admin/components/Dashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, Grid, Typography, Box } from '@mui/material';
import { useDataProvider } from 'react-admin';

export default function Dashboard() {
    const dataProvider = useDataProvider();
    const [stats, setStats] = useState({
        events: 0,
        sessions: 0,
        speakers: 0,
        users: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [events, sessions, speakers, users] = await Promise.all([
                    dataProvider.getList('events', { pagination: { page: 1, perPage: 1 }, sort: { field: 'id', order: 'ASC' }, filter: {} }),
                    dataProvider.getList('sessions', { pagination: { page: 1, perPage: 1 }, sort: { field: 'id', order: 'ASC' }, filter: {} }),
                    dataProvider.getList('speakers', { pagination: { page: 1, perPage: 1 }, sort: { field: 'id', order: 'ASC' }, filter: {} }),
                    dataProvider.getList('users', { pagination: { page: 1, perPage: 1 }, sort: { field: 'id', order: 'ASC' }, filter: {} }),
                ]);
                setStats({
                    events: events.total || 0,
                    sessions: sessions.total || 0,
                    speakers: speakers.total || 0,
                    users: users.total || 0,
                });
            } catch (error) {
                console.error('Error loading stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [dataProvider]);

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    const statItems = [
        { label: 'Events', value: stats.events, icon: '📅' },
        { label: 'Sessions', value: stats.sessions, icon: '⏰' },
        { label: 'Speakers', value: stats.speakers, icon: '🎤' },
        { label: 'Users', value: stats.users, icon: '👥' },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
                Dashboard
            </Typography>

            <Grid container spacing={3}>
                {statItems.map((stat) => (
                    // ✅ Utilisation de 'size' au lieu de 'item xs sm md'
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.label}>
                        <Card sx={{
                            background: 'var(--es-surface)',
                            border: '1px solid var(--es-border)',
                            borderRadius: '16px',
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ fontSize: '2rem' }}>{stat.icon}</Box>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {stat.value}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {stat.label}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}