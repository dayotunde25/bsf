import { storage } from "./storage";

export async function initializeAdmin() {
  try {
    // Check if admin exists
    const existingAdmin = await storage.getUserByEmail("admin@bsffpi.org");
    
    if (!existingAdmin) {
      // Create admin user if it doesn't exist
      await storage.createUser({
        email: "admin@bsffpi.org",
        password: "bsffpi1983", // In production, this should be hashed
        firstName: "Admin",
        lastName: "User",
        role: "Admin",
        isAdmin: true,
        canPostAnnouncements: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("Admin user created successfully");
    }
  } catch (error) {
    console.error("Error initializing admin:", error);
  }
}
