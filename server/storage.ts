import {
  users,
  executivePosts,
  familyHeads,
  otherPosts,
  workerUnits,
  messages,
  media,
  announcements,
  rsvps,
  resources,
  prayerWall,
  prayerSupport,
  jobPosts,
  jobApplications,
  mentorships,
  fellowshipHistory,
  roleHistory,
  userActivityLog,
  type User,
  type UpsertUser,
  type ExecutivePost,
  type FamilyHead,
  type OtherPost,
  type RoleHistory,
  type UserActivityLog,
  type WorkerUnit,
  type Message,
  type Media,
  type Announcement,
  type Rsvp,
  type Resource,
  type PrayerWall,
  type PrayerSupport,
  type JobPost,
  type JobApplication,
  type Mentorship,
  type FellowshipHistory,
  type InsertExecutivePost,
  type InsertFamilyHead,
  type InsertOtherPost,
  type InsertWorkerUnit,
  type InsertMessage,
  type InsertMedia,
  type InsertAnnouncement,
  type InsertRsvp,
  type InsertResource,
  type InsertPrayerWall,
  type InsertPrayerSupport,
  type InsertJobPost,
  type InsertJobApplication,
  type InsertMentorship,
  type InsertFellowshipHistory,
  type InsertRoleHistory,
  type InsertUserActivityLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, count, sql, not, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  
  // Executive posts and roles
  createExecutivePost(post: InsertExecutivePost): Promise<ExecutivePost>;
  getUserExecutivePosts(userId: string): Promise<ExecutivePost[]>;
  createFamilyHead(familyHead: InsertFamilyHead): Promise<FamilyHead>;
  getUserFamilyHeads(userId: string): Promise<FamilyHead[]>;
  createOtherPost(post: InsertOtherPost): Promise<OtherPost>;
  getUserOtherPosts(userId: string): Promise<OtherPost[]>;
  
  // User role management (admin functions)
  updateUserRole(userId: string, role: string, canPostAnnouncements: boolean): Promise<void>;
  getAllUsers(): Promise<User[]>;
  getUserWithPosts(userId: string): Promise<User & { executivePosts: ExecutivePost[]; familyHeads: FamilyHead[]; workerUnits: WorkerUnit[]; otherPosts: OtherPost[] }>;
  updateUserAcademicInfo(userId: string, info: { department?: string; academicLevel?: string }): Promise<void>;
  
  // Role history and activity tracking
  createRoleHistory(history: InsertRoleHistory): Promise<RoleHistory>;
  getUserRoleHistory(userId: string): Promise<RoleHistory[]>;
  logUserActivity(activity: InsertUserActivityLog): Promise<UserActivityLog>;
  getUserActivityLog(userId: string): Promise<UserActivityLog[]>;
  
  // Advanced admin features
  bulkUpdateUserRoles(updates: { userId: string; role: string; canPostAnnouncements: boolean }[]): Promise<void>;
  getExecutivePostsBySession(session: string): Promise<ExecutivePost[]>;
  getUsersWithoutPosts(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Worker units
  createWorkerUnit(unit: InsertWorkerUnit): Promise<WorkerUnit>;
  getUserWorkerUnits(userId: string): Promise<WorkerUnit[]>;
  
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getConversation(user1Id: string, user2Id: string): Promise<Message[]>;
  getUserConversations(userId: string): Promise<{ user: User; lastMessage: Message; unreadCount: number }[]>;
  markMessagesAsRead(receiverId: string, senderId: string): Promise<void>;
  
  // Media/Gallery
  createMedia(media: InsertMedia): Promise<Media>;
  getApprovedMedia(eventType?: string, session?: string): Promise<Media[]>;
  getPendingMedia(): Promise<Media[]>;
  approveMedia(mediaId: string, approverId: string): Promise<void>;
  
  // Announcements
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  getAnnouncements(): Promise<Announcement[]>;
  createRsvp(rsvp: InsertRsvp): Promise<Rsvp>;
  getUserRsvp(userId: string, announcementId: string): Promise<Rsvp | undefined>;
  
  // Resources
  createResource(resource: InsertResource): Promise<Resource>;
  getApprovedResources(category?: string): Promise<Resource[]>;
  getPendingResources(): Promise<Resource[]>;
  approveResource(resourceId: string, approverId: string): Promise<void>;
  incrementResourceDownload(resourceId: string): Promise<void>;
  
  // Prayer Wall
  createPrayerWall(prayer: InsertPrayerWall): Promise<PrayerWall>;
  getApprovedPrayerWall(): Promise<PrayerWall[]>;
  getPendingPrayerWall(): Promise<PrayerWall[]>;
  approvePrayerWall(prayerId: string, approverId: string): Promise<void>;
  createPrayerSupport(support: InsertPrayerSupport): Promise<PrayerSupport>;
  getUserPrayerSupport(userId: string, prayerId: string): Promise<PrayerSupport | undefined>;
  
  // Job Board
  createJobPost(job: InsertJobPost): Promise<JobPost>;
  getApprovedJobPosts(): Promise<JobPost[]>;
  getPendingJobPosts(): Promise<JobPost[]>;
  approveJobPost(jobId: string, approverId: string): Promise<void>;
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  getUserJobApplication(userId: string, jobId: string): Promise<JobApplication | undefined>;
  
  // Mentorship
  createMentorship(mentorship: InsertMentorship): Promise<Mentorship>;
  getAvailableMentors(): Promise<Mentorship[]>;
  getMenteeRequests(): Promise<Mentorship[]>;
  getMentorshipMatches(): Promise<{ mentor: User; mentee: User; mentorship: Mentorship }[]>;
  
  // Fellowship History
  createFellowshipHistory(history: InsertFellowshipHistory): Promise<FellowshipHistory>;
  getFellowshipHistory(): Promise<FellowshipHistory[]>;
  
  // Admin functions (already defined above)
  getUserStats(): Promise<{ totalAlumni: number; activeMembers: number; totalEvents: number; totalJobs: number }>;
  getTodaysBirthdays(): Promise<User[]>;
  searchUsers(query: string): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  // Executive posts and roles
  async createExecutivePost(post: InsertExecutivePost): Promise<ExecutivePost> {
    const [newPost] = await db.insert(executivePosts).values(post).returning();
    return newPost;
  }

  async getUserExecutivePosts(userId: string): Promise<ExecutivePost[]> {
    return await db.select().from(executivePosts).where(eq(executivePosts.userId, userId));
  }

  async createFamilyHead(familyHead: InsertFamilyHead): Promise<FamilyHead> {
    const [newFamilyHead] = await db.insert(familyHeads).values(familyHead).returning();
    return newFamilyHead;
  }

  async getUserFamilyHeads(userId: string): Promise<FamilyHead[]> {
    return await db.select().from(familyHeads).where(eq(familyHeads.userId, userId));
  }

  async createOtherPost(post: InsertOtherPost): Promise<OtherPost> {
    const [newPost] = await db.insert(otherPosts).values(post).returning();
    return newPost;
  }

  async getUserOtherPosts(userId: string): Promise<OtherPost[]> {
    return await db.select().from(otherPosts).where(eq(otherPosts.userId, userId));
  }

  async updateUserRole(userId: string, role: string, canPostAnnouncements: boolean): Promise<void> {
    await db
      .update(users)
      .set({ role: role as any, canPostAnnouncements })
      .where(eq(users.id, userId));
  }

  async getUserWithPosts(userId: string): Promise<User & { executivePosts: ExecutivePost[]; familyHeads: FamilyHead[]; workerUnits: WorkerUnit[]; otherPosts: OtherPost[] }> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const [executivePosts, familyHeads, workerUnits, otherPosts] = await Promise.all([
      this.getUserExecutivePosts(userId),
      this.getUserFamilyHeads(userId),
      this.getUserWorkerUnits(userId),
      this.getUserOtherPosts(userId)
    ]);

    return { ...user, executivePosts, familyHeads, workerUnits, otherPosts };
  }

  async updateUserAcademicInfo(userId: string, info: { department?: string; academicLevel?: string }): Promise<void> {
    await db
      .update(users)
      .set({
        department: info.department,
        academicLevel: info.academicLevel as any,
      })
      .where(eq(users.id, userId));
  }

  // Role history and activity tracking
  async createRoleHistory(history: InsertRoleHistory): Promise<RoleHistory> {
    const [newHistory] = await db.insert(roleHistory).values(history).returning();
    return newHistory;
  }

  async getUserRoleHistory(userId: string): Promise<RoleHistory[]> {
    return await db.select().from(roleHistory).where(eq(roleHistory.userId, userId)).orderBy(desc(roleHistory.createdAt));
  }

  async logUserActivity(activity: InsertUserActivityLog): Promise<UserActivityLog> {
    const [newActivity] = await db.insert(userActivityLog).values(activity).returning();
    return newActivity;
  }

  async getUserActivityLog(userId: string): Promise<UserActivityLog[]> {
    return await db.select().from(userActivityLog).where(eq(userActivityLog.userId, userId)).orderBy(desc(userActivityLog.createdAt));
  }

  // Advanced admin features
  async bulkUpdateUserRoles(updates: { userId: string; role: string; canPostAnnouncements: boolean }[]): Promise<void> {
    await Promise.all(updates.map(update => 
      db.update(users)
        .set({ role: update.role as any, canPostAnnouncements: update.canPostAnnouncements })
        .where(eq(users.id, update.userId))
    ));
  }

  async getExecutivePostsBySession(session: string): Promise<ExecutivePost[]> {
    return await db.select().from(executivePosts).where(eq(executivePosts.session, session));
  }

  async getUsersWithoutPosts(): Promise<User[]> {
    // Users who don't have any executive posts, family heads, worker units, or other posts
    const usersWithPosts = await db
      .selectDistinct({ userId: executivePosts.userId })
      .from(executivePosts)
      .union(
        db.selectDistinct({ userId: familyHeads.userId }).from(familyHeads)
      )
      .union(
        db.selectDistinct({ userId: workerUnits.userId }).from(workerUnits)
      )
      .union(
        db.selectDistinct({ userId: otherPosts.userId }).from(otherPosts)
      );

    const userIds = usersWithPosts.map(u => u.userId);
    return await db.select().from(users).where(not(inArray(users.id, userIds)));
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role as any));
  }

  // Worker units
  async createWorkerUnit(unit: InsertWorkerUnit): Promise<WorkerUnit> {
    const [newUnit] = await db.insert(workerUnits).values(unit).returning();
    return newUnit;
  }

  async getUserWorkerUnits(userId: string): Promise<WorkerUnit[]> {
    return await db.select().from(workerUnits).where(eq(workerUnits.userId, userId));
  }

  // Messages
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getConversation(user1Id: string, user2Id: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, user1Id), eq(messages.receiverId, user2Id)),
          and(eq(messages.senderId, user2Id), eq(messages.receiverId, user1Id))
        )
      )
      .orderBy(messages.createdAt);
  }

  async getUserConversations(userId: string): Promise<{ user: User; lastMessage: Message; unreadCount: number }[]> {
    // This is a complex query that would need to be optimized in production
    // For now, we'll implement a simpler version
    const userMessages = await db
      .select()
      .from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));

    const conversations = new Map();
    
    for (const message of userMessages) {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      
      if (!conversations.has(otherUserId)) {
        const [otherUser] = await db.select().from(users).where(eq(users.id, otherUserId));
        const unreadCount = await db
          .select({ count: count() })
          .from(messages)
          .where(
            and(
              eq(messages.senderId, otherUserId),
              eq(messages.receiverId, userId),
              eq(messages.isRead, false)
            )
          );
        
        conversations.set(otherUserId, {
          user: otherUser,
          lastMessage: message,
          unreadCount: unreadCount[0].count,
        });
      }
    }
    
    return Array.from(conversations.values());
  }

  async markMessagesAsRead(receiverId: string, senderId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.receiverId, receiverId),
          eq(messages.senderId, senderId)
        )
      );
  }

  // Media/Gallery
  async createMedia(mediaData: InsertMedia): Promise<Media> {
    const [newMedia] = await db.insert(media).values(mediaData).returning();
    return newMedia;
  }

  async getApprovedMedia(eventType?: string, session?: string): Promise<Media[]> {
    let conditions = [eq(media.isApproved, true)];
    
    if (eventType) {
      conditions.push(eq(media.eventType, eventType as any));
    }
    
    if (session) {
      conditions.push(eq(media.session, session));
    }
    
    return await db.select().from(media)
      .where(and(...conditions))
      .orderBy(desc(media.createdAt));
  }

  async getPendingMedia(): Promise<Media[]> {
    return await db.select().from(media).where(eq(media.isApproved, false));
  }

  async approveMedia(mediaId: string, approverId: string): Promise<void> {
    await db
      .update(media)
      .set({ isApproved: true, approvedBy: approverId })
      .where(eq(media.id, mediaId));
  }

  // Announcements
  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [newAnnouncement] = await db.insert(announcements).values(announcement).returning();
    return newAnnouncement;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async createRsvp(rsvp: InsertRsvp): Promise<Rsvp> {
    const [newRsvp] = await db.insert(rsvps).values(rsvp).returning();
    
    // Update RSVP count
    const rsvpCount = await db
      .select({ count: count() })
      .from(rsvps)
      .where(and(eq(rsvps.announcementId, rsvp.announcementId), eq(rsvps.response, "yes")));
    
    await db
      .update(announcements)
      .set({ rsvpCount: rsvpCount[0].count })
      .where(eq(announcements.id, rsvp.announcementId));
    
    return newRsvp;
  }

  async getUserRsvp(userId: string, announcementId: string): Promise<Rsvp | undefined> {
    const [rsvp] = await db
      .select()
      .from(rsvps)
      .where(and(eq(rsvps.userId, userId), eq(rsvps.announcementId, announcementId)));
    return rsvp;
  }

  // Resources
  async createResource(resource: InsertResource): Promise<Resource> {
    const [newResource] = await db.insert(resources).values(resource).returning();
    return newResource;
  }

  async getApprovedResources(category?: string): Promise<Resource[]> {
    let conditions = [eq(resources.isApproved, true)];
    
    if (category) {
      conditions.push(eq(resources.category, category));
    }
    
    return await db.select().from(resources)
      .where(and(...conditions))
      .orderBy(desc(resources.createdAt));
  }

  async getPendingResources(): Promise<Resource[]> {
    return await db.select().from(resources).where(eq(resources.isApproved, false));
  }

  async approveResource(resourceId: string, approverId: string): Promise<void> {
    await db
      .update(resources)
      .set({ isApproved: true, approvedBy: approverId })
      .where(eq(resources.id, resourceId));
  }

  async incrementResourceDownload(resourceId: string): Promise<void> {
    await db
      .update(resources)
      .set({ downloadCount: sql`${resources.downloadCount} + 1` })
      .where(eq(resources.id, resourceId));
  }

  // Prayer Wall
  async createPrayerWall(prayer: InsertPrayerWall): Promise<PrayerWall> {
    const [newPrayer] = await db.insert(prayerWall).values(prayer).returning();
    return newPrayer;
  }

  async getApprovedPrayerWall(): Promise<PrayerWall[]> {
    return await db.select().from(prayerWall).where(eq(prayerWall.isApproved, true)).orderBy(desc(prayerWall.createdAt));
  }

  async getPendingPrayerWall(): Promise<PrayerWall[]> {
    return await db.select().from(prayerWall).where(eq(prayerWall.isApproved, false));
  }

  async approvePrayerWall(prayerId: string, approverId: string): Promise<void> {
    await db
      .update(prayerWall)
      .set({ isApproved: true, approvedBy: approverId })
      .where(eq(prayerWall.id, prayerId));
  }

  async createPrayerSupport(support: InsertPrayerSupport): Promise<PrayerSupport> {
    const [newSupport] = await db.insert(prayerSupport).values(support).returning();
    
    // Update praying count
    const supportCount = await db
      .select({ count: count() })
      .from(prayerSupport)
      .where(eq(prayerSupport.prayerWallId, support.prayerWallId));
    
    await db
      .update(prayerWall)
      .set({ prayingCount: supportCount[0].count })
      .where(eq(prayerWall.id, support.prayerWallId));
    
    return newSupport;
  }

  async getUserPrayerSupport(userId: string, prayerId: string): Promise<PrayerSupport | undefined> {
    const [support] = await db
      .select()
      .from(prayerSupport)
      .where(and(eq(prayerSupport.userId, userId), eq(prayerSupport.prayerWallId, prayerId)));
    return support;
  }

  // Job Board
  async createJobPost(job: InsertJobPost): Promise<JobPost> {
    const [newJob] = await db.insert(jobPosts).values(job).returning();
    return newJob;
  }

  async getApprovedJobPosts(): Promise<JobPost[]> {
    return await db.select().from(jobPosts).where(eq(jobPosts.isApproved, true)).orderBy(desc(jobPosts.createdAt));
  }

  async getPendingJobPosts(): Promise<JobPost[]> {
    return await db.select().from(jobPosts).where(eq(jobPosts.isApproved, false));
  }

  async approveJobPost(jobId: string, approverId: string): Promise<void> {
    await db
      .update(jobPosts)
      .set({ isApproved: true, approvedBy: approverId })
      .where(eq(jobPosts.id, jobId));
  }

  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const [newApplication] = await db.insert(jobApplications).values(application).returning();
    
    // Update application count
    const appCount = await db
      .select({ count: count() })
      .from(jobApplications)
      .where(eq(jobApplications.jobPostId, application.jobPostId));
    
    await db
      .update(jobPosts)
      .set({ applicationCount: appCount[0].count })
      .where(eq(jobPosts.id, application.jobPostId));
    
    return newApplication;
  }

  async getUserJobApplication(userId: string, jobId: string): Promise<JobApplication | undefined> {
    const [application] = await db
      .select()
      .from(jobApplications)
      .where(and(eq(jobApplications.applicantId, userId), eq(jobApplications.jobPostId, jobId)));
    return application;
  }

  // Mentorship
  async createMentorship(mentorship: InsertMentorship): Promise<Mentorship> {
    const [newMentorship] = await db.insert(mentorships).values(mentorship).returning();
    return newMentorship;
  }

  async getAvailableMentors(): Promise<Mentorship[]> {
    return await db
      .select()
      .from(mentorships)
      .where(and(eq(mentorships.isMentor, true), eq(mentorships.status, "available")));
  }

  async getMenteeRequests(): Promise<Mentorship[]> {
    return await db
      .select()
      .from(mentorships)
      .where(and(eq(mentorships.isMentor, false), eq(mentorships.status, "available")));
  }

  async getMentorshipMatches(): Promise<{ mentor: User; mentee: User; mentorship: Mentorship }[]> {
    const matches = await db
      .select()
      .from(mentorships)
      .where(eq(mentorships.status, "matched"));
    
    const results = [];
    for (const match of matches) {
      const [mentor] = await db.select().from(users).where(eq(users.id, match.mentorId));
      const [mentee] = await db.select().from(users).where(eq(users.id, match.menteeId!));
      results.push({ mentor, mentee, mentorship: match });
    }
    
    return results;
  }

  // Fellowship History
  async createFellowshipHistory(history: InsertFellowshipHistory): Promise<FellowshipHistory> {
    const [newHistory] = await db.insert(fellowshipHistory).values(history).returning();
    return newHistory;
  }

  async getFellowshipHistory(): Promise<FellowshipHistory[]> {
    return await db.select().from(fellowshipHistory).orderBy(desc(fellowshipHistory.year));
  }

  // Admin functions
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUserStats(): Promise<{ totalAlumni: number; activeMembers: number; totalEvents: number; totalJobs: number }> {
    const [totalAlumni] = await db.select({ count: count() }).from(users);
    const [activeMembers] = await db.select({ count: count() }).from(users); // Could be filtered by last login
    const [totalEvents] = await db.select({ count: count() }).from(announcements).where(eq(announcements.isEvent, true));
    const [totalJobs] = await db.select({ count: count() }).from(jobPosts).where(eq(jobPosts.isApproved, true));
    
    return {
      totalAlumni: totalAlumni.count,
      activeMembers: activeMembers.count, // For now, same as total
      totalEvents: totalEvents.count,
      totalJobs: totalJobs.count,
    };
  }

  async getTodaysBirthdays(): Promise<User[]> {
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();
    
    return await db
      .select()
      .from(users)
      .where(
        sql`EXTRACT(MONTH FROM ${users.birthday}) = ${todayMonth} AND EXTRACT(DAY FROM ${users.birthday}) = ${todayDay}`
      );
  }

  async searchUsers(query: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        or(
          like(users.firstName, `%${query}%`),
          like(users.lastName, `%${query}%`),
          like(users.email, `%${query}%`)
        )
      );
  }
}

export const storage = new DatabaseStorage();
