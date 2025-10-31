import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, DollarSign, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";

export default function JobCard({ job, onEdit, onDelete, onApprove }) {
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || colors.pending;
  };

  return (
    <Card className="card-elevation hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-gray-900">{job.job_title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{job.company_name}</p>
          </div>
          <Badge variant="outline" className={`border ${getStatusColor(job.approval_status)}`}>
            {job.approval_status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {job.work_location}
          </div>
          {job.job_type && (
            <div className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              {job.job_type}
            </div>
          )}
          {job.salary_range && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {job.salary_range}
            </div>
          )}
        </div>

        {job.description && (
          <p className="text-sm text-gray-700 line-clamp-2">{job.description}</p>
        )}

        <div className="flex gap-2 pt-2">
          {job.approval_status === "pending" && (
            <>
              <Button
                size="sm"
                onClick={() => onApprove(job, "approved")}
                className="ripple-button bg-[#046645] hover:bg-[#035538] flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onApprove(job, "rejected")}
                className="ripple-button border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(job)}
            className="ripple-button"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(job)}
            className="ripple-button hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
