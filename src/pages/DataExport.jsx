import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Database, CheckCircle, Copy, RefreshCw } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DataExportPage() {
  const [sqlOutput, setSqlOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["export-users"],
    queryFn: () => base44.entities.Users.list(),
    initialData: [],
    enabled: false,
  });

  const { data: jobs, isLoading: loadingJobs } = useQuery({
    queryKey: ["export-jobs"],
    queryFn: () => base44.entities.Jobs.list(),
    initialData: [],
    enabled: false,
  });

  const { data: employers, isLoading: loadingEmployers } = useQuery({
    queryKey: ["export-employers"],
    queryFn: () => base44.entities.Employers.list(),
    initialData: [],
    enabled: false,
  });

  const escapeSQL = (value) => {
    if (value === null || value === undefined) return "NULL";
    if (typeof value === "string") {
      return `'${value.replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
    }
    if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
    if (typeof value === "number") return value;
    if (value instanceof Date || typeof value === "string" && !isNaN(Date.parse(value))) {
      const date = new Date(value);
      return `'${date.toISOString()}'`;
    }
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  };

  const generateUUID = () => {
    return "gen_random_uuid()";
  };

  const generateSQL = async () => {
    setExporting(true);
    
    try {
      const [fetchedUsers, fetchedJobs, fetchedEmployers] = await Promise.all([
        base44.entities.Users.list(),
        base44.entities.Jobs.list(),
        base44.entities.Employers.list(),
      ]);

      let sql = "-- Exlity Data Export for Supabase PostgreSQL\n";
      sql += "-- Generated on: " + new Date().toISOString() + "\n\n";
      sql += "-- Enable UUID extension if not already enabled\n";
      sql += "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";\n\n";

      // Create tables
      sql += "-- =============================================\n";
      sql += "-- TABLE DEFINITIONS\n";
      sql += "-- =============================================\n\n";

      sql += "-- Users Table\n";
      sql += `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    exlity_role VARCHAR(50),
    phone VARCHAR(50),
    company VARCHAR(255),
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);\n\n`;

      sql += "-- Jobs Table\n";
      sql += `CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    salary_range VARCHAR(100),
    description TEXT,
    requirements TEXT,
    approval_status VARCHAR(50) DEFAULT 'pending',
    posted_by VARCHAR(255),
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    FOREIGN KEY (posted_by) REFERENCES users(email) ON DELETE SET NULL
);\n\n`;

      sql += "-- Employer Profiles Table\n";
      sql += `CREATE TABLE IF NOT EXISTS employer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    company_size VARCHAR(50),
    website VARCHAR(500),
    description TEXT,
    location VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);\n\n`;

      sql += "-- Create indexes for better performance\n";
      sql += "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);\n";
      sql += "CREATE INDEX IF NOT EXISTS idx_users_exlity_role ON users(exlity_role);\n";
      sql += "CREATE INDEX IF NOT EXISTS idx_jobs_approval_status ON jobs(approval_status);\n";
      sql += "CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);\n\n";

      // Insert data
      sql += "-- =============================================\n";
      sql += "-- DATA INSERTION\n";
      sql += "-- =============================================\n\n";

      // Users
      if (fetchedUsers.length > 0) {
        sql += "-- Insert Users\n";
        fetchedUsers.forEach((user) => {
          sql += `INSERT INTO users (id, email, full_name, role, exlity_role, phone, company, location, status, created_date, updated_date) VALUES (
    ${generateUUID()},
    ${escapeSQL(user.email)},
    ${escapeSQL(user.full_name)},
    ${escapeSQL(user.role || 'user')},
    ${escapeSQL(user.exlity_role)},
    ${escapeSQL(user.phone)},
    ${escapeSQL(user.company)},
    ${escapeSQL(user.location)},
    ${escapeSQL(user.status || 'active')},
    ${escapeSQL(user.created_date)},
    ${escapeSQL(user.updated_date || user.created_date)}
);\n`;
        });
        sql += "\n";
      }

      // Jobs
      if (fetchedJobs.length > 0) {
        sql += "-- Insert Jobs\n";
        fetchedJobs.forEach((job) => {
          sql += `INSERT INTO jobs (id, title, company, location, type, salary_range, description, requirements, approval_status, posted_by, created_date, updated_date, created_by) VALUES (
    ${generateUUID()},
    ${escapeSQL(job.title)},
    ${escapeSQL(job.company)},
    ${escapeSQL(job.location)},
    ${escapeSQL(job.type)},
    ${escapeSQL(job.salary_range)},
    ${escapeSQL(job.description)},
    ${escapeSQL(job.requirements)},
    ${escapeSQL(job.approval_status || 'pending')},
    ${escapeSQL(job.posted_by)},
    ${escapeSQL(job.created_date)},
    ${escapeSQL(job.updated_date || job.created_date)},
    ${escapeSQL(job.created_by)}
);\n`;
        });
        sql += "\n";
      }

      // Employers
      if (fetchedEmployers.length > 0) {
        sql += "-- Insert Employer Profiles\n";
        fetchedEmployers.forEach((employer) => {
          sql += `INSERT INTO employer_profiles (id, company_name, industry, company_size, website, description, location, contact_email, contact_phone, created_date, updated_date, created_by) VALUES (
    ${generateUUID()},
    ${escapeSQL(employer.company_name)},
    ${escapeSQL(employer.industry)},
    ${escapeSQL(employer.company_size)},
    ${escapeSQL(employer.website)},
    ${escapeSQL(employer.description)},
    ${escapeSQL(employer.location)},
    ${escapeSQL(employer.contact_email)},
    ${escapeSQL(employer.contact_phone)},
    ${escapeSQL(employer.created_date)},
    ${escapeSQL(employer.updated_date || employer.created_date)},
    ${escapeSQL(employer.created_by)}
);\n`;
        });
        sql += "\n";
      }

      sql += "-- =============================================\n";
      sql += "-- Export Complete\n";
      sql += `-- Total Users: ${fetchedUsers.length}\n`;
      sql += `-- Total Jobs: ${fetchedJobs.length}\n`;
      sql += `-- Total Employer Profiles: ${fetchedEmployers.length}\n`;
      sql += "-- =============================================\n";

      setSqlOutput(sql);
    } catch (error) {
      console.error("Export error:", error);
      setSqlOutput("-- Error generating export: " + error.message);
    } finally {
      setExporting(false);
    }
  };

  const downloadSQL = () => {
    const blob = new Blob([sqlOutput], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `exlity-export-${new Date().toISOString().split("T")[0]}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Export</h1>
          <p className="text-gray-600 mt-1">Export your data for Supabase PostgreSQL migration</p>
        </div>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Database className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          This export generates SQL INSERT statements compatible with Supabase PostgreSQL. 
          It includes table definitions, proper UUIDs, timestamps, and foreign key relationships.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-elevation">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Records
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevation">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">{jobs.length}</p>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Records
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevation">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Employers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">{employers.length}</p>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Records
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-elevation">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>SQL Export</CardTitle>
            <Button
              onClick={generateSQL}
              disabled={exporting}
              className="ripple-button bg-[#046645] hover:bg-[#035538]"
            >
              {exporting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Generate SQL Export
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sqlOutput ? (
            <>
              <div className="flex gap-2">
                <Button
                  onClick={downloadSQL}
                  variant="outline"
                  className="ripple-button"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download SQL File
                </Button>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="ripple-button"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
              </div>

              <Tabs defaultValue="preview" className="w-full">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="instructions">Migration Instructions</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-4">
                  <Textarea
                    value={sqlOutput}
                    readOnly
                    className="font-mono text-xs h-96 bg-gray-50"
                  />
                </TabsContent>
                <TabsContent value="instructions" className="mt-4">
                  <div className="bg-gray-50 p-6 rounded-lg space-y-4 text-sm">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Step 1: Prepare Supabase</h3>
                      <p className="text-gray-700">Log into your Supabase dashboard and navigate to the SQL Editor.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Step 2: Execute SQL</h3>
                      <p className="text-gray-700">Copy the generated SQL or upload the downloaded .sql file and execute it in the SQL Editor.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Step 3: Verify Data</h3>
                      <p className="text-gray-700">Check the Table Editor to confirm all data has been imported correctly.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Step 4: Configure Auth (Optional)</h3>
                      <p className="text-gray-700">If needed, set up Supabase Auth and link user records to authentication profiles.</p>
                    </div>
                    <Alert className="bg-yellow-50 border-yellow-200 mt-4">
                      <AlertDescription className="text-yellow-800 text-xs">
                        <strong>Note:</strong> Passwords are not exported for security reasons. You'll need to handle authentication setup separately in Supabase.
                      </AlertDescription>
                    </Alert>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Click "Generate SQL Export" to create your migration file</p>
              <p className="text-sm text-gray-500 mt-2">
                All data will be formatted with proper UUIDs, timestamps, and escaping
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}