import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  birthday: date("birthday"),
  attendanceYears: text("attendance_years"), // e.g., "2018-2022"
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Executive roles
export const executiveRoles = pgTable("executive_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role").notNull(), // President, Vice President, Secretary, Treasurer
  session: varchar("session").notNull(), // e.g., "2020/2021"
  createdAt: timestamp("created_at").defaultNow(),
});

// Worker units
export const workerUnits = pgTable("worker_units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  unit: varchar("unit").notNull(), // Ushering, Choir, Technical, etc.
  session: varchar("session").notNull(), // e.g., "2019/2020"
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages for chat system
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: varchar("receiver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event types enum
export const eventTypeEnum = pgEnum("event_type", ["Bible Study", "Worship Service", "Community Service", "Fellowship Dinner", "Conference", "Other"]);

// Gallery/Media
export const media = pgTable("media", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  uploaderId: varchar("uploader_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fileName: varchar("file_name").notNull(),
  originalName: varchar("original_name").notNull(),
  mimeType: varchar("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  eventType: eventTypeEnum("event_type").notNull(),
  session: varchar("session").notNull(),
  description: text("description"),
  isApproved: boolean("is_approved").default(false),
  approvedBy: varchar("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Announcements
export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  attachmentUrl: varchar("attachment_url"),
  isEvent: boolean("is_event").default(false),
  eventDate: timestamp("event_date"),
  rsvpCount: integer("rsvp_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// RSVP responses
export const rsvps = pgTable("rsvps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  announcementId: varchar("announcement_id").notNull().references(() => announcements.id, { onDelete: "cascade" }),
  response: varchar("response").notNull(), // "yes", "no", "maybe"
  createdAt: timestamp("created_at").defaultNow(),
});

// Resources
export const resources = pgTable("resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  uploaderId: varchar("uploader_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description"),
  fileName: varchar("file_name").notNull(),
  originalName: varchar("original_name").notNull(),
  mimeType: varchar("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  category: varchar("category").notNull(), // "devotional", "sermon", "training"
  downloadCount: integer("download_count").default(0),
  isApproved: boolean("is_approved").default(false),
  approvedBy: varchar("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Prayer requests and testimonies
export const prayerWall = pgTable("prayer_wall", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  type: varchar("type").notNull(), // "prayer", "testimony"
  isAnonymous: boolean("is_anonymous").default(false),
  prayingCount: integer("praying_count").default(0),
  isApproved: boolean("is_approved").default(false),
  approvedBy: varchar("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Prayer support
export const prayerSupport = pgTable("prayer_support", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  prayerWallId: varchar("prayer_wall_id").notNull().references(() => prayerWall.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Job board
export const jobPosts = pgTable("job_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  posterId: varchar("poster_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  company: varchar("company").notNull(),
  location: varchar("location"),
  jobType: varchar("job_type").notNull(), // "full-time", "part-time", "internship", "contract"
  salary: varchar("salary"),
  deadline: timestamp("deadline"),
  applicationCount: integer("application_count").default(0),
  isApproved: boolean("is_approved").default(false),
  approvedBy: varchar("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Job applications
export const jobApplications = pgTable("job_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicantId: varchar("applicant_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  jobPostId: varchar("job_post_id").notNull().references(() => jobPosts.id, { onDelete: "cascade" }),
  coverLetter: text("cover_letter"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Mentorship
export const mentorships = pgTable("mentorships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mentorId: varchar("mentor_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  menteeId: varchar("mentee_id").references(() => users.id, { onDelete: "cascade" }),
  interests: text("interests"),
  department: varchar("department"),
  status: varchar("status").default("available"), // "available", "matched", "completed"
  isMentor: boolean("is_mentor").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fellowship history
export const fellowshipHistory = pgTable("fellowship_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  year: varchar("year").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // "leadership", "event", "milestone"
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  executiveRoles: many(executiveRoles),
  workerUnits: many(workerUnits),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  media: many(media),
  announcements: many(announcements),
  rsvps: many(rsvps),
  resources: many(resources),
  prayerWall: many(prayerWall),
  prayerSupport: many(prayerSupport),
  jobPosts: many(jobPosts),
  jobApplications: many(jobApplications),
  mentorships: many(mentorships),
}));

export const executiveRolesRelations = relations(executiveRoles, ({ one }) => ({
  user: one(users, { fields: [executiveRoles.userId], references: [users.id] }),
}));

export const workerUnitsRelations = relations(workerUnits, ({ one }) => ({
  user: one(users, { fields: [workerUnits.userId], references: [users.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id], relationName: "sender" }),
  receiver: one(users, { fields: [messages.receiverId], references: [users.id], relationName: "receiver" }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  uploader: one(users, { fields: [media.uploaderId], references: [users.id] }),
  approver: one(users, { fields: [media.approvedBy], references: [users.id] }),
}));

export const announcementsRelations = relations(announcements, ({ one, many }) => ({
  author: one(users, { fields: [announcements.authorId], references: [users.id] }),
  rsvps: many(rsvps),
}));

export const rsvpsRelations = relations(rsvps, ({ one }) => ({
  user: one(users, { fields: [rsvps.userId], references: [users.id] }),
  announcement: one(announcements, { fields: [rsvps.announcementId], references: [announcements.id] }),
}));

export const resourcesRelations = relations(resources, ({ one }) => ({
  uploader: one(users, { fields: [resources.uploaderId], references: [users.id] }),
  approver: one(users, { fields: [resources.approvedBy], references: [users.id] }),
}));

export const prayerWallRelations = relations(prayerWall, ({ one, many }) => ({
  author: one(users, { fields: [prayerWall.authorId], references: [users.id] }),
  approver: one(users, { fields: [prayerWall.approvedBy], references: [users.id] }),
  support: many(prayerSupport),
}));

export const prayerSupportRelations = relations(prayerSupport, ({ one }) => ({
  user: one(users, { fields: [prayerSupport.userId], references: [users.id] }),
  prayerWall: one(prayerWall, { fields: [prayerSupport.prayerWallId], references: [prayerWall.id] }),
}));

export const jobPostsRelations = relations(jobPosts, ({ one, many }) => ({
  poster: one(users, { fields: [jobPosts.posterId], references: [users.id] }),
  approver: one(users, { fields: [jobPosts.approvedBy], references: [users.id] }),
  applications: many(jobApplications),
}));

export const jobApplicationsRelations = relations(jobApplications, ({ one }) => ({
  applicant: one(users, { fields: [jobApplications.applicantId], references: [users.id] }),
  jobPost: one(jobPosts, { fields: [jobApplications.jobPostId], references: [jobPosts.id] }),
}));

export const mentorshipsRelations = relations(mentorships, ({ one }) => ({
  mentor: one(users, { fields: [mentorships.mentorId], references: [users.id] }),
  mentee: one(users, { fields: [mentorships.menteeId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExecutiveRoleSchema = createInsertSchema(executiveRoles).omit({
  id: true,
  createdAt: true,
});

export const insertWorkerUnitSchema = createInsertSchema(workerUnits).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertMediaSchema = createInsertSchema(media).omit({
  id: true,
  createdAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
});

export const insertRsvpSchema = createInsertSchema(rsvps).omit({
  id: true,
  createdAt: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
});

export const insertPrayerWallSchema = createInsertSchema(prayerWall).omit({
  id: true,
  createdAt: true,
});

export const insertPrayerSupportSchema = createInsertSchema(prayerSupport).omit({
  id: true,
  createdAt: true,
});

export const insertJobPostSchema = createInsertSchema(jobPosts).omit({
  id: true,
  createdAt: true,
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  createdAt: true,
});

export const insertMentorshipSchema = createInsertSchema(mentorships).omit({
  id: true,
  createdAt: true,
});

export const insertFellowshipHistorySchema = createInsertSchema(fellowshipHistory).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type ExecutiveRole = typeof executiveRoles.$inferSelect;
export type WorkerUnit = typeof workerUnits.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Media = typeof media.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type Rsvp = typeof rsvps.$inferSelect;
export type Resource = typeof resources.$inferSelect;
export type PrayerWall = typeof prayerWall.$inferSelect;
export type PrayerSupport = typeof prayerSupport.$inferSelect;
export type JobPost = typeof jobPosts.$inferSelect;
export type JobApplication = typeof jobApplications.$inferSelect;
export type Mentorship = typeof mentorships.$inferSelect;
export type FellowshipHistory = typeof fellowshipHistory.$inferSelect;

export type InsertExecutiveRole = z.infer<typeof insertExecutiveRoleSchema>;
export type InsertWorkerUnit = z.infer<typeof insertWorkerUnitSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type InsertRsvp = z.infer<typeof insertRsvpSchema>;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type InsertPrayerWall = z.infer<typeof insertPrayerWallSchema>;
export type InsertPrayerSupport = z.infer<typeof insertPrayerSupportSchema>;
export type InsertJobPost = z.infer<typeof insertJobPostSchema>;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type InsertMentorship = z.infer<typeof insertMentorshipSchema>;
export type InsertFellowshipHistory = z.infer<typeof insertFellowshipHistorySchema>;
