import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  MessageCircle,
  Camera,
  Briefcase,
  Heart,
  BookOpen,
  Calendar,
  HandHeart as PrayingHands,
  GraduationCap,
  Church,
  HandHeart,
  Globe
} from "lucide-react";
const bsfLogo = "/assets/BSF_1753800735615.png";
const bsffpiLogo = "/assets/BSFFPI_1753800735616.jpg";

export default function Landing() {
  const features = [
    {
      icon: Users,
      title: "Alumni Directory",
      description: "Connect with fellow BSF graduates and maintain lifelong friendships"
    },
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description: "Stay in touch with one-on-one messaging and group conversations"
    },
    {
      icon: Camera,
      title: "Memory Gallery",
      description: "Share photos and memories from fellowship events and gatherings"
    },
    {
      icon: Briefcase,
      title: "Job Board",
      description: "Find career opportunities and help each other professionally"
    },
    {
      icon: Heart,
      title: "Mentorship Program",
      description: "Guide younger believers and seek wisdom from experienced mentors"
    },
    {
      icon: BookOpen,
      title: "Resource Library",
      description: "Access devotionals, sermons, and spiritual growth materials"
    },
    {
      icon: Calendar,
      title: "Fellowship Timeline",
      description: "Celebrate milestones and remember our shared history"
    },
    {
      icon: PrayingHands,
      title: "Prayer Wall",
      description: "Share prayer requests and testimonies with the BSF community"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={bsfLogo} alt="BSF Logo" className="h-12 w-12 rounded-full" />
              <div>
                <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">
                  BSF Alumni Network
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Baptist Student Fellowship Community
                </p>
              </div>
            </div>
            <Button 
              asChild 
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
            >
              <a href="/login">Sign In</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center items-center space-x-8 mb-8">
            <img src={bsfLogo} alt="BSF Logo" className="h-24 w-24 rounded-full shadow-lg" />
            <img src={bsffpiLogo} alt="BSFFPI Logo" className="h-24 w-24 rounded-full shadow-lg" />
          </div>
          
          <h2 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Welcome Home to Your
            <span className="text-green-600 dark:text-green-400 block">
              BSF Alumni Family
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Stay connected with your Baptist Student Fellowship community. Share memories, 
            grow together in faith, and continue the bonds formed during your fellowship years.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              asChild
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-lg px-8 py-3"
            >
              <a href="/register">
                <GraduationCap className="mr-2 h-5 w-5" />
                Join Your Alumni Network
              </a>
            </Button>
            <Badge variant="secondary" className="text-sm py-2 px-4">
              <Church className="mr-2 h-4 w-4" />
              Established 1958 • BSFFPI 1983
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">65+</div>
              <div className="text-gray-600 dark:text-gray-400">Years of Fellowship</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">1000+</div>
              <div className="text-gray-600 dark:text-gray-400">Alumni Connected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">50+</div>
              <div className="text-gray-600 dark:text-gray-400">Countries Reached</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">∞</div>
              <div className="text-gray-600 dark:text-gray-400">Lives Impacted</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Everything You Need to Stay Connected
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our platform brings together all the tools you need to maintain and strengthen 
              your BSF community bonds, wherever life takes you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white border-0">
            <CardContent className="py-12">
              <HandHeart className="mx-auto h-16 w-16 mb-6 opacity-90" />
              <h3 className="text-3xl font-bold mb-4">
                Ready to Reconnect with Your BSF Family?
              </h3>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of BSF alumni who are already connected, sharing, 
                and growing together in this incredible community.
              </p>
              <Button 
                size="lg" 
                asChild
                variant="secondary"
                className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-3"
              >
                <a href="/register">
                  <Globe className="mr-2 h-5 w-5" />
                  Get Started Today
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-6 md:mb-0">
              <img src={bsfLogo} alt="BSF Logo" className="h-10 w-10 rounded-full" />
              <div>
                <h4 className="text-lg font-semibold">BSF Alumni Network</h4>
                <p className="text-gray-400 text-sm">Building lasting kingdom connections since 1958</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                © 2024 Baptist Student Fellowship. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Proudly serving the BSF and BSFFPI communities worldwide
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}