import { base44 } from './base44Client';


export const Job = base44.entities.Job;

export const EmployerProfile = base44.entities.EmployerProfile;

// Add Users entity for proper CRUD operations
export const Users = base44.entities.Users;

// auth sdk:
export const User = base44.auth;