import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, RefreshCw } from "lucide-react";
import JobCard from "../components/jobs/JobCard";
import JobDialog from "../components/jobs/JobDialog";
import Pagination from "../components/common/Pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => base44.entities.Jobs.list("-created_date"),
    initialData: [],
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true, // Refresh when component mounts
    refetchOnWindowFocus: true, // Refresh when window regains focus
  });

  const createJobMutation = useMutation({
    mutationFn: (jobData) => base44.entities.Jobs.create(jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setDialogOpen(false);
      setSelectedJob(null);
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, jobData }) => base44.entities.Jobs.update(id, jobData),
    onMutate: async ({ id, jobData }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["jobs"] });

      // Snapshot the previous value
      const previousJobs = queryClient.getQueryData(["jobs"]);

      // Optimistically update the jobs list
      queryClient.setQueryData(["jobs"], (old) => {
        return old.map((job) => (job.id === id ? { ...job, ...jobData } : job));
      });

      // Return context with the snapshotted value
      return { previousJobs };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, roll back to the previous value
      if (context?.previousJobs) {
        queryClient.setQueryData(["jobs"], context.previousJobs);
      }
    },
    onSuccess: () => {
      // Refetch to ensure our optimistic update matches the server state
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setDialogOpen(false);
      setSelectedJob(null);
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: (id) => base44.entities.Jobs.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    },
  });

  const handleSave = (jobData) => {
    if (selectedJob) {
      // Merge existing job data with updates to ensure no fields are lost
      const mergedJobData = { ...selectedJob, ...jobData };
      updateJobMutation.mutate({ id: selectedJob.id, jobData: mergedJobData });
    } else {
      createJobMutation.mutate(jobData);
    }
  };

  const handleEdit = (job) => {
    setSelectedJob(job);
    setDialogOpen(true);
  };

  const handleDelete = (job) => {
    setJobToDelete(job);
    setDeleteDialogOpen(true);
  };

  const handleApprove = (job, status) => {
    updateJobMutation.mutate({
      id: job.id,
      jobData: { ...job, approval_status: status },
    });
  };

  const confirmDelete = () => {
    if (jobToDelete) {
      deleteJobMutation.mutate(jobToDelete.id);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.approval_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: jobs.filter((j) => j.approval_status === "pending").length,
    approved: jobs.filter((j) => j.approval_status === "approved").length,
    rejected: jobs.filter((j) => j.approval_status === "rejected").length,
  };

  // Pagination logic
  const totalItems = filteredJobs.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600 mt-1">Review and manage job listings</p>
        </div>
        <Button
          onClick={() => {
            setSelectedJob(null);
            setDialogOpen(true);
          }}
          className="ripple-button bg-[#046645] hover:bg-[#035538]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Job
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg card-elevation">
          <p className="text-sm font-medium text-yellow-800">Pending Approval</p>
          <p className="text-3xl font-bold text-yellow-900 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg card-elevation">
          <p className="text-sm font-medium text-green-800">Approved</p>
          <p className="text-3xl font-bold text-green-900 mt-2">{stats.approved}</p>
        </div>
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg card-elevation">
          <p className="text-sm font-medium text-red-800">Rejected</p>
          <p className="text-3xl font-bold text-red-900 mt-2">{stats.rejected}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 card-elevation">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search jobs by title or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["jobs"] })}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 card-elevation">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onApprove={handleApprove}
            />
          ))}
        </div>

        {filteredJobs.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No jobs found</p>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      <JobDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
        onSave={handleSave}
        isLoading={createJobMutation.isPending || updateJobMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the job listing for{" "}
              <strong>{jobToDelete?.title}</strong> at <strong>{jobToDelete?.company}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
