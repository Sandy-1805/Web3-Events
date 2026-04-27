import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  location: text('location'),
  createdAt: timestamp('created_at').defaultNow(),
});


export const speakers = pgTable('speakers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  photo: text('photo'),
  bio: text('bio'),
  socialLinks: text('social_links'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('participant'), // 'admin' ou 'participant'
  createdAt: timestamp('created_at').defaultNow(),
});

export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  sessionId: integer('session_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  room: text('room').notNull(),
  capacity: integer('capacity'),
  eventId: integer('event_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const sessionSpeakers = pgTable('session_speakers', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').notNull(),
  speakerId: integer('speaker_id').notNull(),
});

export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  authorName: text('author_name'),
  upvotes: integer('upvotes').default(0),
  sessionId: integer('session_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});