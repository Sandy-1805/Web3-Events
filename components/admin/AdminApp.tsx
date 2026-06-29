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
    bg: '#0a0a0f',
    paper: '#0d0d14',
    surface: 'rgba(255,255,255,0.04)',
    surfaceHover: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.08)',
    borderHover: 'rgba(255,255,255,0.15)',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textDisabled: '#64748b',
    accent: '#6366f1',
    input: 'rgba(255,255,255,0.05)',
    divider: 'rgba(255,255,255,0.07)',
  },
  light: {
    bg: '#f8f9fc',
    paper: '#ffffff',
    surface: 'rgba(0,0,0,0.04)',
    surfaceHover: 'rgba(0,0,0,0.07)',
    border: 'rgba(0,0,0,0.10)',
    borderHover: 'rgba(0,0,0,0.20)',
    text: '#0f172a',
    textSecondary: '#475569',
    textDisabled: '#94a3b8',
    accent: '#4f46e5',
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
      background: { default: t.bg, paper: t.paper },
      text: { primary: t.text, secondary: t.textSecondary, disabled: t.textDisabled },
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
      // ✅ APP BAR : couleurs adaptées au thème
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: t.paper,
            backgroundImage: 'none',
            borderBottom: `1px solid ${t.border}`,
            boxShadow: 'none',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          },
        },
      },
      // ✅ SIDEBAR : couleurs adaptées au thème
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: t.paper,
            backgroundImage: 'none',
            borderRight: `1px solid ${t.border}`,
          },
        },
      },
      // ✅ CARTES : couleurs adaptées au thème
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: t.paper,
            backgroundImage: 'none',
            border: `1px solid ${t.border}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: t.surface,
            backgroundImage: 'none',
            border: `1px solid ${t.border}`,
            borderRadius: 16,
            boxShadow: 'none',
          },
        },
      },
      // ✅ INPUTS : couleurs adaptées au thème
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
              borderColor: t.borderHover,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: t.accent,
            },
            '& input, & textarea': {
              color: t.text,
            },
            '& input::placeholder, & textarea::placeholder': {
              color: t.textDisabled,
              opacity: 1,
            },
          },
        },
      },
      // ✅ LABELS : couleurs adaptées au thème
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: t.textDisabled,
            fontWeight: 600,
            '&.Mui-focused': { color: t.accent },
          },
        },
      },
      // ✅ TABLE HEAD : couleurs adaptées au thème
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              backgroundColor: t.surface,
              color: t.textDisabled,
              fontWeight: 700,
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              borderBottom: `1px solid ${t.border}`,
            },
          },
        },
      },
      // ✅ TABLE ROWS : couleurs adaptées au thème
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: t.surfaceHover,
            },
          },
        },
      },
      // ✅ TABLE CELLS : couleurs adaptées au thème
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${t.border}`,
            color: t.text,
            fontSize: '0.88rem',
          },
        },
      },
      // ✅ ICÔNES : couleurs adaptées au thème
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: t.textSecondary,
            '&:hover': {
              color: t.text,
              backgroundColor: t.surfaceHover,
            },
          },
        },
      },
      // ✅ MENU ITEMS : couleurs adaptées au thème
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: t.text,
            '&:hover': {
              backgroundColor: t.surfaceHover,
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
      // ✅ DIVIDERS : couleurs adaptées au thème
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: t.border },
        },
      },
      // ✅ CHIPS : couleurs adaptées au thème
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '0.75rem',
          },
        },
      },
      // ✅ BOUTONS : couleurs adaptées au thème
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 10,
          },
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

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', background: theme === 'dark' ? '#0a0a0f' : '#f8f9fc' }} />
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