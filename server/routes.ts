import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  insertExecutivePostSchema,
  insertFamilyHeadSchema,
  insertOtherPostSchema,
  insertWorkerUnitSchema,
  insertMessageSchema,
  insertMediaSchema,
  insertAnnouncementSchema,
  insertRsvpSchema,
  insertResourceSchema,
  insertPrayerWallSchema,
  insertPrayerSupportSchema,
  insertJobPostSchema,
  insertJobApplicationSchema,
  insertMentorshipSchema,
  insertFellowshipHistorySchema,
} from "@shared/schema";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.get('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/users/:id/executive-posts', isAuthenticated, async (req, res) => {
    try {
      const posts = await storage.getUserExecutivePosts(req.params.id);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch executive posts" });
    }
  });

  app.post('/api/users/:id/executive-posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (userId !== req.params.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const postData = insertExecutivePostSchema.parse({ ...req.body, userId });
      const post = await storage.createExecutivePost(postData);
      res.json(post);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.get('/api/users/:id/worker-units', isAuthenticated, async (req, res) => {
    try {
      const units = await storage.getUserWorkerUnits(req.params.id);
      res.json(units);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch worker units" });
    }
  });

  app.post('/api/users/:id/worker-units', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (userId !== req.params.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const unitData = insertWorkerUnitSchema.parse({ ...req.body, userId });
      const unit = await storage.createWorkerUnit(unitData);
      res.json(unit);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/dashboard/birthdays', isAuthenticated, async (req, res) => {
    try {
      const birthdays = await storage.getTodaysBirthdays();
      res.json(birthdays);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch birthdays" });
    }
  });

  // Chat routes
  app.get('/api/chat/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/chat/messages/:otherUserId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getConversation(userId, req.params.otherUserId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({ ...req.body, senderId });
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  app.post('/api/chat/mark-read', isAuthenticated, async (req: any, res) => {
    try {
      const receiverId = req.user.claims.sub;
      const { senderId } = req.body;
      await storage.markMessagesAsRead(receiverId, senderId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  // Directory routes
  app.get('/api/directory', isAuthenticated, async (req, res) => {
    try {
      const { search } = req.query;
      let users;
      
      if (search && typeof search === 'string') {
        users = await storage.searchUsers(search);
      } else {
        users = await storage.getAllUsers();
      }
      
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch directory" });
    }
  });

  // Gallery routes
  app.get('/api/gallery', isAuthenticated, async (req, res) => {
    try {
      const { eventType, session } = req.query;
      const media = await storage.getApprovedMedia(
        eventType as string,
        session as string
      );
      res.json(media);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gallery" });
    }
  });

  app.post('/api/gallery', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const uploaderId = req.user.claims.sub;
      const mediaData = insertMediaSchema.parse({
        uploaderId,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        eventType: req.body.eventType,
        session: req.body.session,
        description: req.body.description,
      });

      const media = await storage.createMedia(mediaData);
      res.json(media);
    } catch (error) {
      res.status(400).json({ message: "Invalid media data" });
    }
  });

  // Announcements routes
  app.get('/api/announcements', isAuthenticated, async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post('/api/announcements', isAuthenticated, async (req: any, res) => {
    try {
      const authorId = req.user.claims.sub;
      const announcementData = insertAnnouncementSchema.parse({ ...req.body, authorId });
      const announcement = await storage.createAnnouncement(announcementData);
      res.json(announcement);
    } catch (error) {
      res.status(400).json({ message: "Invalid announcement data" });
    }
  });

  app.post('/api/announcements/:id/rsvp', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const rsvpData = insertRsvpSchema.parse({
        userId,
        announcementId: req.params.id,
        response: req.body.response,
      });
      const rsvp = await storage.createRsvp(rsvpData);
      res.json(rsvp);
    } catch (error) {
      res.status(400).json({ message: "Invalid RSVP data" });
    }
  });

  app.get('/api/announcements/:id/rsvp', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const rsvp = await storage.getUserRsvp(userId, req.params.id);
      res.json(rsvp);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch RSVP" });
    }
  });

  // Resources routes
  app.get('/api/resources', isAuthenticated, async (req, res) => {
    try {
      const { category } = req.query;
      const resources = await storage.getApprovedResources(category as string);
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  app.post('/api/resources', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const uploaderId = req.user.claims.sub;
      const resourceData = insertResourceSchema.parse({
        uploaderId,
        title: req.body.title,
        description: req.body.description,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        category: req.body.category,
      });

      const resource = await storage.createResource(resourceData);
      res.json(resource);
    } catch (error) {
      res.status(400).json({ message: "Invalid resource data" });
    }
  });

  app.post('/api/resources/:id/download', isAuthenticated, async (req, res) => {
    try {
      await storage.incrementResourceDownload(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to record download" });
    }
  });

  // Prayer Wall routes
  app.get('/api/prayer-wall', isAuthenticated, async (req, res) => {
    try {
      const prayers = await storage.getApprovedPrayerWall();
      res.json(prayers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch prayer wall" });
    }
  });

  app.post('/api/prayer-wall', isAuthenticated, async (req: any, res) => {
    try {
      const authorId = req.user.claims.sub;
      const prayerData = insertPrayerWallSchema.parse({ ...req.body, authorId });
      const prayer = await storage.createPrayerWall(prayerData);
      res.json(prayer);
    } catch (error) {
      res.status(400).json({ message: "Invalid prayer data" });
    }
  });

  app.post('/api/prayer-wall/:id/support', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const supportData = insertPrayerSupportSchema.parse({
        userId,
        prayerWallId: req.params.id,
      });
      const support = await storage.createPrayerSupport(supportData);
      res.json(support);
    } catch (error) {
      res.status(400).json({ message: "Invalid support data" });
    }
  });

  app.get('/api/prayer-wall/:id/support', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const support = await storage.getUserPrayerSupport(userId, req.params.id);
      res.json(support);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch prayer support" });
    }
  });

  // Job Board routes
  app.get('/api/jobs', isAuthenticated, async (req, res) => {
    try {
      const jobs = await storage.getApprovedJobPosts();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.post('/api/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const posterId = req.user.claims.sub;
      const jobData = insertJobPostSchema.parse({ ...req.body, posterId });
      const job = await storage.createJobPost(jobData);
      res.json(job);
    } catch (error) {
      res.status(400).json({ message: "Invalid job data" });
    }
  });

  app.post('/api/jobs/:id/apply', isAuthenticated, async (req: any, res) => {
    try {
      const applicantId = req.user.claims.sub;
      const applicationData = insertJobApplicationSchema.parse({
        applicantId,
        jobPostId: req.params.id,
        coverLetter: req.body.coverLetter,
      });
      const application = await storage.createJobApplication(applicationData);
      res.json(application);
    } catch (error) {
      res.status(400).json({ message: "Invalid application data" });
    }
  });

  app.get('/api/jobs/:id/application', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const application = await storage.getUserJobApplication(userId, req.params.id);
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  // Mentorship routes
  app.get('/api/mentorship/mentors', isAuthenticated, async (req, res) => {
    try {
      const mentors = await storage.getAvailableMentors();
      res.json(mentors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mentors" });
    }
  });

  app.get('/api/mentorship/mentees', isAuthenticated, async (req, res) => {
    try {
      const mentees = await storage.getMenteeRequests();
      res.json(mentees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mentees" });
    }
  });

  app.get('/api/mentorship/matches', isAuthenticated, async (req, res) => {
    try {
      const matches = await storage.getMentorshipMatches();
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  app.post('/api/mentorship', isAuthenticated, async (req: any, res) => {
    try {
      const mentorId = req.user.claims.sub;
      const mentorshipData = insertMentorshipSchema.parse({ ...req.body, mentorId });
      const mentorship = await storage.createMentorship(mentorshipData);
      res.json(mentorship);
    } catch (error) {
      res.status(400).json({ message: "Invalid mentorship data" });
    }
  });

  // Fellowship History routes
  app.get('/api/timeline', isAuthenticated, async (req, res) => {
    try {
      const history = await storage.getFellowshipHistory();
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timeline" });
    }
  });

  app.post('/api/timeline', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const historyData = insertFellowshipHistorySchema.parse(req.body);
      const history = await storage.createFellowshipHistory(historyData);
      res.json(history);
    } catch (error) {
      res.status(400).json({ message: "Invalid history data" });
    }
  });

  // Admin routes
  app.get('/api/admin/pending-media', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const pendingMedia = await storage.getPendingMedia();
      res.json(pendingMedia);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending media" });
    }
  });

  app.post('/api/admin/approve-media/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.approveMedia(req.params.id, req.user.claims.sub);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to approve media" });
    }
  });

  app.get('/api/admin/pending-resources', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const pendingResources = await storage.getPendingResources();
      res.json(pendingResources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending resources" });
    }
  });

  app.post('/api/admin/approve-resource/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.approveResource(req.params.id, req.user.claims.sub);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to approve resource" });
    }
  });

  app.get('/api/admin/pending-prayers', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const pendingPrayers = await storage.getPendingPrayerWall();
      res.json(pendingPrayers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending prayers" });
    }
  });

  app.post('/api/admin/approve-prayer/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.approvePrayerWall(req.params.id, req.user.claims.sub);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to approve prayer" });
    }
  });

  app.get('/api/admin/pending-jobs', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const pendingJobs = await storage.getPendingJobPosts();
      res.json(pendingJobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending jobs" });
    }
  });

  app.post('/api/admin/approve-job/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.approveJobPost(req.params.id, req.user.claims.sub);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to approve job" });
    }
  });

  // Admin role management routes
  app.post("/api/admin/update-user-role/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId } = req.params;
      const { role, canPostAnnouncements } = req.body;
      
      await storage.updateUserRole(userId, role, canPostAnnouncements);
      res.json({ message: "User role updated successfully" });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.post("/api/admin/assign-post", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId, postType, session, department, academicLevel } = req.body;
      
      // Update user academic info first
      if (department || academicLevel) {
        await storage.updateUserAcademicInfo(userId, { department, academicLevel });
      }

      // Assign the specific post
      if (postType === "executive") {
        await storage.createExecutivePost({
          userId,
          postTitle: req.body.postTitle,
          session,
        });
      } else if (postType === "family") {
        await storage.createFamilyHead({
          userId,
          familyName: req.body.familyName,
          session,
        });
      } else if (postType === "worker") {
        await storage.createWorkerUnit({
          userId,
          unitName: req.body.unitName,
          session,
        });
      } else if (postType === "other") {
        await storage.createOtherPost({
          userId,
          postTitle: req.body.postTitle,
          session,
        });
      }

      // Log the role assignment activity
      await storage.logUserActivity({
        userId,
        activityType: "post_assigned",
        description: `Assigned ${postType} post by admin`,
        metadata: { postType, session, assignedBy: req.user.claims.sub },
      });

      res.json({ message: "Post assigned successfully" });
    } catch (error) {
      console.error("Error assigning post:", error);
      res.status(500).json({ message: "Failed to assign post" });
    }
  });

  // Advanced admin features
  app.get("/api/admin/users/filter", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { role, withoutPosts, session } = req.query;
      
      let users = [];
      if (role) {
        users = await storage.getUsersByRole(role as string);
      } else if (withoutPosts === 'true') {
        users = await storage.getUsersWithoutPosts();
      } else if (session) {
        const executivePosts = await storage.getExecutivePostsBySession(session as string);
        const userIds = executivePosts.map(p => p.userId);
        users = await storage.getAllUsers();
        users = users.filter(u => userIds.includes(u.id));
      } else {
        users = await storage.getAllUsers();
      }

      res.json(users);
    } catch (error) {
      console.error("Error filtering users:", error);
      res.status(500).json({ message: "Failed to filter users" });
    }
  });

  app.post("/api/admin/bulk-update-roles", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { updates } = req.body;
      await storage.bulkUpdateUserRoles(updates);

      // Log bulk update activity
      await storage.logUserActivity({
        userId: req.user.claims.sub,
        activityType: "bulk_role_update",
        description: `Updated roles for ${updates.length} users`,
        metadata: { updateCount: updates.length },
      });

      res.json({ message: "Bulk role update completed successfully" });
    } catch (error) {
      console.error("Error in bulk update:", error);
      res.status(500).json({ message: "Failed to perform bulk update" });
    }
  });

  app.get("/api/admin/user/:userId/history", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId } = req.params;
      const [roleHistory, activityLog] = await Promise.all([
        storage.getUserRoleHistory(userId),
        storage.getUserActivityLog(userId),
      ]);

      res.json({ roleHistory, activityLog });
    } catch (error) {
      console.error("Error fetching user history:", error);
      res.status(500).json({ message: "Failed to fetch user history" });
    }
  });

  // Serve uploaded files
  app.use('/api/uploads', express.static(uploadDir));

  const httpServer = createServer(app);
  return httpServer;
}
