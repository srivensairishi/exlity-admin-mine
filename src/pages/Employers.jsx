import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, RefreshCw, Building2, Globe, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EmployerDialog from "../components/employers/EmployerDialog";
import Pagination from "../components/common/Pagination";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  const queryClient = useQueryClient();

  const { data: employers, isLoading } = useQuery({
    queryKey: ["employers"],
    queryFn: () => base44.entities.Employers.list("-created_date"),
    initialData: [],
  });

  const createEmployerMutation = useMutation({
    mutationFn: (employerData) => base44.entities.Employers.create(employerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employers"] });
      setDialogOpen(false);
    },
  });

  const handleSave = (employerData) => {
    createEmployerMutation.mutate(employerData);
  };

  const filteredEmployers = employers.filter(
    (employer) =>
      employer.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employer.business_sector?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employer.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalItems = filteredEmployers.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployers = filteredEmployers.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employer Profiles</h1>
          <p className="text-gray-600 mt-1">Create and manage employer accounts</p>
        </div>
        {/*
        
        
        <Button
          onClick={() => setDialogOpen(true)}
          className="ripple-button bg-[#046645] hover:bg-[#035538]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Employer Profile
        </Button>
        
        
        */}
        
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 card-elevation">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by company name, industry, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {filteredEmployers.length} {filteredEmployers.length === 1 ? "Profile" : "Profiles"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["employers"] })}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 card-elevation">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="card-elevation">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                  </CardContent>
                </Card>
              ))
          ) : paginatedEmployers.length > 0 ? (
            paginatedEmployers.map((employer) => (
              <Card key={employer.id} className="card-elevation hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-[#046645] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold text-gray-900 truncate">
                        {employer.company_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{employer.business_sector}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {employer.description && (
                    <p className="text-sm text-gray-700 line-clamp-2">{employer.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    {employer.business_address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {employer.business_address}
                      </div>
                    )}
                    {employer.company_website && (
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        <a
                          href={employer.company_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#046645] hover:underline"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                  {employer.company_size && (
                    <Badge variant="outline" className="bg-gray-50">
                      {employer.company_size} employees
                    </Badge>
                  )}
                  {(employer.official_email || employer.contact_mobile) && (
                    <div className="pt-2 border-t text-xs text-gray-500 space-y-1">
                      {employer.official_email && <div>Email: {employer.official_email}</div>}
                      {employer.contact_mobile && <div>Phone: {employer.contact_mobile}</div>}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No employer profiles found</p>
            </div>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      <EmployerDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        isLoading={createEmployerMutation.isPending}
      />
    </div>
  );
}
