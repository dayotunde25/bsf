import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Briefcase, Plus, MapPin, Clock, DollarSign, Users, Building } from "lucide-react";

const jobTypes = [
  { value: "full-time", label: "Full-time", color: "bg-green-100 text-green-800" },
  { value: "part-time", label: "Part-time", color: "bg-blue-100 text-blue-800" },
  { value: "internship", label: "Internship", color: "bg-purple-100 text-purple-800" },
  { value: "contract", label: "Contract", color: "bg-orange-100 text-orange-800" },
];

export default function JobBoard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [postJobDialogOpen, setPostJobDialogOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const { data: jobsRaw, isLoading } = useQuery({
    queryKey: ['/api/jobs'],
  });
  // Ensure jobs is always an array
  const jobs: any[] = Array.isArray(jobsRaw) ? jobsRaw : [];

  const postJobMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/jobs", data);
    },
    onSuccess: () => {
      toast({
        title: "Job posted successfully",
        description: "Your job posting is pending admin approval.",
      });
      setPostJobDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: isUnauthorizedError(error) 
          ? "You must be logged in to post jobs" 
          : error?.message || "Failed to post job",
        variant: "destructive",
      });
    }
  });

  const applyMutation = useMutation({
    mutationFn: async (data: { jobPostId: string; coverLetter: string }) => {
      return await apiRequest("POST", `/api/jobs/${data.jobPostId}/apply`, {
        coverLetter: data.coverLetter,
      });
    },
    onSuccess: () => {
      toast({
        title: "Application submitted",
        description: "Your job application has been submitted successfully.",
      });
      setApplyDialogOpen(false);
      setSelectedJob(null);
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error submitting application",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePostJob = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const jobData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      company: formData.get('company') as string,
      location: formData.get('location') as string,
      jobType: formData.get('jobType') as string,
      salary: formData.get('salary') as string,
      deadline: formData.get('deadline') ? new Date(formData.get('deadline') as string).toISOString() : null,
    };

    postJobMutation.mutate(jobData);
  };

  const handleApply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    applyMutation.mutate({
      jobPostId: selectedJob.id,
      coverLetter: formData.get('coverLetter') as string,
    });
  };

  const getJobTypeColor = (jobType: string) => {
    return jobTypes.find(type => type.value === jobType)?.color || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="text-bsf-green" size={24} />
                Job Board
              </CardTitle>
              
              <Dialog open={postJobDialogOpen} onOpenChange={setPostJobDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-bsf-green text-white hover:bg-bsf-green-dark">
                    <Plus className="mr-2" size={16} />
                    Post Job
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Post a Job</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePostJob} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                          id="title"
                          name="title"
                          placeholder="e.g., Software Developer"
                          required
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          name="company"
                          placeholder="e.g., TechCorp Inc."
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          name="location"
                          placeholder="e.g., Remote, New York, NY"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="jobType">Job Type</Label>
                        <Select name="jobType" required>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                          <SelectContent>
                            {jobTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="salary">Salary Range</Label>
                        <Input
                          id="salary"
                          name="salary"
                          placeholder="e.g., $70k-90k"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="deadline">Application Deadline</Label>
                        <Input
                          id="deadline"
                          name="deadline"
                          type="date"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Job Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe the role, responsibilities, requirements..."
                        rows={6}
                        required
                        className="mt-1"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={postJobMutation.isPending}
                      className="w-full bg-bsf-green text-white hover:bg-bsf-green-dark"
                    >
                      {postJobMutation.isPending ? 'Posting...' : 'Post Job'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
        </Card>

        {/* Job Listings */}
        <div className="grid gap-6">
          {jobs?.map((job: any) => (
            <Card key={job.id} className="hover-lift">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-dark-gray mb-1">{job.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Building size={14} />
                            <span>{job.company}</span>
                          </div>
                          {job.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin size={14} />
                              <span>{job.location}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Badge className={getJobTypeColor(job.jobType)}>
                        {jobTypes.find(type => type.value === job.jobType)?.label || job.jobType}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {job.salary && (
                          <div className="flex items-center space-x-1">
                            <DollarSign size={14} />
                            <span>{job.salary}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Users size={14} />
                          <span>{job.applicationCount} applicants</span>
                        </div>
                        {job.deadline && (
                          <div className="text-red-600">
                            Deadline: {new Date(job.deadline).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => {
                          setSelectedJob(job);
                          setApplyDialogOpen(true);
                        }}
                        className="bg-bsf-green text-white hover:bg-bsf-green-dark"
                      >
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!jobs?.length && (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="mx-auto mb-4 text-gray-300" size={64} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No job postings yet</h3>
              <p className="text-gray-500 mb-4">
                Be the first to share career opportunities with fellow alumni
              </p>
              <Button 
                onClick={() => setPostJobDialogOpen(true)}
                className="bg-bsf-green text-white hover:bg-bsf-green-dark"
              >
                <Plus className="mr-2" size={16} />
                Post First Job
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Apply Dialog */}
        <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <Label htmlFor="coverLetter">Cover Letter</Label>
                <Textarea
                  id="coverLetter"
                  name="coverLetter"
                  placeholder="Write a brief cover letter explaining why you're interested in this position..."
                  rows={6}
                  required
                  className="mt-1"
                />
              </div>
              
              <Button
                type="submit"
                disabled={applyMutation.isPending}
                className="w-full bg-bsf-green text-white hover:bg-bsf-green-dark"
              >
                {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
