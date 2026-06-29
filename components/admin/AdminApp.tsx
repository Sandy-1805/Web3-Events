// components/admin/AdminApp.tsx
'use client';

import { Admin, Resource } from 'react-admin';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useMemo, useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import dataProvider from '@/lib/admin/dataProvider';
import authProvider from '@/lib/admin/authProvider';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from 'ra-language-english';

import {
  SessionList, SessionCreate, SessionEdit, SessionShow,
} from './resources/sessions';
import {
  SpeakerList, SpeakerCreate, SpeakerEdit, SpeakerShow,
} from './resources/speakers';
import {
  EventList, EventCreate, EventEdit, EventShow,
} from './resources/events';
import { QuestionList, QuestionShow } from './resources/questions';
import { UserList, UserShow } from './resources/users';

const i18nProvider = polyglotI18nProvider(() => englishMessages, 'en');

// ─── Design tokens ───────────────────────────────────────────────────────────
const TOKENS = {
  dark: {
    bg1: '#0a0a0f',
    bg2: '#0d0d14',
    bg3: '#111118',
    surface: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.08)',
    text1: '#f1f5f9',
    text2: '#94a3b8',
    text3: '#64748b',
    accent: '#6366f1',
    paper: '#0d0d14',
    input: 'rgba(255,255,255,0.05)',
    divider: 'rgba(255,255,255,0.07)',
  },
  light: {
    bg1: '#f8f9fc',
    bg2: '#ffffff',
    bg3: '#f1f3f9',
    surface: 'rgba(0,0,0,0.04)',
    border: 'rgba(0,0,0,0.10)',
    text1: '#0f172a',
    text2: '#475569',
    text3: '#94a3b8',
    accent: '#4f46e5',
    paper: '#ffffff',
    input: 'rgba(0,0,0,0.04)',
    divider: 'rgba(0,0,0,0.08)',
  },
} as const;

function buildMuiTheme(mode: 'dark' | 'light') {
  const t = TOKENS[mode];
  return createTheme({
    palette: {
      mode,
      primary: { main: t.accent },
      background: { default: t.bg1, paper: t.paper },
      text: { primary: t.text1, secondary: t.text2, disabled: t.text3 },
      divider: t.divider,
      error: { main: '#f43f5e' },
      success: { main: '#22c55e' },
      warning: { main: '#f59e0b' },
    },
    typography: {
      fontFamily: 'inherit',
    },
    shape: { borderRadius: 12 },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: t.paper,
            border: `1px solid ${t.border}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 16,
            boxShadow: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: mode === 'dark'
                ? 'rgba(10,10,15,0.88)'
                : 'rgba(248,249,252,0.94)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: `1px solid ${t.border}`,
            boxShadow: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            backgroundColor: mode === 'dark'
                ? 'rgba(10,10,15,0.97)'
                : 'rgba(248,249,252,0.98)',
            borderRight: `1px solid ${t.border}`,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: t.input,
            borderRadius: 12,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: t.border,
              borderRadius: 12,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark'
                  ? 'rgba(99,102,241,0.35)'
                  : 'rgba(79,70,229,0.35)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: t.accent,
            },
            '& input, & textarea': {
              color: t.text1,
            },
            '& input::placeholder, & textarea::placeholder': {
              color: t.text3,
              opacity: 1,
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: t.text3,
            fontWeight: 600,
            '&.Mui-focused': { color: t.accent },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 10,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            color: t.text2,
            '&:hover': {
              color: t.text1,
              backgroundColor: mode === 'dark'
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(0,0,0,0.06)',
            },
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              backgroundColor: mode === 'dark'
                  ? 'rgba(99,102,241,0.04)'
                  : 'rgba(79,70,229,0.04)',
              color: t.text3,
              fontWeight: 700,
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              borderBottom: `1px solid ${mode === 'dark'
                  ? 'rgba(99,102,241,0.12)'
                  : 'rgba(0,0,0,0.08)'}`,
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: mode === 'dark'
                  ? 'rgba(99,102,241,0.05)'
                  : 'rgba(79,70,229,0.03)',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${t.divider}`,
            color: t.text1,
            fontSize: '0.88rem',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: t.text1,
            '&:hover': {
              backgroundColor: mode === 'dark'
                  ? 'rgba(99,102,241,0.1)'
                  : 'rgba(79,70,229,0.06)',
              color: t.accent,
            },
            '&.Mui-selected': {
              backgroundColor: mode === 'dark'
                  ? 'rgba(99,102,241,0.14)'
                  : 'rgba(79,70,229,0.09)',
              color: t.accent,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '0.75rem',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: t.divider },
        },
      },
    },
  });
}

// ─── Composant principal ────────────────────────────────────────────────────
export default function AdminApp() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const muiTheme = useMemo(() => buildMuiTheme(theme), [theme]);

  // Évite l'erreur d'hydratation
  if (!mounted) {
    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f' }} />
    );
  }

  return (
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <Admin
            dataProvider={dataProvider}
            authProvider={authProvider}
            i18nProvider={i18nProvider}
            requireAuth
        >
          <Resource
              name="events"
              list={EventList}
              create={EventCreate}
              edit={EventEdit}
              show={EventShow}
              recordRepresentation="title"
              icon={() => <span>📅</span>}
              options={{ label: 'Events' }}
          />
          <Resource
              name="sessions"
              list={SessionList}
              create={SessionCreate}
              edit={SessionEdit}
              show={SessionShow}
              recordRepresentation="title"
              icon={() => <span>⏰</span>}
              options={{ label: 'Sessions' }}
          />
          <Resource
              name="speakers"
              list={SpeakerList}
              create={SpeakerCreate}
              edit={SpeakerEdit}
              show={SpeakerShow}
              recordRepresentation="name"
              icon={() => <span>🎤</span>}
              options={{ label: 'Speakers' }}
          />
          <Resource
              name="questions"
              list={QuestionList}
              show={QuestionShow}
              recordRepresentation="content"
              icon={() => <span>💬</span>}
              options={{ label: 'Questions' }}
          />
          <Resource
              name="users"
              list={UserList}
              show={UserShow}
              recordRepresentation="name"
              icon={() => <span>👥</span>}
              options={{ label: 'Users' }}
          />
        </Admin>
      </ThemeProvider>
  );
}