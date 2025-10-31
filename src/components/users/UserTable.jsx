import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserTable({ users, isLoading, onEdit, onDelete }) {
  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    return colors[status] || colors.active;
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      "Job Seeker": "bg-blue-100 text-blue-800 border-blue-200",
      "Employer": "bg-purple-100 text-purple-800 border-purple-200",
      "HR": "bg-pink-100 text-pink-800 border-pink-200",
      "Trainer": "bg-orange-100 text-orange-800 border-orange-200",
      "Creator": "bg-teal-100 text-teal-800 border-teal-200",
      "Admin": "bg-emerald-100 text-emerald-800 border-emerald-200",
    };
    return colors[role] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 card-elevation overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold text-gray-900">Name</TableHead>
            <TableHead className="font-semibold text-gray-900">Email</TableHead>
            <TableHead className="font-semibold text-gray-900">Role</TableHead>
            <TableHead className="font-semibold text-gray-900">Status</TableHead>
            <TableHead className="font-semibold text-gray-900">Location</TableHead>
            <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
              <TableCell className="font-medium">{user.full_name}</TableCell>
              <TableCell className="text-gray-600">{user.email}</TableCell>
              <TableCell>
                <Badge variant="outline" className={`border ${getRoleBadgeColor(user.exlity_role)}`}>
                  {user.exlity_role || "N/A"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`border ${getStatusColor(user.status)}`}>
                  {user.status || "active"}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-600">{user.location || "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(user)}
                    className="hover:bg-[#046645] hover:text-white transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(user)}
                    className="hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
